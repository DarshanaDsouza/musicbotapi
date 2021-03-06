

'use strict';

var express = require('express'); // app server
var router = express.Router();
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk

var app = express();

// for music
var fs = require('fs');
var request = require('request-promise');
var cheerio = require('cheerio');
var youtubedl = require('youtube-dl');


// music till here

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  'username': 'b1b0a4de-121c-4c3c-80f7-4ca29bc0b181',
  'password': '6vRV8P8GeQio',
  'version_date': '2017-05-26'
});




//End point for getting Youtube Info
app.post('/api/playmusic', function(req,res){


var url = "https://www.youtube.com/results?search_query=" + req.body.q + '+ official video'


var options = {
	uri: url,
	transform: function(body){
		return cheerio.load(body);
	}
}

const  json=[]
request(options)
	.then (function ($){
		 $('a').each((index, value)=>{
			
			var link = $(value).attr('href');
			var patrn = "/watch"
			if (link.indexOf(patrn) !== -1)
				{
	 			 var newurl = "https://www.youtube.com" + link
				 var vid = link.split("=")[1]
                                 var thumbnailurl = "https://img.youtube.com/vi/" + vid + "/mqdefault.jpg"
				 json.push({title: "Title", url: newurl, thumbnailurl: thumbnailurl, videoid: vid});
				 /*json.url = newurl
				 json.thumbnailurl = thumbnailurl
				 json.title = "Title"
				 json.videoid= vid*/
				

				//return false
			
			
				return false	
		 		}
		 });
	 	 console.log(json)
	       	 return res.json(json)
                 
				
	})
	.catch(function (err){
		console.log("error enc : ", err)
	})

				
});

// Endpoint to be call from the client side for Watson chat
app.post('/api/message', function(req, res) {
  var workspace = 'da356020-08ea-4d5e-89fd-16d76d63de6e';
  //var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  //if (!workspace || workspace === '<workspace-id>') {
  //  return res.json({
  //    'output': {
  //      'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. '
  //    }
  //  });
  //}
  

  //var contxt = ""
  //var inp = " "
  var payload = {
    workspace_id: workspace,
    context:  req.body.context ||{},
    input:  req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
   // payload.context = data.context
    return res.json(updateMessage(payload, data));
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
     } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  response
  return response;
}


app.get('/', function (req, res) {
    res.send("Hello World!");
});


//web scrapping - to test end point - to be removed
app.get('/playsong', function(req,res){

var fetch = require('node-fetch');

fetch('http://localhost:5000/api/playmusic', {
    method: 'POST',
    body: JSON.stringify({
      q: 'main kaun hoon'
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  })
.then(function(response){
    return response.json();
})
.then(function(AuthJson){
	 var postcnt = 0;
	 var AuthHolder = ''
		  for ( var i = 0; i < AuthJson.length; i++)
		            
		      {     AuthHolder = AuthHolder + 'Title:  '+ AuthJson[i].title+  '   url :'+ AuthJson[i].url +'<br>';
			    //console.log("authholder", AuthHolder)
			    
		//	    postcnt = 0;  
		      }
		      //res.send(AuthJson)
	               res.send(AuthHolder)
		});
});



// chat - to test end point - to be removed
app.get('/chat', function(req,res){
var querystring = require('querystring');



var inp = 'artist jagjit singh'
var vcontext = {}

var fetch = require('node-fetch');

fetch('http://localhost:5000/api/message', {
    method: 'POST',
    body: JSON.stringify({ input : {text: inp}, context : vcontext} ),
    headers: {
     'Content-Type':'application/json; charset=UTF-8'
    }
  })
.then(function(response){
    return response.json();
})
.then(function(AuthJson){
	 var postcnt = 0;
	 var AuthHolder = ''
         res.send(AuthJson);
		});
});




module.exports = app;


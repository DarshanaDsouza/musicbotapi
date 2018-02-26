

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk

var app = express();

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
  'username': process.env.CONVERSATION_USERNAME,
  'password': process.env.CONVERSATION_PASSWORD,
  'version_date': '2017-05-26'
});

//youtube
const google = require('googleapis');
const sampleClient = require('../sampleclient');
var resultarr = [];

// initialize the Youtube API library
const youtube = google.youtube({
  version: 'v3',
  auth: sampleClient.oAuth2Client
});

const scopes = ['https://www.googleapis.com/auth/youtube'];

sampleClient.authenticate(scopes, err => {
  if (err) {
       return res.json({
      'output': {
        'text': 'Error authenticating youtube api '
      }
	})
  }
});
// youtube till here

// Endpoint to be call from the client side
app.post('/api/playlist', function(req, res) {
  
 	
 youtube.search.list({
	    part: 'id,snippet',
	    q: req.body.q || {},
	    maxResults: '10'	  
	  }, (err, data) => {
		  if (err) {
      			return res.status(err.code||400).json(err);
			 //return err;
			    }
		  for (var i = 0 ; i < data.data.items.length; i++)
	       		{  //console.log('b4 2nd loop ', data.data.items[i].id.videoId, " Tittle: ", data.data.items[i].snippet.title, "Thumbnails:", data.data.items[i].snippet.thumbnails);
			  resultarr.push("videoid:" , data.data.items[i].id.videoId, " Title: ", data.data.items[i].snippet.title, "Thumbnails:", data.data.items[i].snippet.thumbnails, "url:", "www.youtube.com/watch?v="+data.data.items[i].id.videoId);
		
		       }		
		return res.json(JSON.stringify(resultarr));
		//  return ();
		});

});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. '
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
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
  return response;
}



module.exports = app;


To install

npm install

npm start

It will ask you to authenticate google.api, select your google account and allow HPDFMusicBot to access youtube

End points for Watson conversation and youtube - app.js

watson conversation /api/message  - input and context

youtube            /api/playlist  - q = user input   (if the repsonse.output.text = "Sure. Will display results soon", make a request to youtube endpoint)


api.js - handler for watson conversation
conversation.js -is a sample nodejs file for integrating front end and backend




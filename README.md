This MusicBot enables a chat based conversation and allows users to listen to their favorite music by just asking to play songs of their favorite artists or a song or any album. 

The Nodejs-Express Backend integrates Watson conversation API and Youtube data API for the above.


To install 

npm install

npm start


End points for Watson conversation and youtube - app.js

watson conversation /api/message  - Parameters : input (User input) and context (response object returned by previous call to the API)

youtube            /api/playlist  - Parameters : q = user input   (if the repsonse.output.text = "Sure. Will display results soon", make a request to youtube endpoint)






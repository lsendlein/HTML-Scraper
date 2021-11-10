===== CS 361 Image Scraper Microservice =====
Laura Sendlein
CS 361

This microscraper currently works by connecting to a local host on port 8080.
Service runs via node.js

Currently works by:
1. Server runs, listening for connections
2. User can call from the client function using a url value passed to the sendUrl function
3.) Server accepts or denies the connection (currently will only accept urls from Rebecca and Sean's sites)
4.) The object sent is in the form of {"response" : -insertURLhere-}--it is already in the program, the desired url just needs to be replaced
5.) Server will receive the message and scrape the url
6.) The server sends back a stringified json object 
7.) The client stores the object in the "message.utf8Data" variable

To run the service:
1.) Clone/download repository
2.) Install dependencies:
	npm install puppeteer
	npm install ws
3.) Run node server.js
4.) Run node client.js --the client will close itself when it is done

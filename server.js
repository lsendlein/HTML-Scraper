const puppeteer = require('puppeteer');
var WebSocketServer = require('websocket').server;
var http = require('http');

// create new server
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

// set server to listen on port 8080
server.listen(8080, function() {
    console.log(' Server is listening on port 8080');
});

// create a new socket
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

// check origin
function originIsAllowed(origin) {
  return true;
}

// on request to server
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log(' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    // on a connection
    connection.on('message', async function(message) {
        if (message.type === 'utf8') {
            // parse message
            jsonEval = JSON.parse(message.utf8Data);
            console.log(jsonEval.url);
            let url = jsonEval.url
            // wait for async scraper to finish
            response =  await processMessage(url);
            // format the response
            parsedResponse = JSON.stringify(response)
            console.log('Received Message: ' + message.utf8Data);
            // send back the response
            connection.sendUTF(parsedResponse);
        }
    });
    
    connection.on('close', function() {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});



// scraper code
async function processMessage(url) {
    // create response object
    let context = {response: null}

    if (url.includes("wikipedia")) {
        let wiki = async() => {
            // launch puppeteer
            const browser = await puppeteer.launch({
                // if you uncomment below it will open in google chrome instead of chromium but you will need 
                // to check that your path to chrome on your computer matches bc it could be diff
                // executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                headless: false,
            });
            const page = await browser.newPage();
            await page.goto(url);
            await page.queryObjects
            // scrape the table rows
            const table = await page.$$eval("table.infobox.biota > tbody > tr", rows => rows.map(row => row.innerText))
    
            // create new array for the parsed table
            const parsedArray = [];
    
            // set tableStart to not start until scientific classification is found
            let tableStart = Number.MAX_VALUE;
            let found = false;
    
            for (i=0;i<table.length;i++) {
                // if scientific classification is found, start filling the array from there
                if (table[i] === 'Scientific classification') {
                    parsedArray.push(table[i])
                    tableStart = i;
                    found = true;
                }
                if (i > tableStart) {
                    parsedArray.push(table[i])
                }
            }
            // if it is not found, send back a helpful error message
            if (found === false) {
            context.response = "Could not locate a Scientific Classification table header."
            } else {
            context.response = parsedArray;
            }
    
            console.log(context);
            await browser.close();
        }
        await wiki();
        return context;
    }

    if (url.includes("pokemon.gameinfo")) {
        let pokemon = async() => {
            const browser = await puppeteer.launch({
                executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                headless: false,
            });
            const page = await browser.newPage();
            await page.goto(url);
            await page.queryObjects
            // scrape the best moves and the offense/defense stats
            const bestMoves = await page.$$eval("article.best-moveset.desktop-view > .togglable > .info", rows => rows.map(row => row.innerText))
            const offense = await page.$$eval(".moves.compact", rows => rows.map(row => row.innerText))
 
            // format the reply
            offenseDefense = [];
            offenseDefense.push(offense[0]);
            offenseDefense.push(offense[1]);

            context.response = bestMoves + '\n' + offenseDefense[0] + '\n' + offenseDefense[1]
            console.log(context)

            await browser.close();
        }
        await pokemon();
        return context; 
    }
}

var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

// if connection fails, log an error
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    // can remove below line, I just thought it was helpful to know it was working
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    // when a message from the server is recieved
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // response is stored inside message.utf8Data
            console.log(message.utf8Data);
            connection.close();
        }
    });
    
    // function to send data to server
    function sendUrl(url) {
        if (connection.connected) {
            var req = {"url" : url}
            connection.sendUTF(JSON.stringify(req));
        }
    }
    // value of url is url to be scraped goes in here as a string
    sendUrl("your url goes here");
});

client.connect('ws://localhost:8080/', 'echo-protocol');
// pyrc.js
//
// Top-level logic for the pyrc functionality. This is largely untested
// gluing together of functions provided by the libraries.


// Opens an IRC connection. Right now this is hardcoded to open a connection to
// chat.freenode.net, though in future it will be able to connect to a number
// of servers.
var openIRCConnection = function() {
    var host = window.location.hostname;

    return new WebSocket("ws://" + host + "/wsock/?server=chat.freenode.net");
};


// Send the messages required to log in to an IRC server.
var login = function(connection, username) {
    messages = irc.loginMsg(username);

    messages.forEach(function(msg) {
        connection.send(msg);
    });
};


// Joins a specific IRC channel.
var joinChannel = function(connection, channel) {
    join = irc.joinChannel(channel);
    connection.send(join);
};


// Direct messages _to_ the user come in with this form:
// ":fromuser PRIVMSG ouruser :text"
// The way we model private messages, as channels to a user, needs the message
// in this form:
// ":fromuser PRIVMSG fromuser :text"
var mutateDirectMsg = function(message) {
    var fromUser = message.prefix.split('!', 2)[0];
    message.params = fromUser;
    return message;
};


// Check whether this message is a direct message to the user.
var isDirectMessage = function(message, username) {
    // If this is an incoming direct message, mutate it.
    if (message.params == username) return true;
    else return false;
};


// Handles incoming IRC messages. Response to PINGs, and turns PRIVMSG
// messages into structures suitable for consumption in the Angular code.
var msgHandlerLoop = function(connection, onMsgCallback) {
    return function(event) {
        var msg = irc.parseIRCMsg(event.data);
        if (!msg) return;

        // Handle PINGs.
        if (msg.command == "PING") {
            connection.send(irc.handlePing(msg));
            return;
        }

        // Otherwise, call the callback with the parsed message.
        onMsgCallback(msg);
    };
};


// A shim in place to get stuff working quickly. Logs in to chat.freenode.net
// with a hardcoded-username, joins a single IRC channel, and logs everything
// to the console.
var ircLoop = function(username, onMsgCallback) {
    var conn = openIRCConnection();
    conn.onopen = function() {
        login(conn, username);
    };
    conn.onmessage = msgHandlerLoop(conn, onMsgCallback);
    window.conn = conn;
};


// Truncates an array to a maximum size. Hardcoded to being 100.
var truncateArray = function(array) {
    for (var count = array.length; count > 100; count--) {
        array.shift();
    }
};

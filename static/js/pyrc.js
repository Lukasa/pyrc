// pyrc.js
//
// Top-level logic for the pyrc functionality. This is largely untested
// gluing together of functions provided by the libraries.


// Opens an IRC connection. Right now this is hardcoded to open a connection to
// chat.freenode.net, though in future it will be able to connect to a number
// of servers.
var openIRCConnection = function() {
    var host = window.location.hostname;

    return new WebSocket("ws://" + host + "/wsock?server=chat.freenode.net");
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


// A shim in place to get stuff working quickly. Logs in to chat.freenode.net
// with a hardcoded-username, joins a single IRC channel, and logs everything
// to the console.
var main = function() {
    var conn = openIRCConnection();
    conn.onopen = function() {
        login(conn, "Pyrc");
        joinChannel(conn, "#python-requests");
    };
    conn.onmessage = function(event) {
        console.log(event.data);
    };
    window.conn = conn;
};

window.onload = main;

// irc.js
//
// Defines helper functions for working with IRC messages in Javascript.
var irc = (function(window){
    var my = {};

    // The regex used to parse IRC messages. I swear, it works.
    var IRCRegex = /^(?:\:(\S+) )?(\S+)(?: ([^:]+))?(?: :(.*))?$/;

    // parseIRCMsg takes an IRC message and returns an object with four fields:
    // the prefix, the command, the parameters, and the trailing section. These
    // fields are named "prefix", "command", "params" and "trailing". Only the
    // "command" field is mandatory: the others may be set to undefined.
    my.parseIRCMsg = function(msg){
        msg = msg.trim();
        var parsed = IRCRegex.exec(msg);
        if (!parsed) return null;
        else return {
            prefix:   parsed[1],
            command:  parsed[2],
            params:   parsed[3],
            trailing: parsed[4]
        };
    };

    // Serializes an object representing a Javascript object to a string.
    // Right now this is gloriously inefficient. Suck it up, we'll fix it
    // later.
    my.serializeIRCMsg = function(msgobj) {
        var out = "";

        if (msgobj.prefix) {
            out += ":" + msgobj.prefix + " ";
        }

        if (!msgobj.command) {
            return undefined;
        }
        else {
            out += msgobj.command;
        }

        if (msgobj.params) {
            out += " " + msgobj.params;
        }

        if (msgobj.trailing) {
            out += " :" + msgobj.trailing;
        }

        out += "\r\n";

        return out;
    };

    // Return a serialized private message.
    my.privmsg = function(target, message) {
        return my.serializeIRCMsg({
            command: "PRIVMSG",
            params: target,
            trailing: message
        });
    };

    // Return a serialized set of messages that correspond to a login sequence.
    my.loginMsg = function(username) {
        var nick = my.serializeIRCMsg({
            command: "NICK",
            params: username
        });
        var user = my.serializeIRCMsg({
            command: "USER",
            params: username + " 0 *",
            trailing: username
        });

        return [nick, user];
    };

    // Return a serialized channel join message.
    my.joinChannel = function(channel) {
        return my.serializeIRCMsg({
            command: "JOIN",
            params: channel
        });
    };

    return my;
})(window);

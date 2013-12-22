// irc.js
//
// Defines helper functions for working with IRC messages in Javascript.
var irc = (function(window){
    var my = {};

    // The regex used to parse IRC messages. I swear, it works.
    my.IRCRegex = /^(?:\:(\S+) )?(\S+)(?: ([^:]+))?(?: :(.*))?$/;

    // parseIRCMsg takes an IRC message and returns an object with four fields:
    // the prefix, the command, the parameters, and the trailing section. These
    // fields are named "prefix", "command", "params" and "trailing". Only the
    // "command" field is mandatory: the others may be set to undefined.
    my.parseIRCMsg = function(msg){
        msg = msg.trim();
        var parsed = my.IRCRegex.exec(msg);
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

        out += msgobj.command;

        if (msgobj.params) {
            out += " " + msgobj.params;
        }

        if (msgobj.trailing) {
            out += " :" + msgobj.trailing;
        }

        out += "\r\n";

        return out;
    };

    return my;
})(window);

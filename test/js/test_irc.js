// Specfile for testing the IRC module.
describe("The parseIRCMsg function", function() {
    it("can parse full IRC messages", function() {
        var msg = ":Trillian SQUIT cm22.eng.umd.edu :Server out of control";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBe("Trillian");
        expect(parsed.command).toBe("SQUIT");
        expect(parsed.params).toBe("cm22.eng.umd.edu");
        expect(parsed.trailing).toBe("Server out of control");
    });

    it("can parse IRC messages missing prefixes", function() {
        var msg = "SERVICE dict * *.fr 0 0 :French Dictionary";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBeUndefined();
        expect(parsed.command).toBe("SERVICE");
        expect(parsed.params).toBe("dict * *.fr 0 0");
        expect(parsed.trailing).toBe("French Dictionary");
    });

    it("can parse IRC messages missing arguments", function() {
        var msg = ":Trillian AWAY :Gone to lunch.";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBe("Trillian");
        expect(parsed.command).toBe("AWAY");
        expect(parsed.params).toBeUndefined();
        expect(parsed.trailing).toBe("Gone to lunch.");
    });

    it("can parse IRC messages missing trailers", function() {
        var msg = ":Lukasa WHOWAS Trillian 1 *.edu";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBe("Lukasa");
        expect(parsed.command).toBe("WHOWAS");
        expect(parsed.params).toBe("Trillian 1 *.edu");
        expect(parsed.trailing).toBeUndefined();
    });

    it("can parse IRC messages missing prefixes and trailers", function() {
        var msg = "WHOWAS Trillian 1 *.edu";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBeUndefined();
        expect(parsed.command).toBe("WHOWAS");
        expect(parsed.params).toBe("Trillian 1 *.edu");
        expect(parsed.trailing).toBeUndefined();
    });

    it("can parse IRC messages missing prefixes and arguments", function() {
        var msg = "AWAY :Gone to lunch.";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBeUndefined();
        expect(parsed.command).toBe("AWAY");
        expect(parsed.params).toBeUndefined();
        expect(parsed.trailing).toBe("Gone to lunch.");
    });

    it("can parse IRC messages missing arguments and trailers", function() {
        var msg = ":Trillian LIST";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBe("Trillian");
        expect(parsed.command).toBe("LIST");
        expect(parsed.params).toBeUndefined();
        expect(parsed.trailing).toBeUndefined();
    });

    it("can parse IRC messages that are only commands", function() {
        var msg = "PING";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBeUndefined();
        expect(parsed.command).toBe("PING");
        expect(parsed.params).toBeUndefined();
        expect(parsed.trailing).toBeUndefined();
    });

    it("accepts \\r\\n characters without mutating the output", function() {
        var msg = ":Trillian SQUIT cm22.eng.umd.edu :Server out of control\r\n";
        var parsed = irc.parseIRCMsg(msg);

        expect(parsed.prefix).toBe("Trillian");
        expect(parsed.command).toBe("SQUIT");
        expect(parsed.params).toBe("cm22.eng.umd.edu");
        expect(parsed.trailing).toBe("Server out of control");
    });
});


describe("The serializeIRCMsg function", function() {
    it("can serialize IRC messages with the full set of values", function() {
        var msg = {
            prefix: "Trillian",
            command: "SQUIT",
            params: "cm22.eng.umd.edu",
            trailing: "Server out of control"
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe(":Trillian SQUIT cm22.eng.umd.edu :Server out of control\r\n");
    });

    it("can serialize IRC messages missing prefixes", function() {
        var msg = {
            command: "SERVICE",
            params: "dict * *.fr 0 0",
            trailing: "French Dictionary"
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe("SERVICE dict * *.fr 0 0 :French Dictionary\r\n");
    });

    it("can serialize IRC messages missing arguments", function() {
        var msg = {
            prefix: "Trillian",
            command: "AWAY",
            trailing: "Gone to lunch."
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe(":Trillian AWAY :Gone to lunch.\r\n");
    });

    it("can serialize IRC messages missing trailing segments", function() {
        var msg = {
            prefix: "Lukasa",
            command: "WHOWAS",
            params: "Trillian 1 *.edu"
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe(":Lukasa WHOWAS Trillian 1 *.edu\r\n");
    });

    it("can serialize IRC messages missing prefix and arguments", function() {
        var msg = {
            command: "AWAY",
            trailing: "Gone to lunch."
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe("AWAY :Gone to lunch.\r\n");
    });

    it("can serialize IRC messages missing arguments and trailing", function() {
        var msg = {
            prefix: "Trillian",
            command: "LIST"
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe(":Trillian LIST\r\n");
    });

    it("can serialize IRC messages missing prefix and trailing", function() {
        var msg = {
            command: "WHOWAS",
            params: "Trillian 1 *.edu"
        };
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe("WHOWAS Trillian 1 *.edu\r\n");
    });

    it("can serialize IRC messages that are just commands", function() {
        var msg = {command: "PING"};
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBe("PING\r\n");
    });

    it("returns undefined if there is no command present", function() {
        var msg = {};
        var serialized = irc.serializeIRCMsg(msg);

        expect(serialized).toBeUndefined();
    });
});


describe("The privmsg function", function() {
    it("serialises a private message automatically", function() {
        var expected = "PRIVMSG #python-requests :Hi there!\r\n";

        expect(irc.privmsg("#python-requests", "Hi there!")).toBe(expected);
    });
});

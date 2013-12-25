// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

// This is a list of channel names to channel controllers. This allows farming
// out of messages.
var channels = {};

// Define the Connection controller. This handles top-level connection
// function. In particular, it basically wraps the notion of multiple channels.
pyrcApp.controller("ConnectionController", function($scope) {
    $scope.username = "Pyrc";
    $scope.channels = ["#python-requests", "#GoBotTest"];

    // Start the IRC loop. If we get a PRIVMSG, farm it out to the controller
    // callback appropriate to the channel.
    ircLoop($scope.username, function(message) {
        if (message.command == "PRIVMSG") {
            channels[message.params](message);
        }
    });
});

pyrcApp.controller("ChannelController", function($scope) {
    $scope.messages = [];
    $scope.msg = "";

    $scope.init = function(channel) {
        // Save off the channel.
        $scope.channel = channel;

        // Add the message callback to the channel map.
        channels[channel] = function(message) {
            $scope.$apply(function() {
                if (message.command == "PRIVMSG") {
                    $scope.messages.push({
                        from: message.prefix.split('!', 2)[0],
                        text: message.trailing
                    });
                }
            });
        };

        // JOIN the channel.
        try {
            window.conn.send(irc.joinChannel(channel));
        } catch (e) {
            var current = window.conn.onopen;

            window.conn.onopen = function() {
                current();
                window.conn.send(irc.joinChannel(channel));
            };
        }
    };

    // Define the controller method for sending an IRC message.
    $scope.sendIrcMessage = function() {
        message = irc.privmsg($scope.channel, $scope.msg);
        window.conn.send(message);

        $scope.messages.push({
            from: $scope.username,
            text: $scope.msg
        });

        // Clear the message box.
        $scope.msg = "";
    };
});

// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

// This is a list of channel names to channel controllers. This allows farming
// out of messages.
var channels = {};

// Define the Connection controller. This handles top-level connection
// function. In particular, it basically wraps the notion of multiple channels.
pyrcApp.controller("ConnectionController", function($scope) {
    $scope.connection = {
        username: "",
        channels: ["#python-requests"],
        chan: "",
        loggedIn: false
    };

    // Join a new channel.
    $scope.joinIrcChannel = function() {
        $scope.connection.channels.push($scope.connection.chan);
        $scope.connection.chan = "";
    };

    // Start the IRC loop. If we get a PRIVMSG, farm it out to the controller
    // callback appropriate to the channel.
    $scope.logIn = function(username) {
        $scope.connection.username = username;
        $scope.connection.loggedIn = true;

        ircLoop(username, function(message) {
            if (message.command == "PRIVMSG") {
                // Standardise the incoming messages. If this is a direct
                // message to a channel that doesn't exist, we'll have to
                // create it.
                if (isDirectMessage(message, $scope.connection.username)) {
                    message = mutateDirectMsg(message);

                    // If we create a channel, it won't have registered its
                    // callback in time. Wait before we call it.
                    if ($scope.connection.channels.indexOf(message.params) == -1) {
                        $scope.$apply(function() {
                            $scope.connection.channels.push(message.params);
                        });

                        window.setTimeout(
                            function() {
                                channels[message.params](message);
                            },
                            50
                        );

                        return;
                    }
                }

                channels[message.params](message);
            }
        });
    };
});

// Define a controller that manages a single IRC channel. This also manages
// IRC direct message conversations by mocking them up as if they are a
// channel.
pyrcApp.controller("ChannelController", function($scope) {
    $scope.messages = [];
    $scope.msg = "";

    $scope.init = function(channel) {
        // Save off the channel.
        $scope.channel = channel.toLowerCase();

        // Add the message callback to the channel map.
        channels[channel.toLowerCase()] = function(message) {
            $scope.$apply(function() {
                if (message.command == "PRIVMSG") {
                    $scope.messages.push({
                        from: message.prefix.split('!', 2)[0],
                        text: message.trailing
                    });
                }
            });
        };

        // JOIN the channel. If we join too quickly, we'll try to send over
        // a websocket connection that isn't open yet. In that case, add our
        // message to the onopen action.
        // Only do this if the channel name begins with a '#' sign.
        if (channel.indexOf('#') !== 0) return;

        try {
            window.conn.send(irc.joinChannel(channel.toLowerCase()));
        } catch (e) {
            var current = window.conn.onopen;

            window.conn.onopen = function() {
                current();
                window.conn.send(irc.joinChannel(channel.toLowerCase()));
            };
        }
    };

    // Define the controller method for sending an IRC message.
    $scope.sendIrcMessage = function() {
        message = irc.privmsg($scope.channel, $scope.msg);
        window.conn.send(message);

        $scope.messages.push({
            from: $scope.connection.username,
            text: $scope.msg
        });

        // Clear the message box.
        $scope.msg = "";
    };
});


// Define a directive that fires when you hit the enter key while an element
// is selected.
pyrcApp.directive('lukEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.lukEnter);
                });

                event.preventDefault();
            }
        });
    };
});

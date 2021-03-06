// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

// This is a list of channel names to channel controllers. This allows farming
// out of messages.
var channels = {};


// The default text shown in the 'join new channel' input.
var defaultChanText = "New channel...";


// Define the Connection controller. This handles top-level connection
// function. In particular, it basically wraps the notion of multiple channels.
pyrcApp.controller("ConnectionController", function($scope) {
    $scope.connection = {
        username: "",
        channels: [],
        active: "",
        chan: defaultChanText,
        loggedIn: false,
        unread: {}
    };

    // Join a new channel.
    $scope.joinIrcChannel = function() {
        $scope.connection.channels.push($scope.connection.chan);
        $scope.connection.active = $scope.connection.chan;
        $scope.connection.chan = defaultChanText;
    };

    // Start the IRC loop. If we get a PRIVMSG, farm it out to the controller
    // callback appropriate to the channel.
    $scope.logIn = function(username) {
        $scope.connection.username = username;
        $scope.connection.loggedIn = true;

        ircLoop(username, $scope.connection.channels, function(message) {
            if ((message.command == "PRIVMSG") || (message.command == "JOIN")) {
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
                                channels[message.params.toLowerCase()](message);
                            },
                            50
                        );

                        return;
                    }
                }

                channels[message.params.toLowerCase()](message);
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
                var from = message.prefix.split('!', 2)[0];

                // Any PRIVMSG command gets printed.
                // A JOIN command gets shown so long as the joiner doesn't have
                // the same username we do.
                if (message.command == "PRIVMSG") {
                    $scope.messages.push({
                        from: from,
                        text: message.trailing,
                        date: new Date(),
                        priv: true
                    });

                    // If we aren't active, mark us as having unread messages.
                    if ($scope.connection.active != $scope.channel) {
                        $scope.connection.unread[$scope.channel] = true;
                    }
                } else if ((message.command == "JOIN") &&
                           (from != $scope.connection.username)) {
                    $scope.messages.push({
                        from: from,
                        text: "joined the channel.",
                        date: new Date(),
                        join: true
                    });
                }

                // If there are more than 100 messages in the channel, drop the
                // excess.
                truncateArray($scope.messages);
            });
        };

        // We currently don't have unread messages.
        $scope.connection.unread[channel.toLowerCase()] = false;

        // JOIN the channel. If we join too quickly, we'll try to send over
        // a websocket connection that isn't open yet. In that case, move on.
        // Only do this if the channel name begins with a '#' sign.
        if (channel.indexOf('#') !== 0) return;

        try {
            window.conn.send(irc.joinChannel(channel.toLowerCase()));
        } catch (e) {}
    };

    // Define the controller method for sending an IRC message.
    $scope.sendIrcMessage = function() {
        // Avoid sending empty messages due to errant hits of 'enter'.
        if (!$scope.msg) return;

        message = irc.privmsg($scope.channel, $scope.msg);
        window.conn.send(message);

        $scope.messages.push({
            from: $scope.connection.username,
            text: $scope.msg,
            date: new Date(),
            priv: true
        });

        // Clear the message box.
        $scope.msg = "";

        // Potentially truncate the list.
        truncateArray($scope.messages);
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


// This directive is an approximation of ng-show. It's extended to reduce the
// unread messages count to zero whenever a channel window is unhidden.
pyrcApp.directive('lukShow', function() {
    // This directive affects the DOM, so we need to define a 'link' function.
    // Why? Because Angular.js says so that's why.
    var link = function($scope, element, attributes) {
        // We define a truthy expression to watch.
        var expression = attributes.lukShow;

        // When initially evaluated, set up a default value based on the
        // expression. If the expression is false, hide the element.
        if (!$scope.$eval(expression)) {
            element.hide();
        }

        // Now, watch the expression. If it changes, adjust the visibility of
        // the element in question.
        $scope.$watch(expression, function(newValue, oldValue) {
            // If the value hasn't changed, do nothing. This should only ever
            // happen once, at initialization.
            if (newValue == oldValue) return;

            // If the new expression is true, show the element, otherwise hide
            // it.
            if (newValue) {
                element.show();
                $scope.connection.unread[$scope.channel] = false;

                // Scroll the window to the bottom of the text.
                window.scrollTo(0, $(document).height());
            } else {
                element.hide();
            }
        });
    };

    // Return the directive, restricted to attributes only.
    return {link: link, restrict: "A"};
});

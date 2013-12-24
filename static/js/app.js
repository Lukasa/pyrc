// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

pyrcApp.controller("ConnectionController", function($scope) {
    $scope.messages = [];
    $scope.msg = "";
    $scope.username = "Pyrc";

    // Save off the channel when we get inited.
    $scope.init = function(channel) {
        $scope.channel = channel;
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

    ircLoop($scope.username, function(message) {
        $scope.$apply(function() {
            if (message.command == "PRIVMSG") {
                $scope.messages.push({
                    from: message.prefix.split('!', 2)[0],
                    text: message.trailing
                });
            }
        });
    });
});

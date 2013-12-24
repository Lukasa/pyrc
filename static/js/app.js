// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

pyrcApp.controller("ircCtrl", function($scope) {
    $scope.messages = [];
    $scope.msg = "";

    // Define the controller method for sending an IRC message.
    $scope.sendIrcMessage = function() {
        window.conn.send(irc.privmsg("#python-requests", $scope.msg));
    };

    ircLoop(function(message) {
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

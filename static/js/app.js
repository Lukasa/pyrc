// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

pyrcApp.controller("ircCtrl", function($scope) {
    $scope.messages = [];
    $scope.msg = "";
    $scope.username = "Pyrc";

    // Define the controller method for sending an IRC message.
    $scope.sendIrcMessage = function() {
        message = irc.privmsg("#python-requests", $scope.msg);
        window.conn.send(message);

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

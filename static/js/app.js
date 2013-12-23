// Defines the top-level angular functionality. This will likely be refactored
// as I go.
var pyrcApp = angular.module("pyrcApp", []);

pyrcApp.controller("ircCtrl", function($scope) {
    $scope.messages = [];

    ircLoop(function(message) {
        $scope.$apply(function() {
            if (message.command == "PRIVMSG") {
                $scope.messages.push({
                    from: message.prefix,
                    text: message.trailing
                });
            }
        });
    });
});

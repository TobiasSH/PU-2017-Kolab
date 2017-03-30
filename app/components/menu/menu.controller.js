kolabApp.controller('menuCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from menu-controller");

    var socket = io();

    $scope.questions = function () {
        console.log("questions button was clicked");

    };

    $scope.cantKeepUp = function () {
        console.log("cantKeepUp button was clicked");



        socket.emit('cantKeepUp')

    };

    $scope.decreaseVolume = function () {
        console.log("decreaseVolume button was clicked");
        socket.emit('decreaseVolume')
    };

    $scope.increaseVolume = function () {
        console.log("increaseVolume button was clicked");
        socket.emit('increaseVolume')
    };

    $scope.decreaseSpeed = function () {
        console.log("decreaseSpeed button was clicked");
        socket.emit('decreaseSpeed')
    };

    $scope.increaseSpeed = function () {
        console.log("increaseSpeed button was clicked");
        socket.emit('increaseSpeed')
    };


}]);
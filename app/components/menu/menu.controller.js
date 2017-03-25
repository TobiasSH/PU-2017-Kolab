kolabApp.controller('menuCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from menu-controller");

    $scope.questions = function () {
        console.log("questions button was clicked");
    };

    $scope.cantKeepUp = function () {
        console.log("cantKeepUp button was clicked");
    };

    $scope.decreaseVolume = function () {
        console.log("decreaseVolume button was clicked");
    };

    $scope.increaseVolume = function () {
        console.log("increaseVolume button was clicked");
    };

    $scope.decreaseSpeed = function () {
        console.log("decreaseSpeed button was clicked");
    };

    $scope.increaseSpeed = function () {
        console.log("increaseSpeed button was clicked");
    };


}]);
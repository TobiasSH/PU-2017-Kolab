kolabApp.controller('menuCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from menu-controller");


    $scope.questions = function () {
        console.log("questions button was clicked");

    };

    $scope.cantKeepUp = function () {
        console.log("cantKeepUp button was clicked");

        $http.get('/counter', { params: {id :"cku"}}).then(function(response){

            console.log(response);
        })

    };

    $scope.decreaseVolume = function () {
        console.log("decreaseVolume button was clicked");
        $http.get('/counter', { params: {id :"dv"}}).then(function(response){

            console.log(response);
        })
    };

    $scope.increaseVolume = function () {
        console.log("increaseVolume button was clicked");
        $http.get('/counter', { params: {id :"iv"}}).then(function(response){

            console.log(response);
        })
    };

    $scope.decreaseSpeed = function () {
        console.log("decreaseSpeed button was clicked");
        $http.get('/counter', { params: {id :"ds"}}).then(function(response){

            console.log(response);
        })
    };

    $scope.increaseSpeed = function () {
        console.log("increaseSpeed button was clicked");
        $http.get('/counter', { params: {id :"is"}}).then(function(response){

            console.log(response);
        })
    };


}]);
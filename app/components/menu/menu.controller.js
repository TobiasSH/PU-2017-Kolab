kolabApp.controller('menuCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from menu-controller");
    var socket = io();
    var countString;
    //countString is used to save the current users clicks in cookie
    //it consist of 5 digits, initially all ones 11111
    //When a button is clicked the the corresponding digit is set to 0
    //Clicking the same button is registered as unclicking this button

    $scope.cantKeepUp = function () {
        console.log("cantKeepUp button was clicked");
        var inc;
        var hits = parseInt(countString.charAt(0));
        if (hits==1){
            var newString = 0+countString.slice(1);
            countString = document.cookie=newString;
            inc = 1;

         }
        else if (hits==0){
            var newString = 1+countString.slice(1);
            countString = document.cookie=newString;
            inc = -1;
          }
        socket.emit('cantKeepUp', inc)

    };

    $scope.decreaseVolume = function () {
        console.log("decreaseVolume button was clicked");
        var inc;
        var hits = parseInt(countString.charAt(1));
        if (hits==1){
            var newString = countString.slice(0,1)+0+countString.slice(2);
            countString = document.cookie=newString;
            inc = 1;
         }
        else if (hits==0){
            var newString = countString.slice(0,1)+1+countString.slice(2);
            countString = document.cookie=newString;
            inc = -1;
         }
        socket.emit('decreaseVolume', inc);
    };

    $scope.increaseVolume = function () {
        console.log("increaseVolume button was clicked");
        var inc;
        var hits = parseInt(countString.charAt(2));
        if (hits==1){
            var newString = countString.slice(0,2)+0+countString.slice(3);
            countString = document.cookie=newString;
            inc = 1;
        }
        else if (hits==0){
            var newString = countString.slice(0,2)+1+countString.slice(3);
            countString = document.cookie=newString;
            inc = -1;
        }
        socket.emit('increaseVolume', inc)
    };

    $scope.decreaseSpeed = function () {
        console.log("decreaseSpeed button was clicked");
        var inc;
        var hits = parseInt(countString.charAt(3));
        if (hits==1){
            var newString = countString.slice(0,3)+0+countString.slice(4);
            countString = document.cookie=newString;
            inc = 1;
        }
        else if (hits==0){
            var newString = countString.slice(0,3)+1+countString.slice(4);
            countString = document.cookie=newString;
            inc = -1;
       }
        socket.emit('decreaseSpeed', inc);
    };

    $scope.increaseSpeed = function () {
        console.log("increaseSpeed button was clicked");
        var inc;
        var hits = parseInt(countString.charAt(4));
        if (hits==1){
            var newString = countString.slice(0,4)+0+countString.slice(5);
            countString = document.cookie=newString;
            inc = 1;
      }
        else if (hits==0){
            var newString = countString.slice(0,4)+1+countString.slice(5);
            countString = document.cookie=newString;
            inc = -1;
        }
        socket.emit('increaseSpeed', inc);
    };
    socket.on('connect', function () {
        countString = document.cookie;
        if (document.cookie=="" ){
            countString = document.cookie="11111";
            socket.emit('storeClient',1 );
        }
        console.log("connect");
    });
    socket.on('disconnect', function () {
        socket.emit('storeClient',-1 );
    });
    socket.on('resetVotes', function(){
       countString = document.cookie="11111";
    });



}]);
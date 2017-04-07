kolabApp.controller('menuCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from menu-controller");
    var socket = io();
    var cantKeepUp = document.getElementById("cantKeepUp");
    var decreaseVolume = document.getElementById("decreaseVolume");
    var increaseVolume = document.getElementById("increaseVolume");
    var decreaseSpeed = document.getElementById("decreaseSpeed");
    var increaseSpeed = document.getElementById("increaseSpeed");
    var countString;
    var buttonList = [cantKeepUp, decreaseVolume, increaseVolume, decreaseSpeed, increaseSpeed]
    var button = "btn btn-responsive btn-lg btn-block bn-square ";
    //countString is used to save the current users clicks in cookie
    //it consist of 5 digits, initially all ones 11111
    //When a button is clicked the the corresponding digit is set to 0
    //Clicking the same button is registered as unclicking this button

    var refresh = function () {
        if (document.cookie.length<4){
            return;
        }
        for (var x = 0; x < 5 ;x++ ){
            if (document.cookie.charAt(x) == 0){
                if (x<1){
                    buttonList[x].className=button + " btn-cantkeepupClicked"
                }else if (x <3 ){
                    buttonList[x].className=button + " btn-volumeClicked"
                } else if (x < 5){
                    buttonList[x].className=button + "btn-speedClicked"
                }
            }
        }
    };

    refresh();


    //Button clicks

    $scope.cantKeepUp = function () {
        console.log("cantKeepUp button was clicked");
        var inc = setCountGetInc(0);
        if (inc == -1){
            cantKeepUp.className= button + "btn-cantkeepup";
        } else if (inc == 1){
            cantKeepUp.className=button + " btn-cantkeepupClicked";

        }
        socket.emit('cantKeepUp', inc)

    };

    $scope.decreaseVolume = function () {
        console.log("decreaseVolume button was clicked");
        var inc = setCountGetInc(1);
        if (inc == -1){
            decreaseVolume.className=button + " btn-volume";
        } else if (inc == 1&& countString.charAt(2)==1){
            decreaseVolume.className=button + "btn-volumeClicked";

        }else if (inc == 1 && countString.charAt(2)==0){
            inc2 = setCountGetInc(2);
            socket.emit('increaseVolume', inc2);
            decreaseVolume.className=button + " btn-volumeClicked";
            increaseVolume.className=button + "btn-volume";
        }

        socket.emit('decreaseVolume', inc);
    };

    $scope.increaseVolume = function () {
        console.log("increaseVolume button was clicked");
        var inc = setCountGetInc(2);
        if (inc == -1){
            increaseVolume.className=button + " btn-volume";

        } else if (inc == 1 && countString.charAt(1)==1){
            increaseVolume.className=button + "btn-volumeClicked";

        }else if (inc == 1 && countString.charAt(1)==0){
            inc2 = setCountGetInc(1);
            socket.emit('decreaseVolume', inc2);
            increaseVolume.className=button + "btn-volumeClicked";
            decreaseVolume.className=button + "btn-volume";
        }
        socket.emit('increaseVolume', inc)
    };

    $scope.decreaseSpeed = function () {
        console.log("decreaseSpeed button was clicked");
        var inc = setCountGetInc(3);
        if (inc == -1){
            decreaseSpeed.className=button + " btn-speed";

        } else if (inc == 1 && countString.charAt(4)==1){
            decreaseSpeed.className=button + "btn-speedClicked";

        }else if (inc == 1 && countString.charAt(4)==0){
            inc2 = setCountGetInc(4);
            socket.emit('increaseSpeed', inc2);
            decreaseSpeed.className=button + "btn-speedClicked";
            increaseSpeed.className=button + "btn-speed";
        }
        socket.emit('decreaseSpeed', inc);
    };

    $scope.increaseSpeed = function () {
        console.log("increaseSpeed button was clicked");
        var inc = setCountGetInc(4);
        if (inc == -1){
            increaseSpeed.className=button + "btn-speed";
        } else if (inc == 1 && countString.charAt(3)==1){
            increaseSpeed.className=button + "btn-speedClicked";
        }else if (inc == 1 && countString.charAt(3)==0){
            inc2 = setCountGetInc(3);
            socket.emit('decreaseSpeed', inc2);
            increaseSpeed.className=button + "btn-speedClicked";
            decreaseSpeed.className=button + "btn-speed";
        }
        console.log(countString);
        socket.emit('increaseSpeed', inc);
    };
    //on connect sets cookie and counts users
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
    function setCountGetInc(x) {
        var inc;
        var hits = parseInt(countString.charAt(x));
        if (hits==1){
            var newString = countString.slice(0,x)+0+countString.slice(x+1);
            countString = document.cookie=newString;
            inc = 1;
        }
        else if (hits==0){
            var newString = countString.slice(0,x)+1+countString.slice(x+1);
            countString = document.cookie=newString;
            inc = -1;
        }
        return inc
    }




}]);
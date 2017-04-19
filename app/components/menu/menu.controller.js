kolabApp.controller('menuCtrl', ['$scope', '$http', '$location', 'socket', function ($scope, $http, $location, socket) {

    console.log("Hello World from menu-controller, cookie is now: ", document.cookie);


    var cantKeepUp = document.getElementById("cantKeepUp");
    var decreaseVolume = document.getElementById("decreaseVolume");
    var increaseVolume = document.getElementById("increaseVolume");
    var decreaseSpeed = document.getElementById("decreaseSpeed");
    var increaseSpeed = document.getElementById("increaseSpeed");
    var countString;
    var buttonList = [cantKeepUp, decreaseVolume, increaseVolume, decreaseSpeed, increaseSpeed];
    var button = "btn btn-responsive btn-lg btn-block bn-square ";
    //countString is used to save the current users clicks in cookie
    //it consist of 5 digits, initially all ones 11111
    //When a button is clicked the the corresponding digit is set to 0
    //Clicking the same button is registered as unclicking this button

    $scope.roomCookie = document.cookie.slice(20);

    $scope.go = function (path) {
        $location.path(path);
    };

    var refresh = function () {
        socket.emit('cookie initialize', document.cookie);
        if (document.cookie.length < 4) {
            return;
        }
        for (var x = 0; x < 5; x++) {
            if (document.cookie.charAt(x) == 0) {
                if (x < 1) {
                    buttonList[x].className = button + " btn-cantkeepupClicked"
                } else if (x < 3) {
                    buttonList[x].className = button + " btn-volumeClicked"
                } else if (x < 5) {
                    buttonList[x].className = button + "btn-speedClicked"
                }
            } else if (document.cookie.charAt(x) == 1) {
                if (x < 1) {
                    buttonList[x].className = button + " btn-cantkeepup"
                } else if (x < 3) {
                    buttonList[x].className = button + " btn-volume"
                } else if (x < 5) {
                    buttonList[x].className = button + "btn-speed"
                }

            }
        }
        //if user doesnt have a room, we return them to the front-page
        var roomName = document.cookie;
        if (roomName.length <= 21) {
            console.log("New user, returning to start");
            $location.path('/');
        } else {
            socket.emit('join room', roomName.slice(20), document.cookie); //we join the socket we're supposed to be on, based on our room
        }
        countString = document.cookie;

    };

    refresh();


    //Button clicks

    $scope.questions = function () {

        $location.path('/questions');

    };

    $scope.cantKeepUp = function () {

        var inc = setCountGetInc(0);
        if (inc == -1) {
            cantKeepUp.className = button + "btn-cantkeepup";
        } else if (inc == 1) {
            cantKeepUp.className = button + " btn-cantkeepupClicked";
            console.log("yo clicked")

        }
        socket.emit('cantKeepUp', inc, $scope.roomCookie, document.cookie);
        console.log("cantKeepUp button was clicked, cookie is: ",document.cookie);



    };

    $scope.decreaseVolume = function () {
        console.log("decreaseVolume button was clicked");
        var inc = setCountGetInc(1);
        if (inc == -1) {
            decreaseVolume.className = button + " btn-volume";
        } else if (inc == 1 && countString.charAt(2) == 1) {
            decreaseVolume.className = button + "btn-volumeClicked";

        } else if (inc == 1 && countString.charAt(2) == 0) {
            inc2 = setCountGetInc(2);
            socket.emit('increaseVolume', inc2, $scope.roomCookie, document.cookie);
            decreaseVolume.className = button + " btn-volumeClicked";
            increaseVolume.className = button + "btn-volume";
        }

        socket.emit('decreaseVolume', inc, $scope.roomCookie, document.cookie);

    };

    $scope.increaseVolume = function () {
        console.log("increaseVolume button was clicked");

        var inc = setCountGetInc(2);
        if (inc == -1) {
            increaseVolume.className = button + " btn-volume";

        } else if (inc == 1 && countString.charAt(1) == 1) {
            increaseVolume.className = button + "btn-volumeClicked";

        } else if (inc == 1 && countString.charAt(1) == 0) {
            inc2 = setCountGetInc(1);
            socket.emit('decreaseVolume', inc2, $scope.roomCookie, document.cookie);
            increaseVolume.className = button + "btn-volumeClicked";
            decreaseVolume.className = button + "btn-volume";
        }
        socket.emit('increaseVolume', inc, $scope.roomCookie, document.cookie); //Needs opposite message for the other button

    };

    $scope.decreaseSpeed = function () {
        console.log("decreaseSpeed button was clicked");

        var inc = setCountGetInc(3);
        if (inc == -1) {
            decreaseSpeed.className = button + " btn-speed";

        } else if (inc == 1 && countString.charAt(4) == 1) {
            decreaseSpeed.className = button + "btn-speedClicked";

        } else if (inc == 1 && countString.charAt(4) == 0) {
            inc2 = setCountGetInc(4);
            socket.emit('increaseSpeed', inc2, $scope.roomCookie, document.cookie);
            decreaseSpeed.className = button + "btn-speedClicked";
            increaseSpeed.className = button + "btn-speed";
        }
        socket.emit('decreaseSpeed', inc, $scope.roomCookie, document.cookie);

    };


    $scope.increaseSpeed = function () {
        console.log("increaseSpeed button was clicked");

        var inc = setCountGetInc(4);
        if (inc == -1) {
            increaseSpeed.className = button + "btn-speed";
        } else if (inc == 1 && countString.charAt(3) == 1) {
            increaseSpeed.className = button + "btn-speedClicked";
        } else if (inc == 1 && countString.charAt(3) == 0) {
            inc2 = setCountGetInc(3);
            socket.emit('decreaseSpeed', inc2, $scope.roomCookie, document.cookie);
            increaseSpeed.className = button + "btn-speedClicked";
            decreaseSpeed.className = button + "btn-speed";
        }
        console.log(countString);
        socket.emit('increaseSpeed', inc, $scope.roomCookie, document.cookie);

    };


    $scope.leaveRoom = function () {
        socket.emit('leave room', document.cookie);
        userid = document.cookie.substring(5, 20);
        document.cookie = '11111' + userid;
        $location.path('/');
    };
    //on connect sets cookie and counts users
    socket.on('connect', function () {
        if (document.cookie == "") {// This really should not happen now
            console.log("This should never run unless you're in incognito and refresh or something");
        }
        console.log("connect");
    });


    //doesnt this have to be in all the controllers?
    socket.on('resetVotes', function () {
        userid = document.cookie.substring(5, 20);
        useridcounters = '11111' + userid;
        document.cookie = useridcounters + $scope.roomCookie;
        refresh();
    });

    // On the rare occassion a room is delete while the user is in it
    socket.on('delete current room', function () {
        $location.path('/');
        $scope.$apply();
    });

    // Function checking whether we should increment or decrement based on current value of click
    function setCountGetInc(x) {
        var inc;
        var hits = parseInt(countString.charAt(x));
        if (hits == 1) {
            var newString = countString.slice(0, x) + 0 + countString.slice(x + 1);
            countString = document.cookie = newString;
            inc = 1;
        }
        else if (hits == 0) {
            var newString = countString.slice(0, x) + 1 + countString.slice(x + 1);
            countString = document.cookie = newString;
            inc = -1;
        }
        return inc
    }


}]);
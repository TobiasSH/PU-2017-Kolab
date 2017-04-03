kolabApp.controller('frontCtrl', ['$scope', "$location", '$http', 'socket', function ($scope, $location, $http, socket) {
    $scope.go = function (path) {
        $location.path(path);
    };

    // COOKIE STUFF FOR TESTING UNIQUE COOKIES
    //function getCname() {
      //  return "hans";
    //}

    //TODO
    function checkForExistingUser(cookieString) {

    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function checkCookie() {
        var user = getCookie("username");
        if (user != "") {
            alert("Welcome again " + user);
        } else {
            user = prompt("Please enter your name:", "");
            if (user != "" && user != null) {
                setCookie("username", user, 365);
            }
        }
    }



    // initial retrieval of questions from the database
    var refresh = function () {
       // console.log("Early refresh cookie: " + document.cookie);

        $http.get('/roomsCollection').then(function (response) {
                console.log("I got the data I requested");
                $scope.kolabDBScope = response.data;
                //$scope.room = null;
            },
            function (error) {
                console.log("I got ERROR");
            });

        //console.log("Late refresh cookie: " + document.cookie);
    };
    refresh();


    socket.on('room message', function (room) {
        console.log('A new room was created:  ', room);
        $scope.kolabDBScope.push(room);
        $scope.$apply();
    });


    //Create a new room
    $scope.createRoom = function () {
        console.log("method new room called");
        if ($scope.newRoom != null && $scope.newRoom.text.trim().length) {
            socket.emit('new room message', $('#textareaNewRoom').val());
            $('#textareaNewRoom').val('');
            console.log("attempt at go lecturer ");
            $location.path('/lecturer');
            return false;
        } else {

        }
    };

    $scope.join = function () {

    };

    $scope.joinRoom = function () {
        console.log("method join room called");
        if ($scope.joinRoom != null && $scope.joinRoom.text.trim().length) {
            socket.emit('join room message', $('#textareaJoinRoom').val());
            $('#textareaJoinRoom').val('');
            console.log("attempt at go student ");
            $location.path('/student');
            return false;
        } else {

        }
    };
    $scope.joinExistingRoom = function (index, text) {
        document.cookie = "Safari";
        console.log("This is the index of the room we're trying to join: " + index + "\n and this is the text: " + text);
        socket.emit('join existing room', index, text);
        $location.path('/student');

    };


}]);
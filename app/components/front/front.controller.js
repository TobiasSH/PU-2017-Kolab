kolabApp.controller('frontCtrl', ['$scope', "$location", '$http', 'socket', function ($scope, $location, $http, socket) {
    $scope.go = function (path) {
        $location.path(path);
    };
    /*
     // COOKIE STUFF FOR TESTING UNIQUE COOKIES
     function getCname() {
     return "hans";
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
     */
    // ??
    function checkCookie() {
        var user = document.cookie;
        if (user != "") {
            console.log("New user, setting cookie");
        } else {
            document.cookie = "11111" + randomString(16, '0123456789abcdef');
        }
    }


    // initial retrieval of questions from the database
    var refresh = function () {
        checkCookie();
        console.log("Early refresh ck: " + document.cookie);

        $http.get('/roomsCollection').then(function (response) {
                console.log("I got the data I requested");
                $scope.kolabDBScope = response.data;
                //$scope.room = null;
            },
            function (error) {
                console.log("I got ERROR", error);
            });
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


    $scope.joinRoom = function () {
        console.log("method join room called", $scope.kolabDBScope.text);
        //If is not functional, need to be able to see if the room exists, best if the rooms were properties of the scope
        if ($scope.joinRoom != null && $('#textareaJoinRoom').val().length && ($('#textareaJoinRoom').val() in $scope.kolabDBScope.text)) {
            socket.join($('#textareaJoinRoom').val());
            document.cookie = document.cookie.substring(0,20);
            document.cookie += text;
            //socket.emit('join room message', $('#textareaJoinRoom').val());
            $('#textareaJoinRoom').val('');
            socket.emit('join message', $('#textareaJoinRoom').val());
            console.log("attempt at go student ");
            $location.path('/student');
            return false;
        } else {

        }
    };
    $scope.joinExistingRoom = function (index, text) {
        document.cookie = document.cookie.substring(0,20);
        document.cookie += text;
        console.log("This is the index of the room we're trying to join: " + index + "\n and this is the text: " + text);
        socket.emit('join room', text);
        $location.path('/student');
    };

    $scope.deleteRoom = function (index, id) {
        socket.emit('room delete', index, id);
    };

    // Function for making user ID
    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

}]);
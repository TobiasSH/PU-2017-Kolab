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
            console.log("Old user, " + document.cookie + ", Welcome back");
        } else {
            document.cookie = "11111" + randomString(16, '0123456789abcdef');
        }
    }


    // initial retrieval of questions from the database
    var refresh = function () {
        checkCookie();
        console.log("Early refresh ck: " + document.cookie);
        $scope.myRooms = [];

        $http.get('/roomsCollection').then(function (response) {
                console.log("I got the data I requested", response.data);
                $scope.kolabDBScope = response.data;
                //$scope.room = null;

                for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                    console.log('Looping through kolabDBScope', $scope.kolabDBScope[i].creator);
                    var userID = document.cookie.slice(4, 20);
                    if ($scope.kolabDBScope[i].creator === userID) {
                        console.log("Adding room because we created it",$scope.kolabDBScope[i].room);
                        $scope.myRooms.push($scope.kolabDBScope[i]);
                    }

                }

            },
            function (error) {
                console.log("I got ERROR", error);
            });


    };
    refresh();




    //Create a new room
    $scope.createRoom = function () {
        console.log("method new room called");
        // And newroom not in scope
        if ($scope.newRoom != null && $scope.newRoom.text.trim().length) {

            socket.emit('new room message', $('#textareaNewRoom').val(), document.cookie.slice(4, 20));
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
            document.cookie = document.cookie.substring(0, 20);
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
        document.cookie = document.cookie.substring(0, 20);
        document.cookie += text;
        console.log("This is the index of the room we're trying to join: " + index + "\n and this is the text: " + text);
        socket.emit('join room', text);
        $location.path('/student');
    };

    $scope.deleteRoom = function (index, obj) {
        socket.emit('room delete', index, obj, document.cookie.slice(4,20));
    };

    // Socket listeners
    socket.on('room message', function (room) {
        console.log('A new room was created:  ', room);
        $scope.kolabDBScope.push(room);
        $scope.$apply();
    });

    socket.on('delete room broadcast', function (index, room) {
        console.log('A room was deleted:  ', room);
        $scope.kolabDBScope.splice(index, 1);
        $scope.$apply();
    });



    // Function for making user ID
    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

}]);
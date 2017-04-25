kolabApp.controller('frontCtrl', ['$scope', "$location", '$http', 'socket', 'alertService', function ($scope, $location, $http, socket, alertService) {

    var userIDCookie = "";
    var clicksCookie = "";
    var normalCookie = "";
    var roomCookie = "";

    $scope.go = function (path) {
        $location.path(path);
    };

    // JQuery: Prevents enter from making a newline without using shift modifier
    $('#textareaNewRoom').keydown(function (e) {
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
        }

        // Prevents certain keycodes from being pressed;  " , #, $
        if (e.keyCode == 50 && e.shiftKey || e.keyCode == 51 && e.shiftKey || e.keyCode == 52 && e.shiftKey) {
            alertService.addWarning("Special characters are not allowed in rooms.", true);
            e.preventDefault();
        }
    });

    // JQuery: Prevents enter from making a newline without using shift modifier
    $('#textareaJoinRoom').keydown(function (e) {
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
        }
    });


    function checkCookie() {
        if (document.cookie != "") {
            alertService.addSuccess("Welcome back!", true);
        } else {
            document.cookie = "key=11111" + randomString(16, '0123456789abcdef');
            socket.emit('cookie initialize', normalCookie);
            alertService.addWarning("We use cookies to improve your experience and to keep Kolab easy to use. " +
                "By your continued use of this site you accept such use."
            );

        }
    }


    // initial retrieval of questions from the database
    var refresh = function () {
        checkCookie();

        userIDCookie = document.cookie.slice(9, 25);
        clicksCookie = document.cookie.slice(4, 9);
        normalCookie = document.cookie.slice(4, 25);
        roomCookie = document.cookie.slice(25);


        $scope.myRooms = [];

        $http.get('/roomsCollection').then(function (response) {
                $scope.kolabDBScope = response.data;

                for (var i = 0; i < $scope.kolabDBScope.length; i++) { // Looping through scope to check if room is ours
                    if ($scope.kolabDBScope[i].creator === userIDCookie) {
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
        var availRoom = true;


        // Testing to see if the room is in the list of rooms locally
        if ($scope.newRoom != null && $scope.newRoom.text.trim().length) {
            for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                if ($scope.kolabDBScope[i].room === $('#textareaNewRoom').val()) {
                    availRoom = false;
                }
            }
            if (availRoom) { // If it is available, we create the room

                document.cookie = document.cookie.substring(0, 25);
                document.cookie += $('#textareaNewRoom').val();

                socket.emit('new room message', $('#textareaNewRoom').val(), userIDCookie);

                $('#textareaNewRoom').val('');
                $location.path('/lecturer');
                return false;
            } else {
                alertService.addError("That room already exists!", true);
            }
        }


        else {
            alertService.addWarning("Invalid string!", true);
        }

    };


    $scope.joinRoom = function () {
        if ($scope.joinRoom != null && $('#textareaJoinRoom').val().length) { // Checks if the user has typed anything in the field
            for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                if ($scope.kolabDBScope[i].room === $('#textareaJoinRoom').val()) {

                    if (document.cookie.length > 25) { // If the user left the room by using browsers back button
                        socket.emit('leave room', document.cookie.substring(4, 25)); // We send a message to the server to remove the clicks from that room
                    }
                    document.cookie = "key=11111" + userIDCookie; //Removing votes and room values
                    document.cookie += $('#textareaJoinRoom').val();
                    $('#textareaJoinRoom').val('');
                    $location.path('/student');
                    return false;
                }
            }
        } else {
            alertService.addWarning("You need to type out name of the room you want to join", true);
        }
    };

    $scope.joinExistingRoom = function (room) {
        if (document.cookie.length > 25) {
            socket.emit('leave room', document.cookie.substring(4, 25));
        }
        document.cookie = "key=11111" + userIDCookie; //Removing votes and room values
        document.cookie += room;
        $location.path('/student');
    };

    $scope.joinMyRoom = function (room) {
        document.cookie = document.cookie.substring(0, 25);//removes old room if there is one
        document.cookie += room;
        $location.path('/lecturer');
    };

    $scope.deleteRoom = function (index, obj) {
        socket.emit('room delete', index, obj, userIDCookie);
        $scope.myRooms.splice(index, 1);
    };

// Socket listeners
    socket.on('new room broadcast', function (room) {
        $scope.kolabDBScope.push(room);
        $scope.$apply();
    });

    socket.on('delete room broadcast', function (index, roomName) {

        // Checking through the list of available rooms
        for (var i = 0; i < $scope.kolabDBScope.length; i++) {
            if ($scope.kolabDBScope[i].room == roomName) {
                $scope.kolabDBScope.splice(i, 1);
                $scope.$apply();
                break;
            }
        }
        // Checking through the list of your rooms
        for (var x = 0; x < $scope.myRooms.length; x++) {
            if ($scope.myRooms[x].room == roomName) {
                $scope.myRooms.splice(x, 1);
                $scope.$apply();
                break;
            }
        }

    });

    //doesnt this have to be in all the controllers?
    socket.on('resetVotes', function () {
        useridcounters = "key=11111" + userIDCookie;
        document.cookie = useridcounters + roomCookie;
    });


// Function for making user ID
    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

}]);
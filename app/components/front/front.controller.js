kolabApp.controller('frontCtrl', ['$scope', "$location", '$http', 'socket', 'alertService', function ($scope, $location, $http, socket, alertService) {

    console.log("Current cookie: ", document.cookie);

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
        if (e.keyCode == 50 && e.shiftKey || e.keyCode == 51 && e.shiftKey || e.keyCode == 52 && e.shiftKey) {
            alertService.addWarning("Special characters are not allowed in rooms.", true);
            e.preventDefault();
        }
    });

    // Prevents enter from making a newline without using shift modifier
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


        console.log("Normal cookie , ", normalCookie);
        console.log("UserID: ", userIDCookie);
        console.log("Clicks: ", clicksCookie);
        console.log("Room: ", roomCookie);

        $scope.myRooms = [];

        // TODO Cookie initialize here maybe

        $http.get('/roomsCollection').then(function (response) {
                console.log("I got the data I requested", response.data);
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
        console.log("method new room called");
        var availRoom = true;
        // And newroom not in scope
        if ($scope.newRoom != null && $scope.newRoom.text.trim().length) {
            for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                if ($scope.kolabDBScope[i].room === $('#textareaNewRoom').val()) {
                    availRoom = false;
                    console.log("How often does this happen");
                }
            }
            if (availRoom) {

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
            console.log("Invalid string");
        }

    };


    $scope.joinRoom = function () {//really unfinished, same with createroom, needs functioning if sentence
        console.log("method join room called", $scope.kolabDBScope);
        if ($scope.joinRoom != null && $('#textareaJoinRoom').val().length) {
            for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                if ($scope.kolabDBScope[i].room === $('#textareaJoinRoom').val()) {
                    console.log("Trying to join room ", $('#textareaJoinRoom').val());
                    document.cookie = document.cookie.substring(4, 25);
                    console.log("Cookie after splicing: ", document.cookie);
                    document.cookie += $('#textareaJoinRoom').val();

                    $('#textareaJoinRoom').val('');
                    $location.path('/student');
                    return false;
                }
            }
        } else {
            alertService.addWarning("You need to type out the room you want to join", true);
        }

    };
    $scope.joinExistingRoom = function (room) {
        document.cookie = document.cookie.substring(0, 25);
        document.cookie += room;
        console.log("This is the name of the room: " + room);
        console.log("We spliced the cookie and now it is : ", document.cookie);
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
        console.log('A new room was created: ', room);
        $scope.kolabDBScope.push(room);
        $scope.$apply();
    });

    socket.on('delete room broadcast', function (index, roomName) {
        console.log('A room was deleted:  ', roomName);
        for (var i = 0; i < $scope.kolabDBScope.length; i++) {
            if ($scope.kolabDBScope[i].room == roomName) {
                $scope.kolabDBScope.splice(i, 1);
                $scope.$apply();
                break;
            }
        }

    });


// Function for making user ID
    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

}])
;
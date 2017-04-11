kolabApp.controller('frontCtrl', ['$scope', "$location", '$http', 'socket', function ($scope, $location, $http, socket) {
    $scope.go = function (path) {
        $location.path(path);
    };

    $('#textareaNewRoom').keydown(function (e) {
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
        }
    });


    $('#textareaJoinRoom').keydown(function (e) {
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
        }
    });

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
                        console.log("Adding room because we created it", $scope.kolabDBScope[i].room);
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

                document.cookie = document.cookie.substring(0, 20);
                document.cookie += $('#textareaNewRoom').val();

                socket.emit('new room message', $('#textareaNewRoom').val(), document.cookie.slice(4, 20));
                //socket.emit('join room', $('#textareaNewRoom').val());

                $('#textareaNewRoom').val('');
                $location.path('/lecturer');
                return false;
            } else {
                alert("That room already exists!");
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
                    document.cookie = document.cookie.substring(0, 20);
                    document.cookie += $('#textareaJoinRoom').val();

                    $('#textareaJoinRoom').val('');
                    $location.path('/student');
                    return false;
                }
            }
        }
    };
    $scope.joinExistingRoom = function (room) {
        document.cookie = document.cookie.substring(0, 20);
        document.cookie += room;
        console.log("This is the name of the room: " + room);
        $location.path('/student');
    };

    $scope.joinMyRoom = function (room) {
        document.cookie = document.cookie.substring(0, 20);//removes old room if there is one
        document.cookie += room;
        $location.path('/lecturer');
    };

    $scope.deleteRoom = function (index, obj) {
        socket.emit('room delete', index, obj, document.cookie.slice(4, 20));
        $scope.myRooms.splice(index, 1);
    };

// Socket listeners
    socket.on('new room broadcast', function (room) {
        console.log('A new room was created: ', room);
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

}])
;
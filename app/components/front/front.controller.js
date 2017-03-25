kolabApp.controller('frontCtrl', ['$scope', "$location", '$http', 'socket', function ($scope, $location, $http, socket) {
    $scope.go = function (path) {
        $location.path(path);
    };


    // initial retrieval of questions from the database
    var refresh = function () {
        $http.get('/roomsCollection').then(function (response) {
                console.log("I got the data I requested");
                $scope.kolabDBScope = response.data;
                //$scope.room = null;
            },
            function (error) {
                console.log("I got ERROR");
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
        console.log("This is the index of the room we're trying to join: " + index + "\n and this is the text: " + text);
        socket.emit('join existing room', index, text);
        $location.path('/student');

    };


}]);
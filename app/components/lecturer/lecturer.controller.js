kolabApp.controller('lecturerCtrl', ['$scope', '$http','socket', function ($scope, $http, socket) {
    console.log("Hello World from controller");


    // initial retrieval of questions from the database
    var refresh = function () {
        $http.get('/roomsQuestionsCollection').then(function (response) {
                console.log("I got the data I requested");
                $scope.kolabDBScope = response.data;
                $scope.question = null;
            },
            function (error) {
                console.log("I got ERROR");
            });
    };

    refresh();

    $scope.studentView = function () {
        console.log("cantKeepUp button was clicked");
    };

    // remove function bound to the delete buttons in lecture view
    $scope.remove = function (index, id) {
        console.log("This is the index of the question we're trying to delete: " +index+ "\n and this is the ID: "+id);
        socket.emit('question delete', index, id);

    };

    // socket message "question delete" and the response to that message
    socket.on('question delete', function (index, id) {
        console.log("Trying to delete message (SOCKET) with ID: " + id);
        console.log("kolabDBScope object: ");

        $scope.kolabDBScope.splice(index, 1);
        $scope.$apply();
    });

    // socket message "question message" and the response to that message
    socket.on('question message', function (msg) {
        console.log('Trying to populate the table with questions with ID: ' + msg._id);
        $scope.kolabDBScope.push(msg);
        $scope.$apply();

    });
}]);
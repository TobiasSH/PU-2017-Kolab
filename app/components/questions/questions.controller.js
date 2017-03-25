kolabApp.controller('questionsCtrl', ['$scope', '$http','socket', function ($scope, $http, socket) {
    console.log("Hello World from questions-controller");



    // initial retrieval of questions from the database
    var refresh = function () {
        $http.get('/roomsQuestionsCollection').then(function (response) {
                console.log("I go8t the data I requested, questions-controller");
                console.log("This is the pure response object:"+ response.text);
                console.log("This is the room we're in: "+ String(socket.room));
                $scope.kolabDBScope = response.data;
              //  $scope.question = null;
            },
            function (error) {
                console.log("I got ERROR");
            });
    };
    refresh();


    // remove function bound to the delete buttons in lecture view
    $scope.sendQuestion = function () {
        if ($scope.question != null && $scope.question.text.trim().length) {
            socket.emit('question message', $('#textareaQ').val(), socket.currentRoom);
            $('#textareaQ').val('');
            return false;
        } else {
            refresh();
        }
    };

    // socket message "question delete" and the response to that message
    socket.on('question delete', function (index, id) {
        console.log("Trying to delete message (SOCKET) with ID: " + id);
        $scope.kolabDBScope.splice(index,1);
        $scope.$apply();
    });

    // socket message "question message" and the response to that message
    socket.on('question message', function(msg){
        console.log('Trying to populate the table with questions... MSG= '+msg);
        $scope.kolabDBScope.push(msg);
        $scope.$apply();
    });

}]);
kolabApp.controller('questionsCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from questions-controller");

    var socket = io();



    var refresh = function () {
        $http.get('/questionsCollection').then(function (response) {
                console.log("I got the data I requested, questions-controller");
                console.log("This is the pure response object:"+ response.text);
                $scope.kolabDBScope = response.data;
                $scope.question = null;
            },
            function (error) {
                console.log("I got ERROR");
            });
    };

    refresh();

    $scope.sendQuestion = function () {
        if ($scope.question != null && $scope.question.text.trim().length) {
            socket.emit('question message', $('#textareaQ').val());
            $('#textareaQ').val('');
            return false;

        } else {
            refresh();
        }


    };
    socket.on('question message', function(msg){
        console.log('Trying to populate the table with questions...'+msg._id);
        $('#questionsTable' ).find('tbody').prepend($('<tr class="questionRows">').prepend($('<td class="td-question">').text(msg.text)));

    });

}]);
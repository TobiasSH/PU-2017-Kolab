kolabApp.controller('lecturerCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from controller");

    var socket = io();


    var refresh = function () {
        $http.get('/questionsCollection').then(function (response) {
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

    $scope.remove = function (id) {
        console.log(id);
        $http.delete('/questionsCollection/' + id).then(function (response) {
            refresh();
        });
    };


    socket.on('question message', function(msg){
        console.log(msg);
        console.log('Trying to populate the table with questions...');
        $('#lecturerTable' ).find('tbody').append($('<tr class="questionRows">').prepend($('<td class="td-question">').text(msg)).append($('<td>').append($('<button class="btn btn-danger btn-lg btn-block btn-remove" ng-click="remove(question._id)">Remove</button>'))));

        /*<td>
        <button class="btn btn-danger btn-lg btn-block btn-remove" ng-click="remove(question._id)">Remove
            </button>
            </td>
        */

    });
}]);
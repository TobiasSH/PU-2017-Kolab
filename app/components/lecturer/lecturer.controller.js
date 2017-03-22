kolabApp.controller('lecturerCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from controller");

    var socket = io();
    var hitCount;

    // initial retrieval of questions from the database
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
    $scope.resetVotes = function() {
        socket.emit('resetVotes');
        console.log("votes reset")
    }


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
    socket.on('resetVotes', function(){
        var cantKeepUpBar = document.getElementById("cantKeepUpBar");
        var decreaseVolumeBar = document.getElementById("decreaseVolumeBar");
        var increaseVolumeBar = document.getElementById("increaseVolumeBar");
        var decreaseSpeedBar = document.getElementById("decreaseSpeedBar");
        var increaseSpeedBar = document.getElementById("increaseSpeedBar");
        cantKeepUpBar.style.width=0+'%';
        decreaseVolumeBar.style.width=0+'%';
        increaseVolumeBar.style.width=0+'%';
        increaseSpeedBar.style.width=0+'%';
        decreaseSpeedBar.style.width=0+'%';

    })
    socket.on('cantKeepUp',function(max){

        $http.get('/cantKeepUp').then(function (response){
            hitCount = response.data.hits;

        });
        console.log(hitCount + "hit get on");
        percent = (hitCount/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(hitCount + " hits")
        console.log("cant keeep up lecture side");
        var elem = document.getElementById("cantKeepUpBar");


        elem.style.width=percent+'%';

    });
    socket.on('decreaseVolume', function(max){
        console.log("decrease volume lecture side");
        $http.get('/decreaseVolume').then(function (response){
            hitCount = response.data.hits;

        });
        percent = (hitCount/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(hitCount + " hits")
        console.log("decrease up lecture side");
        var elem = document.getElementById("decreaseVolumeBar");


        elem.style.width=percent+'%';
    });
    socket.on('increaseVolume', function(max){
        console.log("increaseses volumes lecture side");
        $http.get('/increaseVolume').then(function (response){
            hitCount = response.data.hits;

        });
        percent = (hitCount/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(hitCount + " hits")
        console.log("increase vol up lecture side");
        var elem = document.getElementById("increaseVolumeBar");


        elem.style.width=percent+'%';

    });
    socket.on('decreaseSpeed', function(max){
        console.log("decerease speed lecture side");
        $http.get('/decreaseSpeed').then(function (response){
            hitCount = response.data.hits;

        });
        percent = (hitCount/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(hitCount + " hits")
        console.log("decrease speed lecture side");
        var elem = document.getElementById("decreaseSpeedBar");


        elem.style.width=percent+'%';


    });
    socket.on('increaseSpeed', function(max){
        console.log("incerease speed lecture side");
        $http.get('/increaseSpeed').then(function (response){
            hitCount = response.data.hits;

        });
        percent = (hitCount/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(hitCount + " hits")
        console.log("increase speed lecture side");
        var elem = document.getElementById("increaseSpeedBar");


        elem.style.width=percent+'%';


    });

}]);
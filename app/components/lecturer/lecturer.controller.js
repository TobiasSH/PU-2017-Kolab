kolabApp.controller('lecturerCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from controller");

    var socket = io();

    var cantKeepUpHits;
    var decreaseVolumeHits;
    var increaseVolumeHits;
    var decreaseSpeedHits;
    var increaseSpeedHits;
    var total;
    var cantKeepUpBar = document.getElementById("cantKeepUpBar");
    var decreaseVolumeBar = document.getElementById("decreaseVolumeBar");
    var increaseVolumeBar = document.getElementById("increaseVolumeBar");
    var decreaseSpeedBar = document.getElementById("decreaseSpeedBar");
    var increaseSpeedBar = document.getElementById("increaseSpeedBar");


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
        $http.get('/counters').then(function(response){
            cantKeepUpHits =  response.data[0].hits;
            decreaseVolumeHits =  response.data[1].hits;
            increaseVolumeHits =  response.data[2].hits;
            decreaseSpeedHits =  response.data[3].hits;
            increaseSpeedHits =  response.data[4].hits;
            total = response.data[5].hits;
            console.log(total + " kn");
            var percent = (cantKeepUpHits/(total))*100;
            cantKeepUpBar.style.width=percent+'%';
            var percent = (decreaseVolumeHits/(total))*100;
            decreaseVolumeBar.style.width=percent+'%';
            var percent = (increaseVolumeHits/(total))*100;
            increaseVolumeBar.style.width=percent+'%';
            var percent = (decreaseSpeedHits/(total))*100;
            decreaseSpeedBar.style.width=percent+'%';
            var percent = (increaseSpeedHits/(total))*100;
            increaseSpeedBar.style.width=percent+'%';

        })




    };

    refresh();

    $scope.studentView = function () {
        console.log("cantKeepUp button was clicked");
    };
    $scope.resetVotes = function() {
        cantKeepUpBar.style.width=0+'%';
        decreaseVolumeBar.style.width=0+'%';
        increaseVolumeBar.style.width=0+'%';
        increaseSpeedBar.style.width=0+'%';
        decreaseSpeedBar.style.width=0+'%';
        cantKeepUpHits =  0;
        decreaseVolumeHits =  0;
        increaseVolumeHits =  0;
        decreaseSpeedHits =  0;
        increaseSpeedHits =  0;


        socket.emit('resetVotes');
        console.log("votes reset");
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

    //Progress bars
    socket.on('cantKeepUp',function(hit,max ){
        cantKeepUpHits += hit;
        var percent = (cantKeepUpHits/(total))*100;
        cantKeepUpBar.style.width=percent+'%';

    });
    socket.on('decreaseVolume', function(hit,max ){
        decreaseVolumeHits += hit;
        var percent = (decreaseVolumeHits/(total))*100;
        decreaseVolumeBar.style.width=percent+'%';
    });
    socket.on('increaseVolume', function(hit,max ){
        increaseVolumeHits += hit;
        var percent = (increaseVolumeHits/(total))*100;
        increaseVolumeBar.style.width=percent+'%';

    });
    socket.on('decreaseSpeed', function(hit,max ){
        decreaseSpeedHits += hit;
        var percent = (decreaseSpeedHits/(total))*100;
        decreaseSpeedBar.style.width=percent+'%';
    });
    socket.on('increaseSpeed', function(hit,max ){
        increaseSpeedHits  += hit;
        var percent = (increaseSpeedHits/(total))*100;
        increaseSpeedBar.style.width=percent+'%';
    });

}]);
kolabApp.controller('lecturerCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from controller");

    var socket = io();
    var hitCount;
    var cantKeepUpHits;
    var decreaseVolumeHits;
    var increaseVolumeHits;
    var decreaseSpeedHits;
    var increaseSpeedHits;

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
            cantKeepUpHits =  response.data[0].hits
            decreaseVolumeHits =  response.data[1].hits
            increaseVolumeHits =  response.data[2].hits
            decreaseSpeedHits =  response.data[3].hits
            increaseSpeedHits =  response.data[4].hits
        })
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
    socket.on('cantKeepUp',function(max, hit){
        cantKeepUpHits += hit;


        console.log(cantKeepUpHits + "hit get on");
        var percent = (cantKeepUpHits/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(cantKeepUpHits + " hits")
        console.log("cant keeep up lecture side");
        var elem = document.getElementById("cantKeepUpBar");


        elem.style.width=percent+'%';

    });
    socket.on('decreaseVolume', function(max,hit){
        decreaseVolumeHits += hit;
        console.log("decrease volume lecture side");

        var percent = (decreaseVolumeHits/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(decreaseVolumeHits + " hits")
        console.log("decrease up lecture side");
        var elem = document.getElementById("decreaseVolumeBar");


        elem.style.width=percent+'%';
    });
    socket.on('increaseVolume', function(max,hit){
        increaseVolumeHits += hit;
        console.log("increaseses volumes lecture side");

        var percent = (increaseVolumeHits/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(increaseVolumeHits + " hits")
        console.log("increase vol up lecture side");
        var elem = document.getElementById("increaseVolumeBar");


        elem.style.width=percent+'%';

    });
    socket.on('decreaseSpeed', function(max,hit){
        decreaseSpeedHits += hit;
        console.log("decerease speed lecture side");

        var percent = (decreaseSpeedHits/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(decreaseSpeedHits + " hits")
        console.log("decrease speed lecture side");
        var elem = document.getElementById("decreaseSpeedBar");


        elem.style.width=percent+'%';


    });
    socket.on('increaseSpeed', function(max,hit){
        increaseSpeedHits  += hit;
        console.log("incerease speed lecture side");

        var percent = (increaseSpeedHits/(max))*100
        console.log(percent +"%")
        console.log(max+" users")
        console.log(increaseSpeedHits + " hits")
        console.log("increase speed lecture side");
        var elem = document.getElementById("increaseSpeedBar");


        elem.style.width=percent+'%';


    });

}]);
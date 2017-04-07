kolabApp.controller('lecturerCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from controller");

    var socket = io();
    var max = 0;

    $scope.grouped = "groupedTrue";

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
                console.log("I got the data I requested, questions-controller");
                console.log("This is the pure response object:" + response.text);
                $scope.kolabDBScope = response.data; //kolabdbscope is deprecated if newtags works
                $scope.question = null;
                //Used to identify the different tags, aka nouns
                $scope.newTags = {};

                for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                    if (!$scope.newTags[$scope.kolabDBScope[i].tag]) {
                        $scope.newTags[$scope.kolabDBScope[i].tag] = [];
                    }
                    $scope.newTags[$scope.kolabDBScope[i].tag].push($scope.kolabDBScope[i]);
                }
                console.log("These are the tags: ", $scope.newTags); //object with array of objects

            },

            function (error) {
                console.log("I got ERROR", error);
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

    $scope.switchView = function () {
        if ($scope.grouped == "groupedTrue") {
            $scope.grouped = "groupedFalse";
        } else {
            $scope.grouped = "groupedTrue";
        }
    };

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
    $scope.remove = function (index, obj) {
        console.log("This is the index of the question we're trying to delete: " + index + "\n and this is the ID: " + obj._id);
        socket.emit('question delete', index, obj);

    };
    // remove from grouped view
    $scope.removeGrouped = function (rowIndex,index, id) {
        console.log("This is the index of the question we're trying to delete: " + index + "\n and this is the ID: " + id);
        socket.emit('question delete grouped',rowIndex, index, id);

    };

    // socket message "question delete" and the response to that message
    socket.on('question delete', function (index, obj) {
        console.log("Trying to delete message (SOCKET) with ID: " + obj._id);

        for (var i = 0; i < $scope.newTags[obj.tag].length; i++){
            if ($scope.newTags[obj.tag][i]._id=== obj._id){
                $scope.newTags[obj.tag].splice(i,1);
            }
        }


        $scope.kolabDBScope.splice(index, 1);
        $scope.$apply();
    });

    socket.on('question delete grouped', function (rowIndex, index, obj) {
        console.log("Grouped: Trying to delete message with ID: " + obj._id + ", and rowIndex: "+rowIndex+ ", and normal index: "+index);
        $scope.newTags[obj.tag].splice(index, 1);
        console.log("Current state of scope: "+ $scope.kolabDBScope);
        for (var i = 0; i < $scope.kolabDBScope.length; i++){
            console.log($scope.kolabDBScope[i]);
            if ($scope.kolabDBScope[i]._id == obj._id){
                $scope.kolabDBScope.splice(i, 1);
                $scope.$apply();
                break;
            }
        }
        $scope.$apply();
    });

    // socket message "question message" and the response to that message
    socket.on('question message', function (msg) {
        console.log(msg.tag);
        $scope.kolabDBScope.push(msg);
        $scope.$apply();
        //needs an if-statement for whether we're on grouped or non-grouped view
        var newcategory = true;
        for (var property in $scope.newTags) {
            if ($scope.newTags.hasOwnProperty(property)) {
                if (msg.tag === property) {
                    console.log("We tried inserting directly into the scope", property);
                    newcategory = false;
                    $scope.newTags[property].push(msg);
                    $scope.$apply();
                    break;
                }
            }
        }
        if (newcategory == true) { //if the tag cannot be found we insert it into the scope
            console.log("Category not found.");
            $scope.newTags[msg.tag] = [];
            $scope.newTags[msg.tag].push(msg);
            $scope.$apply();
        }


    });

    socket.on('resetVotes', function () {
        var cantKeepUpBar = document.getElementById("cantKeepUpBar");
        var decreaseVolumeBar = document.getElementById("decreaseVolumeBar");
        var increaseVolumeBar = document.getElementById("increaseVolumeBar");
        var decreaseSpeedBar = document.getElementById("decreaseSpeedBar");
        var increaseSpeedBar = document.getElementById("increaseSpeedBar");
        cantKeepUpBar.style.width = 0 + '%';
        decreaseVolumeBar.style.width = 0 + '%';
        increaseVolumeBar.style.width = 0 + '%';
        increaseSpeedBar.style.width = 0 + '%';
        decreaseSpeedBar.style.width = 0 + '%';
        cantKeepUpHits = 0;
        decreaseVolumeHits = 0;
        increaseVolumeHits = 0;
        decreaseSpeedHits = 0;
        increaseSpeedHits = 0;

    });
    


    //Progress bars
    socket.on('cantKeepUp',function(hit , total){
        console.log("cantkeepUp")
        cantKeepUpHits += hit;
        var percent = (cantKeepUpHits/(total))*100;
        cantKeepUpBar.style.width=percent+'%';

    });
    socket.on('decreaseVolume', function(hit, total ){
        console.log("decrease volume")
        decreaseVolumeHits += hit;
        console.log(decreaseVolumeHits)
        var percent = (decreaseVolumeHits/(total))*100;
        decreaseVolumeBar.style.width=percent+'%';
    });
    socket.on('increaseVolume', function(hit,total ){
        console.log("inc volume")
        increaseVolumeHits += hit;
        var percent = (increaseVolumeHits/(total))*100;
        increaseVolumeBar.style.width=percent+'%';

    });
    socket.on('decreaseSpeed', function(hit,total ){
        console.log("decrease spped")
        decreaseSpeedHits += hit;
        var percent = (decreaseSpeedHits/(total))*100;
        decreaseSpeedBar.style.width=percent+'%';
    });
    socket.on('increaseSpeed', function(hit,total ){
        console.log("increase speed")
        increaseSpeedHits  += hit;
        var percent = (increaseSpeedHits/(total))*100;
        increaseSpeedBar.style.width=percent+'%';
    });

}]);

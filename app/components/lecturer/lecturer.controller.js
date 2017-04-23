kolabApp.controller('lecturerCtrl', ['$scope', '$http', '$location', 'socket', function ($scope, $http, $location, socket) {
    console.log("Hello World from lecturer-controller");


    var roomName = document.cookie;

    $scope.cantKeepUpPercent = 0;
    $scope.decreaseVolumePercent = 0;
    $scope.increaseVolumePercent = 0;
    $scope.decreaseSpeedPercent = 0;
    $scope.increaseSpeedPercent = 0;

    $scope.grouped = "groupedFalse";

    console.log(document.cookie);
    $scope.roomCookie = document.cookie.slice(21);

    $scope.go = function (path) {
        $location.path(path);
    };


    // initial retrieval of questions from the database
    var refresh = function () {
        $http.get('/ownerTest').then(function (response) {
            if (!response.data) {
                $location.path('/');
            }
        });
        socket.emit('cookie initialize', document.cookie);
        $http.get('/roomsQuestionsCollection').then(function (response) {
                console.log("I got the data I requested, questions-controller");
                console.log("This is the pure response object:" + response.text);
                $scope.kolabDBScope = response.data;
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
        //if user doesnt have a room, we return them to the front-page
        if (roomName.length <= 21) { //TODO NEEDS CHECK FOR USERID VS CREATOR OF ROOM
            console.log("New user, returning to start");
            $location.path('/');
        } else {//we join the socket we're supposed to be on, based on our room
            socket.emit('join room lecturer', roomName.slice(21));
        }

        $http.get('/counters').then(function (response) {

            $scope.cantKeepUpHits = response.data[0].cantKeepUp;
            $scope.decreaseVolumeHits = response.data[0].decreaseVolume;
            $scope.increaseVolumeHits = response.data[0].increaseVolume;
            $scope.decreaseSpeedHits = response.data[0].decreaseSpeed;
            $scope.increaseSpeedHits = response.data[0].increaseSpeed;
            $scope.userCount = response.data[0].userCount;

            $scope.cantKeepUpPercent = cantKeepUpPercentCalc();
            $scope.decreaseVolumePercent = decreaseVolumePercentCalc();
            $scope.increaseVolumePercent = increaseVolumePercentCalc();
            $scope.decreaseSpeedPercent = decreaseVolumePercentCalc();
            $scope.increaseSpeedPercent = increaseSpeedPercentCalc();

            // Active bar animations when % is higher than 75
            $scope.activeAnimationCKU = "";
            $scope.activeAnimationDV = "";
            $scope.activeAnimationIV = "";
            $scope.activeAnimationDS = "";
            $scope.activeAnimationIS = "";

            //Checks which color the bars should be
            cantKeepUpCheck();
            decreaseVolumeCheck();
            increaseVolumeCheck();
            decreaseSpeedCheck();
            increaseSpeedCheck();

        })

    };

    refresh();

    $scope.switchView = function () {
        if ($scope.grouped == "groupedTrue") {
            $scope.grouped = "groupedFalse";
            document.getElementById("groupedButton").innerHTML = "Grouped";
        } else {
            $scope.grouped = "groupedTrue";
            document.getElementById("groupedButton").innerHTML = "Ungrouped";
        }
    };

    $scope.leaveRoom = function () {
        socket.emit('leave room lecturer', document.cookie.slice(21));
        userid = document.cookie.substring(5, 21);
        document.cookie = '11111' + userid;
        $location.path('/');
    };


    /*$scope.studentView = function () {
        console.log("cantKeepUp button was clicked");
    };*/

    // reset votes button function
    $scope.resetVotes = function () {

        $scope.cantKeepUpHits = 0;
        $scope.decreaseVolumeHits = 0;
        $scope.increaseVolumeHits = 0;
        $scope.decreaseSpeedHits = 0;
        $scope.increaseSpeedHits = 0;

        $scope.cantKeepUpPercent = 0;
        $scope.decreaseVolumePercent = 0;
        $scope.increaseVolumePercent = 0;
        $scope.decreaseSpeedPercent = 0;
        $scope.increaseSpeedPercent = 0;

        cantKeepUpCheck();
        decreaseVolumeCheck();
        increaseVolumeCheck();
        decreaseSpeedCheck();
        increaseSpeedCheck();



        socket.emit('resetVotes', $scope.roomCookie);
        console.log("votes reset");
    };


    // remove function bound to the delete buttons in lecture view
    $scope.remove = function (index, obj) {
        console.log("This is the index of the question we're trying to delete: " + index + "\n and this is the ID: " + obj._id);
        socket.emit('question delete', index, obj);

    };
    // remove from grouped view
    $scope.removeGrouped = function (rowIndex, index, id) {
        console.log("This is the index of the question we're trying to delete: " + index + "\n and this is the ID: " + id);
        socket.emit('question delete grouped', rowIndex, index, id);

    };

    // socket listener for questions deleted in the normal question view at lecturer
    socket.on('question delete', function (index, obj) {
        console.log("Trying to delete message (SOCKET) with ID: " + obj._id);

        for (var i = 0; i < $scope.newTags[obj.tag].length; i++) {
            if ($scope.newTags[obj.tag][i]._id === obj._id) {
                $scope.newTags[obj.tag].splice(i, 1);
            }
        }


        $scope.kolabDBScope.splice(index, 1);
        $scope.$apply();
    });

    // socket listener for questions deleted while in "group view" at lecturer
    socket.on('question delete grouped', function (rowIndex, index, obj) {
        console.log("Grouped: Trying to delete message with ID: " + obj._id + ", and rowIndex: " + rowIndex + ", and normal index: " + index);
        $scope.newTags[obj.tag].splice(index, 1);
        console.log("Current state of scope: " + $scope.kolabDBScope);
        for (var i = 0; i < $scope.kolabDBScope.length; i++) {
            console.log($scope.kolabDBScope[i]);
            if ($scope.kolabDBScope[i]._id == obj._id) {
                $scope.kolabDBScope.splice(i, 1);
                $scope.$apply();
                break;
            }
        }
        $scope.$apply();
    });

    // socket listener for new questions
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

    // Percentage calculations for chrome
    var cantKeepUpPercentCalc = function (){
        if ($scope.userCount == 0){
            return 0;
        }else{
            return parseInt(($scope.cantKeepUpHits / $scope.userCount) * 100);
        }
    };


    var decreaseVolumePercentCalc = function (){
        if ($scope.userCount == 0){
            return 0;
        }else{
            return parseInt(($scope.decreaseVolumeHits / $scope.userCount) * 100);
        }
    };

    var increaseVolumePercentCalc = function (){
        if ($scope.userCount == 0){
            return 0;
        }else{
            return parseInt(($scope.increaseVolumeHits / $scope.userCount) * 100);
        }
    };

    var decreaseSpeedPercentCalc = function (){
        if ($scope.userCount == 0){
            return 0;
        }else{
            return parseInt(($scope.decreaseSpeedHits / $scope.userCount) * 100);
        }
    };

    var increaseSpeedPercentCalc = function (){
        if ($scope.userCount == 0){
            return 0;
        }else{
            return parseInt(($scope.increaseSpeedHits / $scope.userCount) * 100);
        }
    };



    // Progress bar type checks
    var cantKeepUpCheck = function () {

        if ($scope.cantKeepUpPercent >= 75) {
            $scope.cantKeepUpStyle = 'progress-bar-danger';
            $scope.activeAnimationCKU = "active";
        } else if ($scope.cantKeepUpPercent < 75 && $scope.cantKeepUpPercent >= 50) {
            $scope.cantKeepUpStyle = 'progress-bar-warning';
            $scope.activeAnimationCKU = "";
        } else if ($scope.cantKeepUpPercent < 50 && $scope.cantKeepUpPercent >= 25) {
            $scope.cantKeepUpStyle = 'progress-bar-success';
            $scope.activeAnimationCKU = "";
        } else {
            $scope.cantKeepUpStyle = 'progress-bar-info';
            $scope.activeAnimationCKU = "";
        }
    };

    var decreaseVolumeCheck = function () {

        if ($scope.decreaseVolumePercent >= 75) {
            $scope.decreaseVolumeStyle = 'progress-bar-danger';
            $scope.activeAnimationDV = "active";
        } else if ($scope.decreaseVolumePercent < 75 && $scope.decreaseVolumePercent >= 50) {
            $scope.decreaseVolumeStyle = 'progress-bar-warning';
            $scope.activeAnimationDV = "";
        } else if ($scope.decreaseVolumePercent < 50 && $scope.decreaseVolumePercent >= 25) {
            $scope.decreaseVolumeStyle = 'progress-bar-success';
            $scope.activeAnimationDV = "";
        } else {
            $scope.decreaseVolumeStyle = 'progress-bar-info';
            $scope.activeAnimationDV = "";
        }
    };

    var increaseVolumeCheck = function () {

        if ($scope.increaseVolumePercent >= 75) {
            $scope.increaseVolumeStyle = 'progress-bar-danger';
            $scope.activeAnimationIV = "active";
        } else if ($scope.increaseVolumePercent < 75 && $scope.increaseVolumePercent >= 50) {
            $scope.increaseVolumeStyle = 'progress-bar-warning';
            $scope.activeAnimationIV = "";
        } else if ($scope.increaseVolumePercent < 50 && $scope.increaseVolumePercent >= 25) {
            $scope.increaseVolumeStyle = 'progress-bar-success';
            $scope.activeAnimationIV = "";
        } else {
            $scope.increaseVolumeStyle = 'progress-bar-info';
            $scope.activeAnimationIV = "";
        }
    };

    var decreaseSpeedCheck = function () {

        if ($scope.decreaseSpeedPercent >= 75) {
            $scope.decreaseSpeedStyle = 'progress-bar-danger';
            $scope.activeAnimationDS = "active";
        } else if ($scope.decreaseSpeedPercent < 75 && $scope.decreaseSpeedPercent >= 50) {
            $scope.decreaseSpeedStyle = 'progress-bar-warning';
            $scope.activeAnimationDS = "";
        } else if ($scope.decreaseSpeedPercent < 50 && $scope.decreaseSpeedPercent >= 25) {
            $scope.decreaseSpeedStyle = 'progress-bar-success';
            $scope.activeAnimationDS = "";
        } else {
            $scope.decreaseSpeedStyle = 'progress-bar-info';
            $scope.activeAnimationDS = "";
        }
    };

    var increaseSpeedCheck = function () {

        if ($scope.increaseSpeedPercent >= 75) {
            $scope.increaseSpeedStyle = 'progress-bar-danger';
            $scope.activeAnimationIS = "active";
        } else if ($scope.increaseSpeedPercent < 75 && $scope.increaseSpeedPercent >= 50) {
            $scope.increaseSpeedStyle = 'progress-bar-warning';
            $scope.activeAnimationIS = "";
        } else if ($scope.increaseSpeedPercent < 50 && $scope.increaseSpeedPercent >= 25) {
            $scope.increaseSpeedStyle = 'progress-bar-success';
            $scope.activeAnimationIS = "";
        } else {
            $scope.increaseSpeedStyle = 'progress-bar-info';
            $scope.activeAnimationIS = "";
        }
    };

    //Progress bars socket listeners
    socket.on('cantKeepUp', function (mod, total) {//total is not being sent?
        $scope.cantKeepUpHits += mod;
        $scope.cantKeepUpPercent = cantKeepUpPercentCalc();

        cantKeepUpCheck();
        $scope.$apply();

    });
    socket.on('decreaseVolume', function (mod, total) {
        $scope.decreaseVolumeHits += mod;
        $scope.decreaseVolumePercent = decreaseVolumePercentCalc();

        decreaseVolumeCheck();
        $scope.$apply();
    });
    socket.on('increaseVolume', function (mod, total) {
        $scope.increaseVolumeHits += mod;
        $scope.increaseVolumePercent = increaseVolumePercentCalc();

        increaseVolumeCheck();
        $scope.$apply();
    });
    socket.on('decreaseSpeed', function (mod, total) {
        $scope.decreaseSpeedHits += mod;
        $scope.decreaseSpeedPercent = decreaseSpeedPercentCalc();

        decreaseSpeedCheck();
        $scope.$apply();
    });
    socket.on('increaseSpeed', function (mod, total) {
        $scope.increaseSpeedHits += mod;
        $scope.increaseSpeedPercent = increaseSpeedPercentCalc();

        increaseSpeedCheck();
        $scope.$apply();
    });

    socket.on('storeClient', function (modifier) {
        console.log("New user joined ", $scope.userCount);
        $scope.userCount += modifier;

        $scope.cantKeepUpPercent = cantKeepUpPercentCalc();
        $scope.decreaseVolumePercent = decreaseVolumePercentCalc();
        $scope.increaseVolumePercent = increaseVolumePercentCalc();
        $scope.decreaseSpeedPercent = decreaseSpeedPercentCalc();
        $scope.increaseSpeedPercent = increaseSpeedPercentCalc();

        cantKeepUpCheck();
        decreaseVolumeCheck();
        increaseVolumeCheck();
        decreaseSpeedCheck();
        increaseSpeedCheck();

        $scope.$apply();
    });

    //On the even rarer occassion a room is being deleted while the lecturer is still in it, can be multi-tab
    socket.on('delete current room', function () {
        $location.path('/');
        $scope.$apply();
    });

}]);

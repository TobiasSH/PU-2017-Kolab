kolabApp.controller('lecturerCtrl', ['$scope', '$http', '$location', 'socket','alertService', function ($scope, $http, $location, socket, alertService) {

    var userIDCookie = document.cookie.slice(9, 25);
    var normalCookie = document.cookie.slice(4, 25);
    var roomCookie = document.cookie.slice(25);

    $scope.scopeRoomCookie = roomCookie;

    $scope.cantKeepUpPercent = 0;
    $scope.decreaseVolumePercent = 0;
    $scope.increaseVolumePercent = 0;
    $scope.decreaseSpeedPercent = 0;
    $scope.increaseSpeedPercent = 0;

    $scope.grouped = "groupedFalse";

    $scope.go = function (path) {
        $location.path(path);
    };


    // initial retrieval of questions from the database
    var refresh = function () {
        $http.get('/ownerTest').then(function (response) {
            if (!response.data) {
                alertService.addError("You do not belong here!", true);
                $location.path('/');
            }
        });
        socket.emit('cookie initialize', document.cookie);
        $http.get('/roomsQuestionsCollection').then(function (response) {

                $scope.kolabDBScope = response.data;
                $scope.question = null;
                //Used to identify the different tags, aka nouns
                $scope.newTags = {};

                for (var i = 0; i < $scope.kolabDBScope.length; i++) {
                    if (!$scope.newTags[$scope.kolabDBScope[i].tag]) {
                        $scope.newTags[$scope.kolabDBScope[i].tag] = [];
                    }
                    $scope.newTags[$scope.kolabDBScope[i].tag].push($scope.kolabDBScope[i]);//object with array of objects
                }


            },

            function (error) {
                console.log("I got ERROR", error);
            });

        //if user doesnt have a room, we return them to the front-page
        if (document.cookie.length <= 25) {
            alertService.addError("You do not belong here!");
            $location.path('/');
        } else {//we join the socket we're supposed to be on, based on our cookie
            socket.emit('join room lecturer', roomCookie);
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
        socket.emit('leave room lecturer', roomCookie);
        document.cookie = "key=11111" + userIDCookie;
        $location.path('/');
    };


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


        socket.emit('resetVotes', roomCookie);
    };


// remove function bound to the delete buttons in lecture view
    $scope.remove = function (index, obj) {
        socket.emit('question delete', index, obj);

    };
    // remove from grouped view
    $scope.removeGrouped = function (rowIndex, index, id) {
        socket.emit('question delete grouped', rowIndex, index, id);

    };

    // socket listener for questions deleted in the normal question view at lecturer
    socket.on('question delete', function (index, obj) {
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
        $scope.newTags[obj.tag].splice(index, 1);
        for (var i = 0; i < $scope.kolabDBScope.length; i++) {
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
        $scope.kolabDBScope.push(msg);
        $scope.$apply();
        //needs an if-statement for whether we're on grouped or non-grouped view
        var newcategory = true;
        for (var property in $scope.newTags) {
            if ($scope.newTags.hasOwnProperty(property)) {
                if (msg.tag === property) {
                    newcategory = false;
                    $scope.newTags[property].push(msg);
                    $scope.$apply();
                    break;
                }
            }
        }
        if (newcategory == true) { //if the tag cannot be found we insert it into the scope
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
    socket.on('cantKeepUp', function (mod) {
        $scope.cantKeepUpHits += mod;
        $scope.cantKeepUpPercent = cantKeepUpPercentCalc();

        cantKeepUpCheck();
        $scope.$apply();

    });
    socket.on('decreaseVolume', function (mod) {
        $scope.decreaseVolumeHits += mod;
        $scope.decreaseVolumePercent = decreaseVolumePercentCalc();

        decreaseVolumeCheck();
        $scope.$apply();
    });
    socket.on('increaseVolume', function (mod) {
        $scope.increaseVolumeHits += mod;
        $scope.increaseVolumePercent = increaseVolumePercentCalc();

        increaseVolumeCheck();
        $scope.$apply();
    });
    socket.on('decreaseSpeed', function (mod) {
        $scope.decreaseSpeedHits += mod;
        $scope.decreaseSpeedPercent = decreaseSpeedPercentCalc();

        decreaseSpeedCheck();
        $scope.$apply();
    });
    socket.on('increaseSpeed', function (mod) {
        $scope.increaseSpeedHits += mod;
        $scope.increaseSpeedPercent = increaseSpeedPercentCalc();

        increaseSpeedCheck();
        $scope.$apply();
    });

    socket.on('storeClient', function (modifier) {
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
        alertService.addWarning("Your room was deleted!");
        $location.path('/');
        $scope.$apply();
    });

}]);

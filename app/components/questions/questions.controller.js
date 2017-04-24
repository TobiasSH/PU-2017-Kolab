kolabApp.controller('questionsCtrl', ['$scope', '$http','$location', 'socket', function ($scope, $http, $location, socket) {
    console.log("Hello World from questions-controller");


    console.log("Current cookie: ", document.cookie);

    var userIDCookie = document.cookie.slice(9, 25);
    var normalCookie = document.cookie.slice(4, 25);
    var roomCookie = document.cookie.slice(25);

    $scope.scopeRoomCookie = roomCookie;

    $scope.grouped = "groupedFalse";

    $scope.go = function (path) {
        $location.path(path);
    };

    // initial retrieval of questions from the database
    var refresh = function () {
        socket.emit('cookie initialize', normalCookie);
        $http.get('/roomsQuestionsCollection').then(function (response) {
                console.log("I got the data I requested, questions-controller");
                console.log("This is the pure response object:" + response.text);
                $scope.kolabDBScope = response.data; //kolabdbscope is used in the non-grouped view
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
        if (document.cookie.length <= 25) {
            console.log("New user, returning to start");
            $location.path('/');
        } else {
            socket.emit('join room', roomCookie); //we join the socket we're supposed to be on, based on our room
            socket.emit('storeClient', 1, roomCookie); //tell the lecturer we've joined
        }
        console.log("Current room, from end of refresh()", roomCookie);
    };
    refresh();


    // remove function bound to the delete buttons in lecture view
    $scope.sendQuestion = function () {
        if ($scope.question != null && $scope.question.text.trim().length) {
            socket.emit('question message', $('#textareaQ').val(), roomCookie);
            $('#textareaQ').val('');
            return false;
        }
    };

    $scope.switchView = function () {
        if ($scope.grouped == "groupedTrue") {
            $scope.grouped = "groupedFalse";
            document.getElementById("groupedButton").innerHTML = "Grouped";
        } else {
            $scope.grouped = "groupedTrue";
            document.getElementById("groupedButton").innerHTML = "Ungrouped";
        }
    };

    //delete function from standard, ungrouped view
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

    //delete function from grouped view
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

    // Lecturer has pressed reset votes, so we reset cookie
    socket.on('resetVotes', function () {
        document.cookie = "key=11111"+ userIDCookie+roomCookie;
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

    // On the rare occassion a room is delete while the user is in it
    socket.on('delete current room', function () {
        console.log('Your room was deleted, returning to front-page');
        $location.path('/');
        $scope.$apply();
    });

}]);
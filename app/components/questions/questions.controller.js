kolabApp.controller('questionsCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from questions-controller");

    var socket = io();

    $scope.grouped = "groupedTrue";

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
               /* var newobj = $scope.newTags;
                for (var property in newobj) {
                    if (newobj.hasOwnProperty(property)) {
                        //console.log(newobj[property]);
                        for (var i = 0; i < newobj[property].length; i++) {
                            //console.log(newobj[property][i].text);
                        }
                    }
                }*/

            },
            function (error) {
                console.log("I got ERROR");
            });
    };
    refresh();


    // remove function bound to the delete buttons in lecture view
    $scope.sendQuestion = function () {
        if ($scope.question != null && $scope.question.text.trim().length) {
            socket.emit('question message', $('#textareaQ').val());
            $('#textareaQ').val('');
            return false;
        }
    };

    $scope.switchView = function () {
        if ($scope.grouped == "groupedTrue"){
            $scope.grouped = "groupedFalse";
        }else{
            $scope.grouped = "groupedTrue";
        }
    };

    // socket message "question delete" and the response to that message
    socket.on('question delete', function (index, id) {
        console.log("Trying to delete message (SOCKET) with ID: " + id);
        $scope.kolabDBScope.splice(index, 1);
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
        if (newcategory == true){ //if the tag cannot be found we insert it into the scope
            console.log("Category not found.");
            $scope.newTags[msg.tag]= [];
            $scope.newTags[msg.tag].push(msg);
            $scope.$apply();
        }


    });

    /*$('.nounRows').click(function(){
        console.log("Click action triggered");
        $(this).nextUntil('.nounRows').slideToggle(100, function(){
        });
    });*/

    function showTable() {
        console.log("meme");
        $('#'+message).toggle();
    }

}]);
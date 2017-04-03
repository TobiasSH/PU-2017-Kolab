kolabApp.controller('questionsCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello World from questions-controller");

    var socket = io();


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
                var newobj = $scope.newTags;
                for (var property in newobj) {
                    if (newobj.hasOwnProperty(property)) {
                        //console.log(newobj[property]);
                        for (var i = 0; i < newobj[property].length; i++) {
                            console.log(newobj[property][i].text);
                        }
                    }
                }
                /*Object.keys(newobj).forEach(function(key,index) {
                 console.log("This is the key ", key,index);
                 for (e in key){
                 console.log(e);
                 }
                 // key: the name of the object key
                 // index: the ordinal position of the key within the object
                 });*/


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

    // socket message "question delete" and the response to that message
    socket.on('question delete', function (index, id) {
        console.log("Trying to delete message (SOCKET) with ID: " + id);
        $scope.kolabDBScope.splice(index, 1);
        $scope.$apply();
    });

    // socket message "question message" and the response to that message
    socket.on('question message', function (msg) {
        console.log(msg.tag);
        //$scope.newTags.push(msg);
        //console.log("Newtags currently : ", $scope.newTags);
        //needs an if-statement for whether we're on grouped or non-grouped view
        var newcategory = true;
        for (var property in $scope.newTags) {
            console.log(property);
            if ($scope.newTags.hasOwnProperty(property)) {

                console.log("What is the value of msg.tag?? ", msg.tag, "vs the value of property: ", property);
                if (msg.tag[0] === property) {
                    console.log("We tried inserting directly into the scope", property);
                    newcategory = false;
                    $scope.newTags[property].push(msg);
                    $scope.$apply();
                    break;
                }
            }
        }
        if (newcategory == true){
            console.log("Category not found.");
            $scope.newTags[msg.tag]= [];
            $scope.newTags[msg.tag].push(msg);
            $scope.$apply();
        }
        //$scope.$apply();


    });

    /*for (var i = 0; i < $scope.newTags.length; i++) { //for-loop for finding the location we should place the new question

        console.log($scope.newTags);

        $scope.newTags[$scope.kolabDBScope[i].tag].push($scope.kolabDBScope[i]);
    }*/
    /*$('.nounrows').click(function(){
     $(this).nextUntil('.nounRows').toggle();
     });*/

}]);
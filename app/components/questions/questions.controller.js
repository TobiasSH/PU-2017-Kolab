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
                        for (var i = 0;i < newobj[property].length; i++){
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
        /*else {
         refresh(); //this needs to go
         }*/
    };

    // socket message "question delete" and the response to that message
    socket.on('question delete', function (index, id) {
        console.log("Trying to delete message (SOCKET) with ID: " + id);
        $scope.kolabDBScope.splice(index, 1);
        $scope.$apply();
    });

    // socket message "question message" and the response to that message
    socket.on('question message', function (msg) {
        console.log('Trying to populate the table with questions... MSG= ' + msg);
        $scope.kolabDBScope.push(msg);
        $scope.$apply();

    });

    /*Used to identify the different tags, aka nouns
     $scope.newItems = {};

     for (var i = 0; i < $scope.items.length; i++) {
     if (!$scope.newItems[$scope.items[i].tag]) {
     $scope.newItems[$scope.items[i].tag] = [];
     }
     $scope.newTags[$scope.items[i].newItems].push($scope.items[i]);
     }
     console.log("These are the tags: ",newTags);
     */
}]);
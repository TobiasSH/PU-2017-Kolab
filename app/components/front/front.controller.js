kolabApp.controller('frontCtrl',function($scope,$location) {
        $scope.go = function (path) {
            $location.path(path);
        };

        //var room = "abc123";
        var socket = io.connect();

        // join room
        socket.on('connect', function () {
           // socket.emit('room', room)
            //console.log("Joined room: " + room);
        });

        socket.on('message', function (data) {
            console.log('incomming messagge from server: ', data);
        });
        

        // Change view
        function changeView($scope, $location) {
            console.log('Tried to change view');
            $scope.changeView = function (view) {
                $location.path(view); // path not hash
            }
        }



        //Create a new room
        $scope.createRoom = function () {
            console.log("method new room called");
            if ($scope.newRoom != null && $scope.newRoom.text.trim().length) {
                socket.emit('new room message', $('#textareaNewRoom').val());
                $('#textareaNewRoom').val('');
                changeView($scope, 'app/components/lecturer/lecturer.html');

                $location.url('/menu.html');
                
                $scope.go = function (path) {
                    $location.path('menu')
                }
                return false;
            } else {

            }
        }

        $scope.join = function () {
            
        }
        
        $scope.joinRoom = function () {
            console.log("method join room called");
            if ($scope.joinRoom != null && $scope.joinRoom.text.trim().length) {
                socket.emit('join room message', $('#textareaJoinRoom').val());
                $('#textareaJoinRoom').val('');

                return false;
            } else {

            }
        }


    });
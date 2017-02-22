kolabApp.controller('frontCtrl',function($scope,$location){
    $scope.go = function ( path ) {
        $location.path( path );
    };
    }
)
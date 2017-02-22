var kolabApp = angular.module('kolabApp', ['ngRoute']);

kolabApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider

        .when('/', {
            templateUrl: '/app/components/front/front.html',
            controller: 'frontCtrl'
        })

        .when('/lecturer',{
            templateUrl: '/app/components/lecturer/lecturer.html',
            controller: 'lecturerCtrl'
        })

        .when('/student',{
            templateUrl: '/app/components/menu/menu.html',
            controller: 'menuCtrl'
        })

        .when('/questions',{
            templateUrl: '/app/components/questions/questions.html',
            controller: 'questionsCtrl'
        })

        .otherwise({
            redirectTo: '/'
        });


    // use the HTML5 History API
    $locationProvider.html5Mode(true);
});

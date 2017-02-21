var kolabApp = angular.module('kolabApp', ['ngRoute']);

kolabApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider

        .when('/', {
            templateUrl: '/components/menu/menu.html',
            controller: 'menuCtrl'
        })

        .when('/kolab',{
            templateUrl: '/components/questions/question.html',
            controller: 'questionsCtrl'
        })

        .otherwise({
            redirectTo: '/'
        });


    // use the HTML5 History API
    $locationProvider.html5Mode(true);
});

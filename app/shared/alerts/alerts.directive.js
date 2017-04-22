kolabApp.directive('pageAlerts', ['alertService', function(alertService) {
    console.log("Dir PA: Does this ever run?");
    return {
        templateUrl: '/app/shared/alerts/alerts.html',
        replace: true,
        link: function (scope) {
            scope.alerts = alertService.alerts;
        }
    }
}]);


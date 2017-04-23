kolabApp.directive('pageAlerts', ['alertService', function(alertService) {

    return {
        templateUrl: '/app/shared/alerts/alerts.html',
        replace: true,
        link: function (scope) { // We extend the directive with the service, alertService
            scope.alerts = alertService.alerts;
        }
    }
}]);


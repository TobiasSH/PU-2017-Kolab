kolabApp.factory('alertService', ['$timeout', function ($timeout) {
    // Service which is usable for all controllers
    // Private functions and internal state
    var internal = {


        alerts: [],

        addAlert: function (type, message, autoClose) {
            var newAlert = {
                type: type,
                message: message,
                close: function () {
                    internal.removeAlert(this)
                }
            };
            internal.alerts.push(newAlert);
            if (autoClose) { //if autoclose is specified as true, then we remove the alert after 3 seconds
                $timeout(function () {
                    newAlert.close()
                }, 3000)
            }
        },

        removeAlert: function (alert) {
            internal.alerts.splice(internal.alerts.indexOf(alert), 1);
        }
    };

    console.log(internal);


    return {    // Callable functions, f.ex alertService.addError
        addError: function (message, autoClose) {
            internal.addAlert('danger', message, autoClose);
        },
        addWarning: function (message, autoClose) {
            internal.addAlert('warning', message, autoClose);
        },
        addSuccess: function (message, autoClose) {
            internal.addAlert('success', message, autoClose);
        },
        addInfo: function (message, autoClose) {
            internal.addAlert('info', message, autoClose);
        },

        alerts: internal.alerts
    };


}]);
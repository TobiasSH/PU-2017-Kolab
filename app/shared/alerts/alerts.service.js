kolabApp.factory('alertService', ['$timeout', function ($timeout) {

    console.log("We get called, weee");
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
            if (autoClose) {
                $timeout(function () {
                    newAlert.close()
                }, 5000)
            }
        },

        removeAlert: function (alert) {
            internal.alerts.splice(internal.alerts.indexOf(alert), 1);
        }
    };

    console.log(internal);

    // Return the public API for the service
    // We'll expose the `alerts` array for convenience

    return {
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
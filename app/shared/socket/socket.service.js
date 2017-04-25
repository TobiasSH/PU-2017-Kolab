kolabApp.factory('socket', function () {
    // Makes users able to keep the same socket throughout all controllers
    var socket = io.connect();
    return socket;
});
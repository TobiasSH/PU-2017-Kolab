var chai = require('chai');
var should = chai.should();
var io = require('socket.io-client');
var assert = require('assert');


describe("server socket", function () {

    var socket;
    var server;
    var options ={
        transports: ['websocket'],
        'force new connection': true
    };

    beforeEach(function (done) {
        console.log('BeforeEach: Starting server');
        server = require('../server');
        socket = io.connect('http://localhost:3000', {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            console.log('worked...');
            done();
        });
        socket.on('disconnect', function() {
            console.log('disconnected...');
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }
        done();
    });

    describe('storeClient test', function() {

      it("checks storeClient message", function (done) {
        socket.emit("storeClient");
        done();
      });

    });

    describe('question message id length', function() {

      it("checks question message id length", function (done) {
        socket.once("pp message", function (message) {
          //console.log("message._id.length: " + message._id.length);
          message._id.length.should.equal(24);
          done();
        });
        
        socket.emit("question message");
      });

    });

    describe('processed message', function() {

      it("checks processed message", function (done) {
        socket.once("processed message", function (message) {
          console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("processed message", {_id: 112233445566112233445566, text: "something", tag: "test"});
        done();
      });

    });

    describe('question delete message', function() {

      it("checks question delete message", function (done) {
        socket.once("question delete", function (message) {
          console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("question delete", 1, {_id: 112233445566112233445566, text: "something", tag: "test"});
        done();
      });

    });

    describe('question delete grouped', function() {

      it("checks question delete grouped message", function (done) {
        socket.once("question delete grouped", function (message) {
          console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("question delete grouped", 1, 1, {_id: 112233445566112233445566, text: "something", tag: "test"});
        done();
      });

    });

    describe('cantKeepUp test', function() {

      it("checks cantKeepUp message", function (done) {
        socket.once("cantKeepUp", function (message) {
          //console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("cantKeepUp");
      });

    });

    describe('decreaseVolume test', function() {

      it("checks decreaseVolume message", function (done) {
        socket.once("decreaseVolume", function (message) {
          //console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("decreaseVolume");
      });

    });

    describe('increaseVolume test', function() {

      it("checks increaseVolume message", function (done) {
        socket.once("increaseVolume", function (message) {
          //console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("increaseVolume");
      });

    });

    describe('decreaseSpeed test', function() {

      it("checks decreaseSpeed message", function (done) {
        socket.once("decreaseSpeed", function (message) {
          //console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("decreaseSpeed");
      });

    });

    describe('increaseSpeed test', function() {

      it("checks increaseSpeed message", function (done) {
        socket.once("increaseSpeed", function (message) {
          //console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("object");
          done();
        });
        
        socket.emit("increaseSpeed");
      });

    });

    describe('resetVotes test', function() {

      it("checks resetVotes message", function (done) {
        socket.once("resetVotes", function (message) {
          console.log("typeof message: " + typeof message);
          var message_type = typeof message;
          message_type.should.equal("undefined");
          done();
        });
        
        socket.emit("resetVotes");
      });

    });
    
});
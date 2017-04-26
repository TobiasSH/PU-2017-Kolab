var chai = require('chai');
var should = chai.should();
var io_client = require('socket.io-client');
var assert = require('assert');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


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
        socket = io_client.connect('http://localhost:3000', {
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
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            console.log('no connection to break...');
        }
        done();
    });

    describe('cookie initialize test', function() {
      it("checks cookie initialize", function (done) {
        socket.emit("cookie initialize");
        done();
      });

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
        socket.emit("processed message", {_id: 112233445566112233445566, text: "testing\n", tag: "testing "});
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
        socket.emit("question delete", 1, {_id: 112233445566112233445566, text: "testing\n", tag: "testing "});
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
        socket.emit("question delete grouped", 1, 1, {_id: 112233445566112233445566, text: "testing\n", tag: "testing "});
        done();
      });
    });

    describe('leave room', function() {
      it("checks leave room", function (done) {
        socket.once("leave room", function (cookie) {
          console.log("typeof message: " + typeof cookie);
          var cookie_type = typeof cookie;
          cookie_type.should.equal("object");
          done();
        });
        socket.emit("leave room", "11111" + "someuseridwith16chars" + "romnavn");
        done();
      });
    });

    describe('join room', function() {
      it("checks join room", function (done) {
        socket.once("join room", function (roomName, cookie) {
          console.log("typeof message: " + typeof roomName + " " + typeof cookie);
          var roomName_type = typeof roomName;
          var cookie_type = typeof cookie;
          roomName_type.should.equal("object");
          cookie_type.should.equal("object");
          done();
        });
        socket.emit("join room", "roomName", "11111" + "someuseridwith16chars" + "romnavn");
        done();
      });
    });

    describe('join room lecturer', function() {
      it("checks join room lecturer", function (done) {
        socket.once("join room lecturer", function (roomName) {
          console.log("typeof message: " + typeof roomName);
          var roomName_type = typeof roomName;
          roomName_type.should.equal("object");
          done();
        });
        socket.emit("join room lecturer");
        done();
      });
    });

    describe('leave room lecturer', function() {
      it("checks leave room lecturer", function (done) {
        socket.once("leave room lecturer", function (roomName) {
          console.log("typeof message: " + typeof roomName);
          var roomName_type = typeof roomName;
          roomName_type.should.equal("object");
          done();
        });
        socket.emit("leave room lecturer");
        done();
      });
    });

    describe('new room message', function() {
      it("checks new room message", function (done) {
        socket.once("new room message", function (msg, userId) {
          console.log("typeof message: " + typeof msg + " " + typeof userId);
          var msg_type = typeof msg;
          var userId_type = typeof userId;
          index_type.should.equal("object");
          obj_type.should.equal("object");
          userId_type.should.equal("object");
          done();
        });
        socket.emit("new room message", "msg", 1);
        done();
      });
    });


    describe('room delete', function() {
      it("checks room delete", function (done) {
        socket.once("room delete", function (index, obj, userId) {
          console.log("typeof message: " + typeof index + " " + typeof obj + " " + typeof userId);
          var index_type = typeof index;
          var obj_type = typeof obj;
          var userId_type = typeof userId;
          index_type.should.equal("object");
          obj_type.should.equal("object");
          userId_type.should.equal("object");
          done();
        });
        socket.emit("room delete", 1, {_id: 112233445566112233445566, text: "testing\n", tag: "testing "}, 1);
        done();
      });
    });

    describe('cantKeepUp test', function() {
      it("checks cantKeepUp message", function (done) {
        socket.once("cantKeepUp", function (inc, room, cookie) {
          console.log("typeof message: " + typeof inc + " " + typeof room + " " + typeof cookie);
          var inc_type = typeof inc;
          var room_type = typeof room;
          var cookie_type = typeof cookie;
          inc_type.should.equal("object");
          room_type.should.equal("object");
          cookie_type.should.equal("object");
          done();
        });
        socket.emit("cantKeepUp");
        done();
      });
    });

    describe('decreaseVolume test', function() {
      it("checks decreaseVolume message", function (done) {
        socket.once("decreaseVolume", function (inc, room, cookie) {
          console.log("typeof message: " + typeof inc + " " + typeof room + " " + typeof cookie);
          var inc_type = typeof inc;
          var room_type = typeof room;
          var cookie_type = typeof cookie;
          inc_type.should.equal("object");
          room_type.should.equal("object");
          cookie_type.should.equal("object");
          done();
        });
        socket.emit("decreaseVolume");
        done();
      });
    });

    describe('increaseVolume test', function() {
      it("checks increaseVolume message", function (done) {
        socket.once("increaseVolume", function (inc, room, cookie) {
          console.log("typeof message: " + typeof inc + " " + typeof room + " " + typeof cookie);
          var inc_type = typeof inc;
          var room_type = typeof room;
          var cookie_type = typeof cookie;
          inc_type.should.equal("object");
          room_type.should.equal("object");
          cookie_type.should.equal("object");
          done();
        });
        socket.emit("increaseVolume");
        io.to("roomName").emit("increaseVolume", 1 /*inc*/, 20 /*UserCount*/);
        done();
      });
    });

    describe('decreaseSpeed test', function() {
      it("checks decreaseSpeed message", function (done) {
        socket.once("decreaseSpeed", function (inc, room, cookie) {
          console.log("typeof message: " + typeof inc + " " + typeof room + " " + typeof cookie);
          var inc_type = typeof inc;
          var room_type = typeof room;
          var cookie_type = typeof cookie;
          inc_type.should.equal("object");
          room_type.should.equal("object");
          cookie_type.should.equal("object");
          done();
        });
        socket.emit("decreaseSpeed");
        io.to("roomName").emit("decreaseSpeed", 1 /*inc*/, 20 /*UserCount*/);
        done();
      });
    });

    describe('increaseSpeed test', function() {
      it("checks increaseSpeed message", function (done) {
        socket.once("increaseSpeed", function (inc, room, cookie) {
          console.log("typeof message: " + typeof inc + " " + typeof room + " " + typeof cookie);
          var inc_type = typeof inc;
          var room_type = typeof room;
          var cookie_type = typeof cookie;
          inc_type.should.equal("object");
          room_type.should.equal("object");
          cookie_type.should.equal("object");
          done();
        });  
        socket.emit("increaseSpeed");
        io.to("roomName").emit("increaseSpeed", 1 /*inc*/, 20 /*UserCount*/);
        done();
      });
    });

    describe('resetVotes test', function() {
      it("checks resetVotes message", function (done) {
        socket.once("resetVotes", function (room) {
          console.log("typeof message: " + typeof room);
          var room_type = typeof room;
          room_type.should.equal("undefined");
          done();
        });
        socket.emit("resetVotes");
        done();
      });
    });
    
});
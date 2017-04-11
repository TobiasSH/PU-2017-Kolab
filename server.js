var express = require('express');
var app = express();
var mongojs = require('mongojs');
//'mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k'
//var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['roomsQuestionsCollection', 'roomsCollection' 'counter']);
var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['roomsQuestionsCollection', 'roomsCollection', 'counter']);
var bodyParser = require('body-parser');
var path = require('path');


app.use(express.static(__dirname));
app.use(bodyParser.json());

/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);


var userCount = 0;
var clickList = ['cantKeepUp', 'decreaseVolume', 'increaseVolume', 'decreaseSpeed', 'increaseSpeed'];

// socket functions
io.on('connection', function (socket) {
    console.log('User ' + socket.id + ' connected.' + userCount);

    var currentRoomID;

    socket.on('cookie initialize', function (cookie) {
        socket.handshake.headers.cookie = cookie;
    });


    socket.on('disconnect', function () {// 11111 , cku, decVol, incVol, decSpeed, incSpeed
        if (socket.handshake.headers.cookie == undefined) {
            setTimeout(function () {
                socket.leave(currentRoomID);
                return false;
            }, 10000);

        } else {
            console.log(socket.handshake.headers.cookie);
            var clicks = cookieParseCounter(socket.handshake.headers.cookie); //socket header is not updated regularly enough for this to work i dont think


            for (var i = 0; i < 5; ++i) {//trying to remove the clicks the user has done
                if (clicks[i] == 0) {       //looping through the user's cookie
                    io.to(currentRoomID).emit(clickList[i], -1); //emitting the appropriate message to the lecturer view of the user's room
                    clicks[i] = -1; //this is used so that we can update the database accordingly
                } else {
                    clicks[i] = 0;
                }
            }
            //database updates to restore the changes the user has done
            db.counter.update({room: currentRoomID}, {
                $inc: {
                    cantKeepUp: clicks[0],
                    decreaseVolume: clicks[1],
                    increaseVolume: clicks[2],
                    decreaseSpeed: clicks[3],
                    increaseSpeed: clicks[4],
                    userCount: -1
                }
            });

            socket.leave(currentRoomID);
        }
    });

    socket.on('join room', function (roomName) {

        //Checks if the user is already connected to the room socket
        if (socket.rooms[roomName]) {
            console.log("User already connected to room");
            return false;
        } else {
            socket.join(roomName);
            console.log("socket.rooms after, ", socket.rooms);
            currentRoomID = roomName;
            io.to(roomName).emit('storeClient', 1);
            db.counter.update({room: currentRoomID}, {$inc: {userCount: 1}});
        }
    });

    socket.on('leave room', function (cookie) {
        console.log(cookie);
        var clicks = cookie.substring(0, 5);

        console.log("This is clicks before = ", clicks);
        var moddedClicks = [];
        for (var i = 0; i < 5; ++i) {//trying to remove the clicks the user has done
            if (clicks[i] == 0) {       //looping through the user's cookie
                io.to(currentRoomID).emit(clickList[i], -1); //emitting the appropriate message to the lecturer view of the user's room
                moddedClicks.push(-1); //this is used so that we can update the database accordingly
            } else {
                moddedClicks.push(0);
            }
        }
        //database updates to restore the changes the user has done
        db.counter.update({room: currentRoomID}, {
            $inc: {
                cantKeepUp: moddedClicks[0],
                decreaseVolume: moddedClicks[1],
                increaseVolume: moddedClicks[2],
                decreaseSpeed: moddedClicks[3],
                increaseSpeed: moddedClicks[4],
                userCount: -1
            }
        });
        socket.leave(currentRoomID);
        io.to(currentRoomID).emit('storeClient', -1);


    });

    socket.on('new room message', function (msg, userId) {
        var rString = randomString(24, '0123456789abcdef');
        console.log("trying to save room: " + msg + " user: " + userId);
        db.roomsCollection.insert({_id: mongojs.ObjectID(rString), room: msg, creator: userId}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("room inserted into the db: " + msg + "by user: " + userId);
            }
        });
        //Create counters for the new room, unspecified ID, we use roomname to retrieve
        var clickCounterDocument = [{
            room: msg, "cantKeepUp": 0, "decreaseVolume": 0, "increaseVolume": 0,
            "decreaseSpeed": 0, "increaseSpeed": 0, "userCount": 0
        }];

        db.counter.insert(clickCounterDocument, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("room inserted into the db: " + msg + "by user: " + userId);
            }
        });
        io.emit('new room broadcast', {_id: mongojs.ObjectID(rString), room: msg, creator: userId});
    });

    socket.on('room delete', function (index, obj, userId) {
        //retrieve the room
        console.log(obj._id);

        db.roomsCollection.find({_id: mongojs.ObjectId(obj._id)}, function (err, docs) {
            //check if the room's creator is the same as the one trying to delete it
            if (docs[0].creator === obj.creator) {
                console.log("Server received 'room delete' message for id: " + obj._id + " and userId: " + userId);
                //deletes the selected room from the database
                db.roomsCollection.remove({_id: mongojs.ObjectId(obj._id)});

                io.emit('delete room broadcast', index, obj._id);
            }
        });


    });

    // server receives a new message and sends it to the python script
    socket.on('question message', function (msg, roomName) {
        console.log('roomname: ' + roomName);
        var rString = randomString(24, '0123456789abcdef');
        io.emit('pp message', {_id: mongojs.ObjectID(rString), room: roomName, text: msg, tag: ""});
    });

    socket.on('processed message', function (obj) {
        console.log('message: ' + obj.text);

        //creates random string with the function outside the socket function

        //inserting new message into mlab database
        db.roomsQuestionsCollection.insert({
            _id: mongojs.ObjectID(obj._id),
            room: String(obj.room),
            text: obj.text,
            tag: obj.tag
        }, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("question message inserted into the db: " + obj.text);
            }
        });
        // broadcasts question message to all listening sockets with the same object we insert into the database
        console.log("QM: This is the room", obj.room);
        io.to(obj.room).emit('question message', {
            _id: mongojs.ObjectID(obj._id),
            room: String(obj.room),
            text: obj.text,
            tag: obj.tag
        });

    });
    //menu buttons
    socket.on('cantKeepUp', function (inc, room, cookie) {
        db.counter.update({room: room}, {$inc: {cantKeepUp: inc}});
        socket.handshake.headers.cookie = cookie;
        io.to(room).emit('cantKeepUp', inc);
    });
    socket.on('decreaseVolume', function (inc, room, cookie) {
        db.counter.update({room: room}, {$inc: {decreaseVolume: inc}});
        socket.handshake.headers.cookie = cookie;
        io.to(room).emit('decreaseVolume', inc, userCount);
    });
    socket.on('increaseVolume', function (inc, room, cookie) {
        db.counter.update({room: room}, {$inc: {increaseVolume: inc}});
        socket.handshake.headers.cookie = cookie;
        io.to(room).emit('increaseVolume', inc, userCount);
    });
    socket.on('decreaseSpeed', function (inc, room, cookie) {
        db.counter.update({room: room}, {$inc: {decreaseSpeed: inc}});
        socket.handshake.headers.cookie = cookie;
        io.to(room).emit('decreaseSpeed', inc, userCount);
    });
    socket.on('increaseSpeed', function (inc, room, cookie) {
        db.counter.update({room: room}, {$inc: {increaseSpeed: inc}});
        socket.handshake.headers.cookie = cookie;
        io.to(room).emit('increaseSpeed', inc, userCount);
    });
    socket.on('resetVotes', function (room) {
        db.counter.update({room: room}, {
            $set: {
                cantKeepUp: 0,
                decreaseVolume: 0,
                increaseVolume: 0,
                decreaseSpeed: 0,
                increaseSpeed: 0
            }
        });
        io.to(room).emit('resetVotes');
    });

    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete', function (index, obj) {

        console.log("Server received 'question delete' broadcast for id: " + obj._id);

        db.roomsQuestionsCollection.remove({_id: mongojs.ObjectId(obj._id)});
        io.emit('question delete', index, obj);
    });

    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete grouped', function (rowIndex, index, obj) {

        console.log("Server received 'question delete' broadcast for id: " + obj._id);
        //deletes the selected question from the database
        db.roomQuestionsCollection.remove({_id: mongojs.ObjectId(obj._id)});
        io.emit('question delete grouped', rowIndex, index, obj);

    });

});

/* ID Generator */
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

/* SERVER SIDE ROUTING */
app.get('/lecturer', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/student', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/questions', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/front', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


/* DATABASE METHODS */
app.get('/roomsQuestionsCollection', function (req, res) {
    console.log("RQ: I received a GET request");
    var roomName = cookieParseRoom(req.headers.cookie);//this becomes the socket???
    console.log("current room: ", roomName);
    db.roomsQuestionsCollection.find({room: roomName}, function (err, docs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            console.log(docs);
            res.json(docs);
        }
    });
});

//Which one are we using
app.get('/roomsCollection', function (req, res) {
    console.log("R: I received a GET request");
    db.roomsCollection.find(function (err, docs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            //console.log(docs);
            res.json(docs);
        }
    })
});

app.get('/roomsCollection/:id', function (req, res) {
    console.log("RID: I received a GET request");
    db.roomsCollection.find(function (err, docs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            //console.log(docs);
            res.json(docs);
        }

    })

});


app.get('/roomsQuestionsCollection/:id', function (req, res) {
    var roomName = cookieParseRoom(req.headers.cookie);
    console.log("Q: I received a GET request", roomName);
    var id = req.params.id;
    console.log("Current room: ", roomName);
    db.roomsQuestionsCollection.findOne({_id: mongojs.ObjectId(id), room: String(roomName)}, function (err, doc) {
        res.json(doc);
    });
});


app.get('/counters', function (req, res) {
    var roomName = cookieParseRoom(req.headers.cookie);
    console.log("Q: I received a GET request", roomName);
    db.counter.find({room: roomName}, function (err, doc) {
        res.json(doc);
    })
});

function cookieParseRoom(cookie) {//Removes everything about the cookie which is not about room
    if (cookie.indexOf("io=") == 0) {//checks to see if io is first
        cookie = cookie.replace(/io=\s*(.*?)\s*; /, ''); //regex to remove io= .... ;
        return cookie.slice(20); //removes the UID and click counters
    }

    var tempVar = cookie.slice(20); //remove the non-room parts
    console.log("This is the processed string: ", tempVar.substring(0, tempVar.indexOf(';')));
    return ( tempVar.substring(0, tempVar.indexOf(';'))); //remove the last semicolon
}

function cookieParseCounter(cookie) {//Removes everything about the cookie which is not about room
    if (cookie.indexOf("io=") == 0) {//checks to see if io is first
        cookie = cookie.replace(/io=\s*(.*?)\s*; /, ''); //regex to remove io= .... ;
        return cookie.substring(0, 5); //removes the UID and click counters
    }

    return cookie.substring(0, 5); //remove the non-room parts
}

var server = http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");

module.exports = server;


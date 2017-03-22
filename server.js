var express = require('express');
var app = express();
var mongojs = require('mongojs');

var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection', 'counter', 'roomsCollection']);

var bodyParser = require('body-parser');
var path = require('path');


app.use(express.static(__dirname));
app.use(bodyParser.json());


/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCounter = 1;


var room = "abc123";
var rooms = [];
var room1;

// socket functions
io.on('connection', function (socket) {
    console.log('User ' + userCounter + ' connected.');
    userCounter += 1;
    socket.on('disconnect', function () {
        console.log('a user disconnected');
        userCounter -= 1;
    });



    socket.on('join room message', function (msg) {
        console.log("recieved join room message ");
        if (rooms.indexOf(msg)+1){
            console.log('found room: ' + msg);
            socket.join(msg);
        } else {
            console.log('could not find room: '+ msg );
        }
            
    })

    socket.on('room', function (room) {
        socket.join(room);
        console.log("Room joined: " + room);
    });

    socket.on('join room message', function (msg) {


    })

    socket.on('new room message', function (msg) {
        console.log("recieved new room message: " + msg);
        socket.join(msg);
        console.log("Socket joined room joined: " + msg)
        rooms.push(msg);
        //console.log(rooms.indexOf(msg));

        //creates random string with the function outside the socket function
        var rString = randomString(24, '0123456789abcdef');

        //inserting new message into mlab database
        db.roomsCollection.insert({_id: mongojs.ObjectID(rString), text: msg}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else{
                console.log("room mesage inserted into the db: " + msg);
            }
        });
        //broadcast room message to all listening sockets with the same object we inset into the database so
        //they can uodate their list showing available rooms
        io.emit('room message', {_id: mongojs(rString), text: msg});
    })

    // servers response to emitted message from controllers
    socket.on('question message', function (msg) {
        console.log('message: ' + msg);

        //creates random string with the function outside the socket function
        var rString = randomString(24, '0123456789abcdef');

        //inserting new message into mlab database
        db.questionsCollection.insert({_id: mongojs.ObjectID(rString), text: msg}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("question message inserted into the db: " + msg);
            }
        });
        // broadcasts question message to all listening sockets with the same object we insert into the database
        io.emit('question message', {_id: mongojs.ObjectID(rString), text: msg});
    });

    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete', function (index, id) {

        console.log("Server received 'question delete' broadcast for id: "+id);
        //deletes the selected question from the database
        db.questionsCollection.remove({_id: mongojs.ObjectId(id)});
        io.emit('question delete', index, id);

    });
    io.sockets.in(room).emit('message' ,"hei");
});


io.sockets.in(room).emit('message' ,"hei");

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


/* DATABASE METHODS */
app.get('/questionsCollection', function (req, res) {
    console.log("I received a GET request");
    db.questionsCollection.find(function (err, docs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            console.log(docs);
            res.json(docs);
        }
    });
});




/*app.post('/questionsCollection', function (req, res) {
    console.log("I received a POST request");
    console.log(req.body);
    db.questionsCollection.insert(req.body, function (err, doc) {
        res.json(doc);
    });
});

app.delete('/questionsCollection/:id', function (req, res) {
    console.log("Server received a DELETE request for ID: " + req.params.id);
    var id = req.params.id;
    console.log(typeof id);
    db.questionsCollection.remove({_id: mongojs.ObjectId(id)});
});*/

app.get('/questionsCollection/:id', function (req, res) {
    console.log("I received a GET request");
    var id = req.params.id;
    console.log(id);
    db.questionsCollection.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.get('/roomsCollection/:id', function (req, res) {
    console.log("I received a GET request");
    var id = req.params.id;
    console.log(id);
    db.roomsCollection.findOne({_id:mongojs.ObjectID(id)}, function (err, doc) {
        res.json(doc);
    })
})

app.get('/roomsCollection', function (req, res) {
    console.log('Saves rooms // hans   ');
    db.roomsCollection.insert(req.body, function (err, doc) {
        res.json(doc);

    })

})



http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
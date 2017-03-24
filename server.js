var express = require('express');
var app = express();
var mongojs = require('mongojs');

var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['roomsCollection', 'roomsQuestionsCollection', 'counter']);

var bodyParser = require('body-parser');
var path = require('path');


app.use(express.static(__dirname));
app.use(bodyParser.json());


/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCounter = 1;

// SHOLD MIGHT remove this
var room = "abc123";
var rooms = [];
var room1;
var currentRoom;

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



  /*  socket.on('room', function (room) {
        socket.join(room);
        console.log("Room joined: " + room);
        currentRoom = room;
        console.log("current room: " + currentRoom);
    }); */

    //JOIN A ROOM

    socket.on('join room message', function (msg) {
        socket.join(msg);
        console.log("Room joined: " + msg);
        currentRoom = msg;
        console.log("current room: " + currentRoom);

    })

    // CREATE A NEW ROOM
    socket.on('new room message', function (msg) {
        console.log("recieved new room message: " + msg);
        socket.join(msg); // ROOM IS CREATED IF IT NOT ALREADY EXISTS
        console.log("Socket joined room joined: " + msg);
        rooms.push(msg);
        //console.log(rooms.indexOf(msg));

        //creates random string with the function outside the socket function
        var rString = randomString(24, '0123456789abcdef');

        //inserting new message into mlab database
        db.roomsCollection.insert({_Rid: mongojs.ObjectID(rString), text: msg}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else{
                console.log("room mesage inserted into the db: " + msg);
            }
        });
        //broadcast room message to all listening sockets with the same object we inset into the database so
        //they can uodate their list showing available rooms
        io.emit('room message', {_Rid: mongojs(rString), text: msg});
    })


    // JOIN BUTTON IN FRONT
    socket.on('join existing room', function (index, id) {

        console.log("Server received 'join existing room' broadcast for id: "+id);
        //deletes the selected question from the database
        db.roomsQuestionsCollection.remove({_id:{a: mongojs.ObjectId(id), b: 'b'}});
        io.emit('question delete', index, id);

        //var id = req.params.id;
        //db.roomsCollection.findOne({_Rid: mongojs.ObjectID(id)}, function (err, doc) {
          //  res.json(doc);


        socket.join()
        })


    });
    //HUSK Å SLETTE
    app.get('/roomsCollection/:id', function (req, res) {
        console.log("I received a GET request");
        var id = req.params.id;
        //console.log(id);
        db.roomsCollection.findOne({_Rid: mongojs.ObjectID(id)}, function (err, doc) {
            res.json(doc);
        })
    })



    io.sockets.in(currentRoom).emit('message' ,"hei");



    // servers response to emitted message from controllers
    socket.on('question message', function (msg) {
        console.log('message: ' + msg);

        //creates random string with the function outside the socket function
        var rString = randomString(24, '0123456789abcdef');

        //inserting new message into mlab database
        db.roomsQuestionsCollection.insert({_id:{ a: mongojs.ObjectID(rString), b: currentRoom }, text: msg}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("question message inserted into the db: " + msg);
            }
        });
        // broadcasts question message to all listening sockets with the same object we insert into the database
        io.emit('question message', {_id:{a: mongojs.ObjectID(rString), b: currentRoom}, text: msg});
    });

    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete', function (index, id) {

        console.log("Server received 'question delete' broadcast for id: "+id);
        //deletes the selected question from the database
        db.roomsQuestionsCollection.remove({_id:{a: mongojs.ObjectId(id), b: 'b'}});
        io.emit('question delete', index, id);

    });
    io.sockets.in(currentRoom).emit('message' ,"hei");
});


//io.sockets.in(room).emit('message' ,"hei");

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
})


/* DATABASE METHODS */
app.get('/roomsQuestionsCollection', function (req, res) {
    console.log("Q: I received a GET request");
    db.roomsQuestionsCollection.find(function (err, docs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            console.log(docs);
            res.json(docs);
        }
    });
});

app.get('/roomsCollection', function (req, res) {
    console.log("R: I received a GET request"),
        db.roomsCollection.find(function (err, docs) {
            if (err){
                console.warn(err.message);
            }
            else {
                //console.log(docs);
                res.json(docs);
            }

        })

})



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

app.get('/roomsQuestionsCollection/:id', function (req, res) {
    console.log("I received a GET request");
    var id = req.params.id;
    console.log(id);
    db.roomsQuestionsCollection.findOne({_id:{a: mongojs.ObjectId(id), b:  'b'}}, function (err, doc) {
        res.json(doc);
    });
});

app.get('/roomsCollection/:id', function (req, res) {
    console.log("I received a GET request");
    var id = req.params.id;
    //console.log(id);
    db.roomsCollection.findOne({_Rid: mongojs.ObjectID(id)}, function (err, doc) {
        res.json(doc);
    })
})




http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
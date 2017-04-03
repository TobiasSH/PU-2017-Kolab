var express = require('express');
var app = express();
var mongojs = require('mongojs');


var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['userIdCollection','roomsCollection', 'roomsQuestionsCollection', 'counter']);
var bodyParser = require('body-parser');
var path = require('path');

var cookie = require('cookie');
var cookies = cookie.parse('userID = not yet; currentRoom = Not set yet; userCount = 1; cantKeepUpCount = 1; decreaseVolumeCount = 1; increaseVolumeCount = 1;decreaseSpeedCount = 1; increaseSpeedCount = 1')
var uniqeUsers = 0;

app.use(express.static(__dirname));
app.use(bodyParser.json());


/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCounter = 1;





// socket functions
io.on('connection', function (socket) {
    console.log("From initial connection; current room: " + cookies.currentRoom);

    console.log('User ' + userCounter + ' connected.');
    userCounter += 1;
    socket.on('disconnect', function () {
        console.log('a user disconnected');
        userCounter -= 1;
    });

    // Sjekker om brukeren har besøkt oss tifligere og dermed er lagret i dbs
    // Hvis ikke inkrementerer vi Id og lager en ny
    socket.on('get uniqueuser id', function (msg) {
        db.userIdCollection.find({userId: msg}, function (err, docs) {
            if (err) {
                console.warn(err.message)
                uniqeUsers ++;
            }
            else {
                console.log(docs);
                res.json(docs);
            }
        });

    })


    socket.on('join room message', function (msg) {
        console.log("recieved join room message ");
        if (rooms.indexOf(msg)+1){
            console.log('found room: ' + msg);
            socket.join(msg);
            cookies.currentRoom = socket.room;



        } else {
            console.log('could not find room: '+ msg );
        }

    });

    // JOIN BUTTON IN FRONT
    socket.on('join existing room', function (index, text) {

        console.log("Server received 'join existing room' broadcast for: "+ text);

        socket.leaveAll();
        socket.join(text);
        io.emit('join existing room', index, text);
        socket.room = text;
        cookies.currentRoom = text;

        console.log("The current room: " + cookies.currentRoom);

    });

    // CREATE A NEW ROOM
    socket.on('new room message', function (msg) {
        console.log("recieved new room message: " + msg);
        socket.leaveAll();

        //TODO check if room allready exists
        socket.join(msg); // ROOM IS CREATED IF IT NOT ALREADY EXISTS
        socket.room = msg;
        cookies.currentRoom = msg;

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
    });




    // servers response to emitted message from controllers
    socket.on('question message', function (msg) {
        console.log('message: ' + msg);

        //creates random string with the function outside the socket function
        var rString = randomString(24, '0123456789abcdef');

        //inserting new message into mlab database
        db.roomsQuestionsCollection.insert({_id: mongojs.ObjectID(rString), room: String(socket.room), text: msg}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("question message inserted into the db: " + msg);
            }
        });
        // broadcasts question message to all listening sockets with the same object we insert into the database
        console.log("QM: This is the room"+socket.room);
        io.to(socket.room).emit('question message', {_id: mongojs.ObjectID(rString), room: String(socket.room), text: msg});
    });

    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete', function (index, id) {

        console.log("Server received 'question delete' broadcast for id: "+id);
        //deletes the selected question from the database
        db.roomsQuestionsCollection.remove({_id: mongojs.ObjectId(id)});
        io.emit('question delete', index, id);

    });
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
    console.log("current room: " + cookies.currentRoom);
    db.roomsQuestionsCollection.find({room: cookies.currentRoom}, function (err, docs) {
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

});


app.get('/roomsQuestionsCollection/:id', function (req, res) {
    console.log("I received a GET request");
    var id = req.params.id;
    console.log(id);
    console.log("Current room: " + socket.currentRoom);
    db.roomsQuestionsCollection.findOne({_id: mongojs.ObjectId(id), room: String(socket.room) }, function (err, doc) {
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
});




http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
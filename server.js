var express = require('express');
var app = express();
var mongojs = require('mongojs');

var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection', 'roomsCollection', 'usercollection, ''counter']);
var bodyParser = require('body-parser');
var path = require('path');
var cookie = require('cookie');
var cookies = cookie.parse('userCount = 1; cantKeepUpCount = 1; decreaseVolumeCount = 1; increaseVolumeCount = 1;decreaseSpeedCount = 1; increaseSpeedCount = 1')


app.use(express.static(__dirname));
app.use(bodyParser.json());


/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCounter = 0;




// socket functions
io.on('connection', function (socket) {
    console.log('User ' + userCounter + ' connected.');
    if (cookies.userCount>0){
        userCounter += 1;
        io.emit('incUser')
        cookies.userCount -=1;
    }


    socket.on('disconnect', function () {
        console.log('a user disconnected');
        if (cookies.userCount<1){
            userCounter -= 1;
            io.emit('decUser')
            cookies.userCount +=1;
        }

    });

    socket.on('new user message', function (userId) {
        var rString = randomString(24, '0123456789abcdef');

        db.userCollection.insert({_id: mongojs.ObjectID(rString), user: userId }, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("userId message inserted into the db: " + userId);
            }
        });
    })

    socket.on('new room message', function (msg, userId) {
        var rString = randomString(24, '0123456789abcdef');

        db.userCollection.insert({_id: mongojs.ObjectID(rString), room: msg, creator: userId }, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("userId message inserted into the db: " + userId);
            }
        });
    })


    socket.on('room delete', function (index, id, userId) {

        if ( userId != undefined &&
            db.roomsCollecction.findOne({_Rid: mongojs.ObjectID(id)}, function (err, doc) {
            res.creator == userId  ; }) )
        {
            console.log("Server received 'room delete' broadcast for id: " + id + "userId: " + userId);
            //deletes the selected room from the database
            db.roomsCollection.remove({_id: mongojs.ObjectId(id)});
            io.emit('rooms delete', index, id);
        }

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
        console.log("QM: This is the room"+ socket.room);
        io.to(socket.room).emit('question message', {_id: mongojs.ObjectID(rString), room: String(socket.room), text: msg});
    });



    //menu buttons
    socket.on('cantKeepUp',function(){
        var hits = parseInt(cookies.cantKeepUpCount);
        db.counter.update({"counter" : "cantKeepUp"}, {"$inc":{"hits": parseInt(cookies.cantKeepUpCount)}});
        console.log("cant keep up server"+ parseInt(cookies.cantKeepUpCount));

        cookies.cantKeepUpCount=parseInt(cookies.cantKeepUpCount)*(-1);


        io.emit('cantKeepUp',  hits )

    });
    socket.on('decreaseVolume', function(){
        var hits = parseInt(cookies.decreaseVolumeCount)
        db.counter.update({"counter" : "decreaseVolume"}, {"$inc":{"hits": parseInt(cookies.decreaseVolumeCount)}});
        console.log("decrease volume " + cookies.decreaseVolumeCount);
        cookies.decreaseVolumeCount=parseInt(cookies.decreaseVolumeCount)*(-1);
        console.log(cookies);

        io.emit('decreaseVolume', hits)
    });
    socket.on('increaseVolume', function(){
        var hits = parseInt(cookies.increaseVolumeCount)
        db.counter.update({"counter" : "increaseVolume"}, {"$inc":{"hits": parseInt(cookies.increaseVolumeCount)}});
        console.log("increaseses volumes" + cookies.increaseVolumeCount);
        cookies.increaseVolumeCount=parseInt(cookies.increaseVolumeCount)*(-1);

        io.emit('increaseVolume', hits)

    });
    socket.on('decreaseSpeed', function(){
        var hits = parseInt(cookies.decreaseSpeedCount)
        db.counter.update({"counter" : "decreaseSpeed"}, {"$inc":{"hits": parseInt(cookies.decreaseSpeedCount)}});
        console.log("decerease speed" + cookies.decreaseSpeedCount);
        cookies.decreaseSpeedCount=parseInt(cookies.decreaseSpeedCount)*(-1);

        io.emit('decreaseSpeed', hits)

    });
    socket.on('increaseSpeed', function(){
        var hits = parseInt(cookies.increaseSpeedCount)
        db.counter.update({"counter" : "increaseSpeed"}, {"$inc":{"hits": parseInt(cookies.increaseSpeedCount)}});
        console.log("incerease speed"+ cookies.increaseSpeedCount);
        cookies.increaseSpeedCount=parseInt(cookies.increaseSpeedCount)*(-1);

        io.emit('increaseSpeed', hits)

    });
    socket.on('resetVotes', function(){
        db.counter.update({},{"$set":{"hits":0}},{multi:true});
        console.log(cookies);
        cookies = cookie.parse('userCount = 0; cantKeepUpCount = 1; decreaseVolumeCount = 1; increaseVolumeCount = 1;decreaseSpeedCount = 1; increaseSpeedCount = 1')
        console.log(cookies);
        io.emit('resetVotes');
    })

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
    console.log("current room: " + socket.room);
    db.roomsQuestionsCollection.find({room: socket.room}, function (err, docs) {
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

app.delete('/roomsQuestionsCollection/:id', function (req, res) {
    console.log("Server received a DELETE request for ID: " + req.params.id);
    var id = req.params.id;
    console.log(typeof id);
    db.roomQuestionsCollection.remove({_id: mongojs.ObjectId(id)});
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
    });
});
app.get('/counters', function(req, res){
    db.counter.find(function(err,doc){
        res.json(doc);

    })
})
app.get('/cantKeepUp', function(req, res){
    db.counter.findOne({"counter": "cantKeepUp"}, function(err,doc){
        res.json(doc);

    })
})
app.get('/decreaseVolume', function(req, res){
    db.counter.findOne({"counter": "decreaseVolume"}, function(err,doc){
        res.json(doc);

    })
})
app.get('/increaseVolume', function(req, res){
    db.counter.findOne({"counter": "increaseVolume"}, function(err,doc){
        res.json(doc);

    })
})
app.get('/decreaseSpeed', function(req, res){
    db.counter.findOne({"counter": "decreaseSpeed"}, function(err,doc){
        res.json(doc);

    })
})
app.get('/increaseSpeed', function(req, res){
    db.counter.findOne({"counter": "increaseSpeed"}, function(err,doc) {
        res.json(doc);
    })
})

var server = http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");

module.exports = server;
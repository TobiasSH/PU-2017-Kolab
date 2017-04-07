var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection', 'counter']);
var bodyParser = require('body-parser');
var path = require('path');
var userCount=0;

app.use(express.static(__dirname));
app.use(bodyParser.json());


/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);


// socket functions
io.on('connection', function (socket) {
    console.log('User ' + socket.id + ' connected.' + userCount);
    socket.on('storeClient', function(inc){
        userCount+=inc;
        console.log(userCount+ " count");
        db.counter.update({"counter" : "userCount"}, {"$inc":{"hits": inc}});
    });
    socket.on('disconnect', function () {
        socket.emit('storeClient',-1 );
    });

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
    //menu buttons
    socket.on('cantKeepUp',function(inc){
        db.counter.update({"counter" : "cantKeepUp"}, {"$inc":{"hits": inc}});
        io.emit('cantKeepUp',  inc, userCount );
    });
    socket.on('decreaseVolume', function(inc){
        db.counter.update({"counter" : "decreaseVolume"}, {"$inc":{"hits": inc}});
        io.emit('decreaseVolume', inc, userCount);
    });
    socket.on('increaseVolume', function(inc){
        db.counter.update({"counter" : "increaseVolume"}, {"$inc":{"hits": inc}});
        io.emit('increaseVolume', inc, userCount);
    });
    socket.on('decreaseSpeed', function(inc){
        db.counter.update({"counter" : "decreaseSpeed"}, {"$inc":{"hits": inc}});
        console.log("decerease speed" );
        io.emit('decreaseSpeed', inc, userCount);
    });
    socket.on('increaseSpeed', function(inc){
        db.counter.update({"counter" : "increaseSpeed"}, {"$inc":{"hits": inc}});
        io.emit('increaseSpeed', inc, userCount);
    });
    socket.on('resetVotes', function(){
        db.counter.update({},{"$set":{"hits":0}},{multi:true});
        io.emit('resetVotes');
    });

    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete', function (index, id) {

        console.log("Server received 'question delete' broadcast for id: "+id);
        //deletes the selected question from the database
        db.questionsCollection.remove({_id: mongojs.ObjectId(id)});
        io.emit('question delete', index, id);


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


/* DATABASE METHODS */
app.get('/questionsCollection', function (req, res, socket) {
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
app.get('/counters', function(req, res){
    db.counter.find(function(err,doc){
        res.json(doc);

    })
})


http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
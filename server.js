var express = require('express');
var app = express();
var mongojs = require('mongojs');

//var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection', 'counter']);
var db = mongojs('mongodb://kolabgroup:12345678@ds115110.mlab.com:15110/kolabdb', ['questionsCollection', 'counter']);
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
        io.emit('incUser');
        cookies.userCount -=1;
    }


    socket.on('disconnect', function () {
        console.log('a user disconnected');
        if (cookies.userCount<1){
            userCounter -= 1;
            io.emit('decUser');
            cookies.userCount +=1;
        }

    });

    // servers response to emitted message from controllers
    socket.on('question message', function (msg) {
        console.log('message: ' + msg);
        var rString = randomString(24, '0123456789abcdef');
        io.emit('pp message', {_id: mongojs.ObjectID(rString), text: msg, tag: ""});
    });

    socket.on('processed message', function (msg) {
        console.log('message: ' + msg);

        //creates random string with the function outside the socket function

        //inserting new message into mlab database
        db.questionsCollection.insert({_id: mongojs.ObjectID(msg._id), text: msg.text, tag: msg.tag}, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log("question message inserted into the db: " + msg);
            }
        });
        // broadcasts question message to all listening sockets with the same object we insert into the database
        io.emit('question message', {_id: mongojs.ObjectID(msg._id), text: msg.text, tag: msg.tag});
    });



    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete', function (index, id) {

        console.log("Server received 'question delete' broadcast for id: "+id);
        //deletes the selected question from the database
        db.questionsCollection.remove({_id: mongojs.ObjectId(id)});
        io.emit('question delete', index, id);


    });


    //servers response to emitted message to delete question from lecturer controller
    socket.on('question delete grouped', function (rowIndex, index, obj) {

        console.log("Server received 'question delete' broadcast for id: "+obj._id);
        //deletes the selected question from the database
        db.questionsCollection.remove({_id: mongojs.ObjectId(obj._id)});
        io.emit('question delete grouped',rowIndex, index, obj);


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
        var hits = parseInt(cookies.increaseVolumeCount);
        db.counter.update({"counter" : "increaseVolume"}, {"$inc":{"hits": parseInt(cookies.increaseVolumeCount)}});
        console.log("increaseses volumes" + cookies.increaseVolumeCount);
        cookies.increaseVolumeCount=parseInt(cookies.increaseVolumeCount)*(-1);

        io.emit('increaseVolume', hits)

    });
    socket.on('decreaseSpeed', function(){
        var hits = parseInt(cookies.decreaseSpeedCount);
        db.counter.update({"counter" : "decreaseSpeed"}, {"$inc":{"hits": parseInt(cookies.decreaseSpeedCount)}});
        console.log("decerease speed" + cookies.decreaseSpeedCount);
        cookies.decreaseSpeedCount=parseInt(cookies.decreaseSpeedCount)*(-1);

        io.emit('decreaseSpeed', hits)

    });
    socket.on('increaseSpeed', function(){
        var hits = parseInt(cookies.increaseSpeedCount);
        db.counter.update({"counter" : "increaseSpeed"}, {"$inc":{"hits": parseInt(cookies.increaseSpeedCount)}});
        console.log("incerease speed"+ cookies.increaseSpeedCount);
        cookies.increaseSpeedCount=parseInt(cookies.increaseSpeedCount)*(-1);

        io.emit('increaseSpeed', hits)

    });
    socket.on('resetVotes', function(){
        db.counter.update({},{"$set":{"hits":0}},{multi:true});
        console.log(cookies);
        cookies = cookie.parse('userCount = 0; cantKeepUpCount = 1; decreaseVolumeCount = 1; increaseVolumeCount = 1;decreaseSpeedCount = 1; increaseSpeedCount = 1')
        io.emit('resetVotes');
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
});
http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
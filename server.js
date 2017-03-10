var express = require('express');
var app = express();
var mongojs = require('mongojs');

var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection']);

var bodyParser = require('body-parser');
var path = require('path');


app.use(express.static(__dirname));
app.use(bodyParser.json());


/* SOCKET IO */
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCounter = 1;

io.on('connection', function(socket){
    console.log('User '+userCounter+ ' connected.');
    userCounter+=1;
    socket.on('disconnect',function () {
        console.log('a user disconnected');
    });

    socket.on('question message', function(msg){
        console.log('message: '+ msg);
        io.emit('question message', msg);
        db.questionsCollection.insert({text : msg}, function(err, o){
            if (err) { console.warn(err.message);}
            else { console.log("question message inserted into the db: "+ msg);}
        });
    });
});


/* SERVER SIDE ROUTING */
app.get('/lecturer', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/student', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/questions', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});


/* DATABASE METHODS */
app.get('/questionsCollection', function (req, res, socket) {
    console.log("I received a GET request");

    db.questionsCollection.find(function (err, docs) {
     console.log(docs);
     res.json(docs);
     });
});

app.post('/questionsCollection', function (req, res) {
    console.log("I received a POST request");
    console.log(req.body);
    db.questionsCollection.insert(req.body, function (err, doc) {
        res.json(doc);
    });
});

app.delete('/questionsCollection/:id', function (req, res) {
    console.log("I received a DELETE request");
    var id = req.params.id;
    console.log(id);
    db.questionsCollection.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);

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

http.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
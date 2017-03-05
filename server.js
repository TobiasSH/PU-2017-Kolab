var express = require('express');
var app = express();
var mongojs = require('mongojs');

var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection']);

var bodyParser = require('body-parser');
var path = require('path');


app.use(express.static(__dirname));
app.use(bodyParser.json());


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
app.get('/questionsCollection', function (req, res) {
    console.log("I received a GET request");

    db.kolabDB.find(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });

});

app.post('/questionsCollection', function (req, res) {
    console.log("I received a POST request");
    console.log(req.body);
    db.kolabDB.insert(req.body, function (err, doc) {
        res.json(doc);
    });
});

app.delete('/questionsCollection/:id', function (req, res) {
    console.log("I received a DELETE request");
    var id = req.params.id;
    console.log(id);
    db.kolabDB.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);

    });
});

app.get('/questionsCollection/:id', function (req, res) {
    console.log("I received a GET request");
    var id = req.params.id;
    console.log(id);
    db.kolabDB.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
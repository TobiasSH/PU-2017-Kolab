var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection']);
var bodyParser = require('body-parser');
var path = require('path');


app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/lecturer', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/student', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/questions', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});


app.get('/kolab', function (req, res) {
    console.log("I received a GET request")

    db.kolab.find(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });

});

app.post('/kolab', function (req, res) {
    console.log(req.body);
    db.kolab.insert(req.body, function (err, doc) {
        res.json(doc);
    });
});

app.delete('/kolab/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.kolab.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);

    });
});

app.get('/kolab/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    db.kolab.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
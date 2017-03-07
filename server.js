var express = require('express');
var app = express();
var mongojs = require('mongojs');

var db = mongojs('mongodb://heroku_2hcp9k8k:19uocjcgsn6ce4pp7j66fe1ras@ds119020.mlab.com:19020/heroku_2hcp9k8k', ['questionsCollection', 'counter']);


var bodyParser = require('body-parser');
var path = require('path');
var cookie = require('cookie');
var cookies = cookie.parse('ckuCount = -1; dvCount = -1; ivCount = -1;dsCount = -1; isCount = -1')

console.log(cookies.ckuCount);
console.log("hai")


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

app.get('/counter', function(req, res){
    if (req.query.id == "cku"){
        cookies.ckuCount=parseInt(cookies.ckuCount)+1
        console.log("1");
        var count = cookies.ckuCount
    } else if (req.query.id=="dv"){
        cookies.dvCount=parseInt(cookies.dvCount)+1;
        var count = cookies.dvCount;
        console.log("dv")
    }else if (req.query.id=="iv"){
        cookies.ivCount=parseInt(cookies.ivCount)+1;
        var count = cookies.ivCount;
    }else if (req.query.id=="ds"){
        cookies.dsCount=parseInt(cookies.dsCount)+1;
        var count = cookies.dsCount;
    }else if (req.query.id=="is"){
        cookies.isCount = parseInt(cookies.isCount)+1;
        var count = cookies.isCount;
    }
    if (count % 2 == 0){
        console.log(req.query.id);
        db.counter.update({"counter" : req.query.id}, {"$inc":{"hits": 1}});

        console.log("mod 0 ")
    }
    else if (count % 2 == 1) {
        db.counter.update({"counter" : req.query.id}, {"$inc":{"hits": -1}});

        console.log("mod 1")
    }
    res.json("test yo");

});

/* DATABASE METHODS */
app.get('/questionsCollection', function (req, res) {
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

app.listen(process.env.PORT || 3000);
console.log("Server running on port 3000");
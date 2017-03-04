var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('kolab', ['kolab', 'counter'] );

var bodyParser = require('body-parser');
var path = require('path');
var cookie = require('cookie');
var cookies = cookie.parse('ckuCount = -1; dvCount = -1; ivCount = -1;dsCount = -1; isCount = -1')

console.log(cookies.ckuCount);
console.log("hai")

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

app.listen(3000);
console.log("Server running on port 3000");
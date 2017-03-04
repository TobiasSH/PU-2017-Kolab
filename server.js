var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('kolab', ['kolab', 'counter'] );

var bodyParser = require('body-parser');
var path = require('path');
var ckuCount = -1;
var dvCount = -1;
var ivCount = -1;
var dsCount = -1;
var isCount = -1;


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
        ckuCount+=1
        console.log("1");
        var count = ckuCount
    } else if (req.query.id=="dv"){
        dvCount+=1;
        var count = dvCount;
        console.log("dv")
    }else if (req.query.id=="iv"){
        ivCount+=1;
        var count = ivCount;
    }else if (req.query.id=="ds"){
        dsCount+=1;
        var count = dsCount;
    }else if (req.query.id=="is"){
        isCount+=1;
        var count = isCount;
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
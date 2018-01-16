
var express = require('express');
var app = express();
var cors = require('cors')
var bodyParser = require('body-parser');
var http = require("http");
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var connect = require('./connect/connect.js');
var assert = require('assert');
var util = require('util');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({ origin: 'null', credentials: true }));
app.use(express.static(__dirname));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.set('port', (process.env.PORT || 5000));




var test = {test: "glutt"}


app.get('/view', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("Connecting");
        assert.equal(null, err);
        db.collection('jobs.company').find().toArray(  (err, data) =>  {
            res.render('front.ejs', {jobs : data, test: test });
        }  );
    });
});

app.get('/raw', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("Connecting");
        assert.equal(null, err);
        db.collection('jobs.company').find().toArray(  (err, data) =>  {
            res.json(data);
        });
    });
});

app.post('/newcompany', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {
        var company = req.body.company;
        var check = db.collection('jobs.company').find({'name': req.body.company }).toArray(function (err, items) {
            console.log('CREATE - ' + JSON.stringify(company)   );
            console.log("Check - " + JSON.stringify(items) );
            if(!items[0]){console.log("Check = empty")}
            //db.collection('jobs.company').insert({ 'name': req.body.company, jobs: {} });
            
            res.redirect(303, '/view');
        });
    });
});

app.post('/newjob', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {
        var newjob = req.body;
        db.collection('jobs.company').insert({ name: newjob.company, jobs: {
            position :newjob.jobName,
            salary: newjob.salary,
            experience: newjob.experience}
        });
        console.log('CREATE - ' +JSON.stringify(newjob)   );
        res.redirect(303, '/view');
    });
});

// This should be a DELETE request, but easier to test with GET..
// Note: always add ObjectId in the deleteOne filter
app.get('/del:id', (req, res)=>{
    console.log("DELETE "+ req.params.id);
    MongoClient.connect(connect.uri, (err, db) => {
        db.collection('jobs.company').deleteOne({"_id" : ObjectId(req.params.id) });
    })

    res.redirect(303, '/view');



});



app.listen(app.get('port'), () => {
	console.log('We are live on port: '+ app.get('port'));

});

//

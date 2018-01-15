
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





// connectDB can show or return data from DB
function connectDB(cb, res){
    MongoClient.connect(connect.uri, (err, db) => {
      console.log("Connecting to jobs DB...");
      assert.equal(null, err);
      db.db('jobs').collection(coll).find().toArray(  (err, data) =>  cb(data, db, res)  );
    });
  }



function insertDB(object, cb, res){
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("Inserting to jobs DB...");
        assert.equal(null, err);
        db.db('jobs').createCollection('jobs');
    });
}

function newCompany(coll, cb, res){
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("New collection " + coll);
        assert.equal(null, err);
        db.db('jobs').collection(coll);
        cb();
    });
}



// Callback SHOW
function show(data, db, res){
    console.log(JSON.stringify(data).substring(0, 144));
    console.log("Showdb :" + util.inspect(data).substring(0, 99));
    jobs= data;
    res.json(data);
    db.close();
  }

// Callback RETURN
function returnDB(data, db, res){
    console.log("Render :" + util.inspect(data).substring(0, 99));
    res.render('front.ejs',{jobs : data, jobList: jobList, collz: collz });
    db.close();
}

// Raw view
app.get('/jobs', function(req, res){
    connectDB('jobs', show, res);
})

// New job
app.get('/createnewjob', function(req, res){
    connectDB('jobs', show, res);
})

// New company
app.post('/createcompany', function(req, res){
    console.log('POST - create company: ' +JSON.stringify(req.body.company)   );
    newCompany(req.body.company, ()=> {  res.redirect(303, '/createnewjob') }, res  );
})

// view DB and generate POST requests
app.post('/createjob', function(req, res){
    console.log('POST - req.body: ' +JSON.stringify(req.body)   );
    insertDB(req.body, ()=> {  res.redirect(303, '/createnewjob')  });
})



app.listen(app.get('port'), () => {
	console.log('We are live on port: '+ app.get('port'));

});

//

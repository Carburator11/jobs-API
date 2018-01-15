
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

app.post('newcompany', (req, res)=>{
    console.log('POST - create company: ' +JSON.stringify(req.body.company)   );
    res.redirect(303, '/view')
})





app.listen(app.get('port'), () => {
	console.log('We are live on port: '+ app.get('port'));

});

//

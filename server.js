
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


// A raw view of the DB
app.get('/raw', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("Connecting");
        assert.equal(null, err);
        db.collection('jobs.company').find().toArray(  (err, data) =>  {
            res.json(data);
        });
    });
});


// FILTERED VIEW
app.post('/filter-view', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("Connecting");
        assert.equal(null, err);
        db.collection('jobs.company').find({name: req.body.f0}).toArray(  (err, data) =>  {            
            res.render('front-filter.ejs', {jobs : data });
        });
    });
    
})

// Job view
app.get('/job-:id', (req, res)=>{

    console.log(ObjectId(req.params.id));
    
    MongoClient.connect(connect.uri, (err, db) => {
        db.collection('jobs.company').find({  "jobs" :  { $exists: true }  }).toArray(  (err, data) =>  {
        // Itération super-compliquée sur les sous-documents....
        // Il y a sûrement une méthode plus simple...
            if(err){
                console.log("Error: " + err);
                }
            else{
                data.forEach(element => {
                    element.jobs.forEach( elem =>{
                        if(  JSON.stringify(elem._id) === JSON.stringify(req.params.id) ){
                            console.log("Match job id: " + JSON.stringify( elem._id ) );
                            res.send("Job #" + req.params.id +"<br><br> Company: " +  element.name + "<br> Position:"+ elem.position +"<br> Salary:"+ elem.salary +"<br> Experience level:" + elem.experience);
                        } 
                    })
                });
            }  
        })
    })
})



// MAIN VIEW    [optional 'msg' param (duplicate error, void name, ...)]
app.get('/:msg?', (req, res)=>{
    if(req.params.msg){console.log(req.params.msg)}
    MongoClient.connect(connect.uri, (err, db) => {
        console.log("Connecting");
        assert.equal(null, err);
        db.collection('jobs.company').find().toArray(  (err, data) =>  {
            res.render('front.ejs', {jobs : data, test: {this: "is a test"}, msg: req.params.msg });
        }  );
    });
});



// Create new company
app.post('/newcompany', (req, res)=>{
    console.log('CREATE attempt - ' + JSON.stringify(req.body.company)   );

    // Error 50 : void company name provided
    if(req.body.company === ''){
        console.log("Error 50 : void company name provided")
        res.redirect(303, '/err50');   
    }
    
    else{
        MongoClient.connect(connect.uri, (err, db) => {
            db.collection('jobs.company').find({'name': req.body.company }).toArray(function (err, items) {
                
                // Check if company exists already
                if(!items[0]){ 
                    console.log("CREATE completed - " + JSON.stringify(req.body.company)  )
                    db.collection('jobs.company').insert({ name: req.body.company, jobs: [] });
                    res.redirect(303, '/newCompAdded');
                    }
                
                else{ 
                    // Error 80 : duplicate
                    console.log("Error 80: company already exists");
                    res.redirect(303, '/err80');
                    }
                
            });
        });
    }
});

// Create new job
app.post('/newjob', (req, res)=>{
    MongoClient.connect(connect.uri, (err, db) => {

        db.collection('jobs.company').update({ name: req.body.company}, {$push: {jobs: {
            _id        :  new ObjectId(),
            position   :  req.body.jobName,
            salary     :  req.body.salary,
            experience :  req.body.experience}
            }
        });
        console.log('CREATE - ' +JSON.stringify(req.body)   );
        res.redirect(303, '/');
    });
});






// This should be a DELETE request, but easier to test with GET..
app.get('/del/:id', (req, res)=>{
    console.log("DELETE "+ req.params.id);
    MongoClient.connect(connect.uri, (err, db) => {
        // Note: always add ObjectId in the deleteOne filter
        db.collection('jobs.company').deleteOne({"_id" : ObjectId(req.params.id) });
    })
    res.redirect(303, '/');
});



app.listen(app.get('port'), () => {
	console.log('We are live on port: '+ app.get('port'));
});

// End of app

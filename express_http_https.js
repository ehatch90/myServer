var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.use(bodyParser());
app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.get('/getcity', function (req, res) {
    console.log("In getcity route");
    
  fs.readFile('cities.dat.txt', function (err,data){
  if(err) throw err;
  var cities = data.toString().split('\n');
  var myRe = new RegExp('^' + req.query['q']);
  var jsonresult = [];
  for(i = 0; i < cities.length; i++)
  {
       var result = cities[i].search(myRe);
       if(result != -1){
       console.log(cities[i]);
       jsonresult.push({city:cities[i]});
       }
  }
      console.log(JSON.stringify(jsonresult));
      res.writeHead(200);
      res.end(JSON.stringify(jsonresult));
      });
    //res.json([{city:"Price"},{city:"Provo"}]);
 });
app.get('/comment', function (req, res) {
    console.log("In comment route");
    
	var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr){
              console.log("Document Array: ");
              console.log(itemArr);
	     res.status(200);
	     res.json(itemArr);
	     res.end();
	    });
          });
        });
      });
  });
var basicAuth = require('basic-auth-connect');
  var auth = basicAuth(function(user, pass) {
    return((user ==='cs360')&&(pass === 'test'));
  });
app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");
    console.log(req.user);
    console.log("Remote User");
    console.log(req.remoteUser);
    console.log(req.body.Name);
    console.log(req.body.Comment);
	var reqObj = req.body;
        console.log(reqObj);
        //console.log("Name: "+reqObj.Name);
        //console.log("Comment: "+reqObj.Comment);
      
    var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
          if(err) throw err;
          db.collection('comments').insert(reqObj,function(err, records) {
            console.log("Record added as "+records[0]._id);
          });
        });
    res.status(200);
    res.end();
  });
//app.listen(80);

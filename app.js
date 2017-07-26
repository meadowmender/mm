var express = require("express");
var fs = require('fs');
var app = express();
var bodyParser = require("body-parser");
var mongoclient = require('mongodb').MongoClient;
var meadow;
var ejs = require("ejs");
var http = require("http");
//var crypto = require('crypto');
var sha256 = require('sha256');
var request = require('request');
var mmaux = require('./mmaux/mmaux.js');
var https = require('https');
var rand = require('csprng');


var certdir;
var envmode;
var captchaSecret;
var mailpass;
const googleSiteVerify = "https://www.google.com/recaptcha/api/siteverify";

var app2 = express();
var httpServer = http.Server(app2);

app2.get('*',function(req,res){
  if (envmode == "prod") {
    res.redirect('https://www.meadowmender.com' + req.url);
  }
  else if (envmode == "dev") {
    res.redirect('https://dev.meadowmender:3000' + req.url);
  }
})

function dateFormat (date, fstr, utc) {
  utc = utc ? 'getUTC' : 'get';
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
}

function getTimeStamp() {
  var dateUTC = new Date();
  var dateUTC = dateUTC.getTime();
  var dateIST = new Date(dateUTC);
  dateIST.setHours(dateIST.getHours() + 5);
  dateIST.setMinutes(dateIST.getMinutes() + 30);
  return '[' + dateFormat (dateIST, "%d-%m-%Y %H:%M:%S", true) + '] ';
}

var urlencodedParser = bodyParser.urlencoded({extended:true});
app.use(express.static("public")); //define static directory
app.use(bodyParser.json()); //to parse application-json
app.use(urlencodedParser); // for parsing application/x-www-form-urlencoded
app.set('view engine','ejs');


mongoclient.connect("mongodb://meadowworker:" + process.argv[2] + "@localhost:27017/meadow", function(err,db) {
  if (!err){
    console.log("We are connected");
    meadow = db;

    var configData = meadow.collection("Config");
    configData.find({}).toArray(function(err,doc) {
      if (doc.length == 0) {console.log("Config data is missing!!")}
      else {
        //higsboson - changed to correct identifiers - Access Key Id & Secret Key from Config collection
        //captchaSecret = doc[0].captchaSecret;
        certdir = doc[0].certdir;
        envmode = doc[0].envmode;
        captchaSecret = doc[0].captchaSecret;
        mailpass = doc[0].mailconn;

        console.log('hello!' + certdir + envmode);

        if (envmode == "prod") {
          urlHost = "home.meadowmender.com";
        } else if (envmode == "dev") {
          urlHost = "dev.meadowmender.com";
        }


        var certoptions = {
           key  : fs.readFileSync(certdir + "meadowkey.pem"),
           cert : fs.readFileSync(certdir + "meadowcert.pem"),
           passphrase: 'chochothebubbygirl'
        };

        var server = https.createServer(certoptions, app).listen(3000, function () {
           console.log('Started https on 3000!');
        });

        httpServer.listen(8080, function(err){
          console.log('Listening on 8080');
        });

      }
    });
  }
  else {
    console.log("Error in connection"+err);
  };

});



app.get('/', function(req,res) {
  console.log(getTimeStamp() + 'Home|' + req.connection.remoteAddress)
  res.sendFile(__dirname + "/site/index.html");
});

app.get('/signup', function(req,res) {
  console.log(getTimeStamp() + 'Home|' + req.connection.remoteAddress)
  res.sendFile(__dirname + "/site/signup.html");
});

app.post('/verifyRecaptcha',urlencodedParser,function(req,res){
  //console.log('checking captcha');
  var captchaRes=req.body.Response;
  request ({uri : googleSiteVerify,
    method : 'POST',
    json : true,
    form : {secret : captchaSecret,response : captchaRes}
  }, function(error,response,body) {
    //console.log('Captcha:' + error + " - " + JSON.stringify(response) + " - " + JSON.stringify(body));
    res.send(response.body);
  })
})

app.get('/getPricing', function(req,res) {
  var pricingData = meadow.collection("Pricing");
  pricingData.find({}).toArray(function(err,doc) {
    if (!err) {
      res.format({'application/json': function(){res.send(doc)}})
    }
  })
});

app.get('/checkIfEmailExists',function (req,res) {
  var users = meadow.collection('Users');
  try {
    users.find({"Email": req.query.email},{_id:0,Email:1}).toArray(function(err,docs) {
      if (!err){
        if (docs.length == 0)
          res.end("EmailDoesNotExist")
        else
          res.end("EmailExists");
      }
      else {res.end("Error in fetching documents")}
    });
  }
  catch (e) {res.end(e)};
});

app.post('/getsalt',urlencodedParser,function(req,res) {
  //req.session.email = null;
  //req.session.user = null;
  res.end(rand(160,36));
});

app.post('/saveUser',urlencodedParser,function(req,res){
  var users = meadow.collection('Users');
  try {
    users.find({"Email": req.body.User.Email},{_id:0,Email:1}).toArray(function(err,docs) {
      if (!err){
        if (docs.length == 0) {
          users.insert(req.body.User, function(err,insertedObj) {
            if (!err) {
                  var emailTxt = '<p style="font-family:"Merriweather", serif;font-size:16px">Dear '+ req.body.User.FName +',<br><br>Thank you for registrying with Meadowmender.</p>';
                  mmaux.mailer(mailpass,'support',req.body.User.Email,'Account Created',emailTxt,function(message,response) {});
                  res.send('Account creation success!');
            }
            else {
              res.send("Error creating profile. Please try again later")
            }
          });

        }
        else
          res.end("EmailExists");
      }
    });
  }
  catch (e) {
    res.end(e)
  }
});

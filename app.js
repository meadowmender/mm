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
var usersession = require('client-sessions');
var ObjectId = require('mongodb').ObjectID;


var certdir;
var envmode;
var captchaSecret;
var mailpass;
const googleSiteVerify = "https://www.google.com/recaptcha/api/siteverify";

var app2 = express();
var httpServer = http.Server(app2);

app.use(usersession({
  cookieName: 'session',
  //The secret key will need to come from the database
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app2.get('*',function(req,res){
  if (envmode == "prod") {
    res.redirect('https://home.meadowmender.com' + req.url);
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


mongoclient.connect("mongodb://worker:" + process.argv[2] + "@localhost:27017/meadow", function(err,db) {
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
          urlHost = "dev.meadowmender.com:3000";
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
          req.body.User.created = new Date();
          users.insert(req.body.User, function(err,insertedObj) {
            if (!err) {
                  var emailTxt = '<p style="font-family:"Merriweather", serif;font-size:16px">Dear '+ req.body.User.FName +',<br><br>Thank you for registrying with Meadowmender.</p>';
                  mmaux.mailer(mailpass,'support',req.body.User.Email,'Account Created',emailTxt,function(message,response) {});
                  req.session.email = req.body.User.Email;
                  req.session.name = req.body.User.FName;
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


app.get('/home',urlencodedParser, function (req,res) {
  if (req.session && req.session.email) {
    res.render(__dirname + "/site/home.ejs",{email : req.session.email,fname: req.session.name});
    console.log("Call made to Home " + req.session.email);
  } else {
    res.redirect('/');
  }
});

app.post('/getLocationSummary',urlencodedParser, function (req,res){
  var users = meadow.collection('Users');
  try {
    users.find({"Email": req.body.info},{_id:0,Locs:1}).toArray(function(err,docs) {
      if (!err){
        res.format({'application/json': function(){res.send(docs[0].Locs)}})
      }
    });
  } catch (e){
    res.end(e);
  }

})

app.get('/getUserProfileDetails', function (req,res) {
  var users = meadow.collection('Users');
  console.log('checking for ' + req.query.userid);
  if ((req.session && req.session.email)) {
    users.find({"Email": req.query.userid},{"_id":1,"Email":1,"Phone":1,"FName":1,"LName":1}).toArray(function(err,docs){
      if (!err) {
        if (docs.length == 1) {
          console.log('Found');
          res.format({'application/json': function(){res.send(docs)}})
        }
        else {
          var nothing = [];
          res.format({'application/json': function(){res.send(nothing)}})
        }
      }
    });
  } else
  res.redirect('/');
});

app.post('/saveProfileChanges',urlencodedParser, function (req,res) {
  //console.log("Name is " + req.body.hostname);
  if (req.session && req.session.email) {
    var users = meadow.collection('Users');
    users.update({"_id" : new ObjectId(req.body._id)},{$set:{"FName":req.body.fname,"LName":req.body.lname,"Phone":req.body.phone}}, function(err) {
      if (!err) {req.session.name = req.body.fname;res.redirect('/home');}
      else {res.send("Error in updating product status")}
    })
  }
});

app.post('/getSaltForUser',urlencodedParser,function(req,res) {
  //console.log(req.body.user);
  var users = meadow.collection('Users');
  var qryStr = req.query.eventID;
  try {
    users.find({"Email" : req.body.user},{_id:0,Email:1,Uppu:1}).toArray(function(err,docs) {
      if (!err){
      if (docs.length == 0) {res.end("")}
      else {res.end(docs[0].Uppu)}
      }
      else {res.end("Error in fetching documents")}
    });
  }
  catch (e) {res.end(e)};
});

app.post('/changePassword',urlencodedParser, function (req, res){
  //console.log("Performing login with " +  req.body.attempt + " " + req.body.gensalt);
  var users = meadow.collection('Users');
  //console.log("Session Id" + sha256(req.body.email));
  try {
    users.find({"Email" : req.body.email},{_id:0,Hash:1,FName:1}).toArray(function(err,docs) {
      if (!err){
        //console.log('into the log')
        if (docs.length == 0) {res.end("")}
        else {
          //console.log("Key from DB is " + docs[0].KEY);
          var trypass = sha256(req.body.gensalt + docs[0].Hash);
          //console.log("Try Pass is " + trypass);
          if (req.body.attempt == trypass) {
            req.session.email = req.body.email;
            req.session.name = docs[0].FName;
            //console.log("session user is " + req.session.user);
            res.end("Login Success");
          } else {
            res.end("Login Fail");
          }
        }
      }
      else {res.end("Error in fetching documents")}
    });
  }
  catch (e) {res.end(e)};
});

app.post('/getPasswordChangeSalt',urlencodedParser,function(req,res) {
  //console.log("session user is " + req.session.user);
  res.end(rand(160,36));
});

app.post('/saveNewPassword', urlencodedParser, function (req, res){
  var users = meadow.collection('Users');
  //console.log("changedPassData is" + req.body.changedPassData)
  var passData = JSON.parse(req.body.changedPassData);
  //console.log("User for which password gonna be changed is is" + passData.user + req.session.user)
  var hashed = req.session.email;
  if (hashed == passData.user) {
    users.update({"Email" : hashed},{$set:{"Hash":passData.Password,"Uppu":passData.Uppu}}, function(err) {
      if (!err) {
        //console.log("Password changed to :" + passData.Password);
        //console.log("uppu changed to :" + passData.Uppu);
        res.send("Success.")
      }
      else {res.send("Error in updating product status")}
    })
  }
});

app.get('/forgotPassword',function(req,res) {
  res.sendFile(__dirname + "/site/forgotPassword.html");
})

app.post('/resetPassword',urlencodedParser,function(req,res) {//change the status of the product
  try {
    var users = meadow.collection('Users');
    var aux_passwordReset = meadow.collection('AUX_PASSRESET');


    users.find({"Email": req.body.username},{"_id":1,"FName":1,"Phone":1,"Email":1}).toArray(function(err,docs){
      if (!err) {
        if (docs.length) {
          //console.log('email found');
          var setval = sha256(rand(160,36) + docs[0].Email) + sha256(rand(160,36) + docs[0]._id);
          aux_passwordReset.insert({"email":req.body.username,"FP":setval}, function(err,result) {
            if (!err) {
              //console.log('inserted fp');
              mmaux.mailer(mailpass,'support',req.body.username,'Password Reset','<b>Click the link below to change your password:</b><br><br><a href="https://' + urlHost + '/rpf?c=' + setval + '" >Change Password</a> <br><br> - Team Meadowmender',function(message,response) {
                res.end('mailsent');
              });
            }
            else {res.end("Error in FP")}
          })
        } else {
          res.end('mailsent');
        }
      }
    });
  }
  catch (e) {console.log("Error - "+e)}
})

app.get('/rpf', function (req,res){
  var fp = encodeURIComponent(req.query.c);
  var aux_passwordReset = meadow.collection('AUX_PASSRESET');
  aux_passwordReset.find({"FP": fp},{"_id":1,"email":1}).toArray(function(err,docs){
    if (!err) {
      if (docs.length) {
          res.render(__dirname + "/site/newPassword.ejs",{c : req.query.c});
      }
    }
  })

});

app.post('/saveNewPassword', urlencodedParser, function (req, res){
  var users = meadow.collection('Users');
  //console.log("changedPassData is" + req.body.changedPassData)
  var passData = JSON.parse(req.body.changedPassData);
  //console.log("User for which password gonna be changed is is" + passData.user + req.session.user)
  var hashed = req.session.user;
  if (hashed == passData.user) {
    users.update({"Email" : hashed},{$set:{"Hash":passData.Password,"Uppu":passData.Uppu}}, function(err) {
      if (!err) {
        //console.log("Password changed to :" + passData.Password);
        //console.log("uppu changed to :" + passData.Uppu);
        res.send("Success.")
      }
      else {res.send("Error in updating product status")}
    })
  }
});

app.post('/setPassword', urlencodedParser, function (req,res){
  var aux_passwordReset = meadow.collection('AUX_PASSRESET');
  var users = meadow.collection('Users');
  aux_passwordReset.find({"FP": req.body.c},{"_id":1,"email":1}).toArray(function(err,docs){
    if (!err) {
      if (docs.length) {
          users.update({"Email" : docs[0].email},{$set:{"Hash":req.body.h,"Uppu":req.body.s}}, function(err) {
            if (!err) {
              aux_passwordReset.remove({"FP": req.body.c}, function (err, result) {
                if (!err) {
                      res.send("success")
                }
              })
            }
            else {res.send("Error setting Password")}
          })
      }
    }
  })
});

app.post('/plogin',urlencodedParser,function(req,res){
  //console.log("Performing login with " +  req.body.attempt + " " + req.body.gensalt);

  var user = meadow.collection('Users');
  var qryStr = req.query.eventID;
  try {
    user.find({"Email" : req.body.user},{_id:0,Hash:1,FName:1}).toArray(function(err,docs) {
      if (!err){
        if (docs.length == 0) {res.end("")}
        else {
          //console.log("Key from DB is " + docs[0].KEY);
          var trypass = sha256(req.body.gensalt + docs[0].Hash);
          //console.log("Try Pass is " + trypass);
          if (req.body.attempt == trypass) {
            req.session.email = req.body.email;
            req.session.name = docs[0].FName;
            res.end("Login Success");
          } else {
            res.end("Login Fail");
          }
        }
      }
      else {res.end("Error in fetching documents")}
    });
  }
  catch (e) {res.end(e)};
});


app.get('/logout',function (req,res) {
  if ((req.session && req.session.email)) {
    req.session.email = null;
    req.session.name = null;
    res.end("Log-off success");
  } else {
    res.end("unable to logoff");
  }

});

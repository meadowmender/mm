module.exports.test = function() {
  console.log('this is test');
}

module.exports.randomString = function() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var length = 9;
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

module.exports.mailer = function(pass,from,to,subject,body,callback) {

  //encoding from:

  if (from == "support") {
    from = '"MeadowMender Support" <no-reply@meadowmender.com>';
  }

  console.log('sending email');
  var nodemailer = require('nodemailer');

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
      service: 'Zoho',
      auth: {
          user: 'no-reply@meadowmender.com',
          pass: pass
      }
  });

  // setup email data with unicode symbols
  var mailOptions = {
      from: from, // sender address
      to: to, // list of receivers
      cc: 'support@meadowmender.com',
      subject: subject, // Subject line
      generateTextFromHTML: true,
      html: body // html body
  };

  function sendingTheEmail(tporter,callback) {
    tporter.sendMail(mailOptions, function(error, info){
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        //console.log(response);
        callback(info.messageId,info.response);
    });
  }

  //sendingTheEmail(transporter, function(message,response) {res.end('Message %s sent: %s', message, response)})

  //250 Message received
  sendingTheEmail(transporter, callback);
}


module.exports.ccmailer = function(pass,from,cc,subject,body,callback) {

  //encoding from:


  if (from == "support") {
    from = '"MeadowMender Support" <no-reply@meadowmender.com>';
  }

  console.log('sending email');
  var nodemailer = require('nodemailer');

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
      service: 'Zoho',
      auth: {
          user: 'no-reply@meadowmender.com',
          pass: pass
      }
  });

  // setup email data with unicode symbols
  var mailOptions = {
      from: from, // sender address
      cc: cc, // list of receivers
      to: 'support@meadowmender.com',
      subject: subject, // Subject line
      generateTextFromHTML: true,
      html: body // html body
  };

  function sendingTheEmail(tporter,callback) {
    tporter.sendMail(mailOptions, function(error, info){
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        //console.log(response);
        callback(info.messageId,info.response);
    });
  }

  //sendingTheEmail(transporter, function(message,response) {res.end('Message %s sent: %s', message, response)})

  //250 Message received
  sendingTheEmail(transporter, callback);
}

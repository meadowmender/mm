var tlJsHost = ((window.location.protocol == "https:") ? "https://secure.comodo.com/" : "http://www.trustlogo.com/");
document.write(unescape("%3Cscript src='" + tlJsHost + "trustlogo/javascript/trustlogo.js' type='text/javascript'%3E%3C/script%3E"));
//]]>

function deleteCookie(name) {
    document.cookie = name +'=;path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function assistedSignUp() {
  if ($('#qSName').val().length == 0) {
    $('#warning_modal-title-id2').text('Warning');
    $('#warning_modal-p-id2').text('Please provide a valid name.');
    $('#warning_modal2').modal('show');
  } else if ($('#qSEmail').val().length == 0)  {
    $('#warning_modal-title-id2').text('Warning');
    $('#warning_modal-p-id2').text('Please provide a valid email.');
    $('#warning_modal2').modal('show');
  } else if (!validateEmail($('#qSEmail').val())) {
    $('#warning_modal-title-id2').text('Invalid Input');
    $('#warning_modal-p-id2').text('Please provide a valid email ID.');
    $('#warning_modal2').modal('show');
  } else if ($('#qSPhone').val().length == 0) {
    $('#warning_modal-title-id2').text('Invalid Input');
    $('#warning_modal-p-id2').text('Please provide a valid phone number.');
    $('#warning_modal2').modal('show');
  } else {
      var phone;
      if ($('#qSPhone').val().length == 0) {
        phone = "";
      } else {
        phone = $('#qSPhone').val();
      }
      $.ajax({
       type  : 'POST',
       url   : '/verifyRecaptcha',
       data  : {"Response":grecaptcha.getResponse()},
       success: function(res) {
         if (res.success) {
           var newReg = {};
           newReg.name = $('#qSName').val();
           newReg.email = $('#qSEmail').val();
           newReg.phone = phone;
           $.ajax({
             type  : 'POST',
             url   : '/newReg',
             data :{"newReg":newReg},
             success: function(response) {
               $('#assistedSignUpButton').hide();
               $('#assistedSignUpText').html('Thank you! Our team will get in touch with you shortly!');
             },
             error : function (response) {
               $('#assistedSignUpButton').hide();
               $('#assistedSignUpText').html('There was an error processing your request. Please try again.');
             }
           })
         } else if (res["error-codes"][0] == "missing-input-response") {
            $('#warning_modal-title-id2').text('Missing Input');
            $('#warning_modal-p-id2').text('Please click checkbox to verify that you are a human :)');
            $('#warning_modal2').modal('show');
          }
        },
        error : function (res) {
          $('#warning_modal-title-id2').text('Error');
          $('#warning_modal-p-id2').text("Error in validating captcha response - " + res.error_codes);
          $('#warning_modal2').modal('show');
          $('#assistedSignUpButton').hide();
          $('#assistedSignUpText').html('Apologies. There was an error processing your request. Please refresh your browser and try again.');
        }
      })
    }
}

function clean(input) {
  var regEx = /<|>/g;
  return input.replace(regEx," ");
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function askUs() {
  $('#ask_a_query').modal('show');
}

function submitQuery() {
  if ($('#query_email').val() == "") {
    $('#warning_modal-title-id').text('Invalid Input');
    $('#warning_modal-p-id').text('Please provide a valid email ID.');
    setTimeout(function(){ $('#warning_modal').modal('show');return;}, 100);
  } else if (!validateEmail($('#query_email').val())) {
    $('#warning_modal-title-id').text('Invalid Input');
    $('#warning_modal-p-id').text('Please provide a valid email ID.');
    setTimeout(function(){ $('#warning_modal').modal('show');return;}, 100);
  } else if ($('#query').val() == "") {
    $('#warning_modal-title-id').text('Invalid Input');
    $('#warning_modal-p-id').text('Please provide a query.');
    setTimeout(function(){ $('#warning_modal').modal('show');return;}, 100);
  } else {
    $.ajax({
     type  : 'POST',
     url   : '/submitQuery',
     data  : {"email":$('#query_email').val(),"query":clean($('#query').val())},
     success: function(res) {
       if (res == 'mail sent') {
         setTimeout(function(){ $('#submitted_notification').modal('show'); }, 500);
       }
      },
      error : function (res) {
        $('#error_modal-title-id').text('Error');
        $('#warning_modal-p-id').text('There has been an error communicating with server. Please try again after some time.');
        setTimeout(function(){ $('#error_modal').modal('show');}, 500);
      }
    })

  }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}


function validateEmail(email) {
    /*//var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;*/
    var re = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return re.test(email);
}

function removeLocation(loc_pos) {
  /*var data_array=[];
  var newlocslist = "";
  var all_locs = $('#location_info').html();
  alert($('#location_info').html());
  var locations = all_locs.split('<hr><br><br>');
  alert('Total locs ' + locations.length);

  for (var i = 0;i < locations.length;i++) {
    if (loc == i) {
      alert('Removing loc ' + i);
    } else {
      if (i == 0) {
        newlocslist += locations[i];
      }
      else {
        newlocslist += '<hr><br><br>' + locations[i];
      }
    }
  }
  $('#location_info').html(newlocslist); */

  var data_array=[];

  var total_loc = $('#loc_count').val();
  var loc = "";

  for (var i = 0; i < parseInt(total_loc);i++) {
    var item = {};
    item.location = $('#location' + i).val();
    item.area = $('#area_selection' + i).val();
    item.lat = $('#gps_lat' + i).val();
    item.long = $('#gps_long' + i).val();
    data_array[i] = item;
  }






  total_loc = parseInt(total_loc) - 1;

  for (var i = 0; i < total_loc;i++) {
      loc += '<table width="100%" id="form-group_prop_addr0"><tr><td width="65%"><div class="form-group" ><label for="address" id="form-group_prop_label' + i + '"><h4 class="heading">Property ' + (i + 1) + '</h4><button type="button" id="removeButton" class="btn btn-default btn-sm" onclick="removeLocation(' + i + ')"><span class="glyphicon glyphicon-remove remove-selector"></span> Remove </button></label><br /><label for="address" style="padding-top:20px">Address:</label></div>' +
      '<textarea class="form-control" rows="4" id="location' + i + '" placeholder="Re-Survey No./Plot Name or Number,&#10;&#13;Landmark, Village/Taluk/Town, &#10;&#13;District, PIN"></textarea>' +
        '</td><td width="10%"></td><td width="25%"><div class="form-group"><label for="area">Area(in Acres):</label></div><div class="form-group"><input type="text" name="area_selection' + i + '" class="form-control" id="area_selection' + i + '">' +
              '</div></td></tr></table><br /><table width="100%">' +
    '<tr><td width="25%"><div class="form-group"><label for="gps_lat">GPS Latitude:</label></div><input type="text" class="form-control" name="lname" id="gps_lat' + i + '"  placeholder="Optional" required/>' +
      '</td><td width="5%"></td><td width="25%"><div class="form-group" ><label for="gps_long">GPS Longitude:</label></div><input type="text" class="form-control" name="lname" id="gps_long' + i + '"  placeholder="Optional" required/>' +
      '</td><td width="45%"></td></tr></table>';
      loc += '<hr><br><br>'
 }



 $('#location_info').html(loc);
 $('#loc_count').val(total_loc);
 if (total_loc == 1)
  $('#removeButton').css("visibility", "hidden")
 else
  $('#removeButton').css("visibility", "visible")

  for (var i = 0, j = 0; i < parseInt(total_loc) + 1;i++) {
    if (i == loc_pos)
      continue;
    else {
      $('#location' + j).val(data_array[i].location);
      $('#area_selection' + j).val(data_array[i].area);
      $('#gps_lat' + j).val(data_array[i].lat);
      $('#gps_long' + j).val(data_array[i].long);
      j++;
    }
  }

}

function addAnotherProperty() {
  var loc_count = $('#loc_count').val();



  var newloc = '<table width="100%" id="form-group_prop_addr0"><tr><td width="65%"><div class="form-group" ><label for="address" id="form-group_prop_label' + loc_count + '"><h4 class="heading">Property ' + (parseInt(loc_count) + 1) + ' </h4> <button type="button" id="removeButton" class="btn btn-default btn-sm" onclick="removeLocation(' + loc_count + ')"><span class="glyphicon glyphicon-remove remove-selector"></span> Remove </button></label><br /><label for="address" style="padding-top:20px">Address:</label></div>' +
    '<textarea class="form-control" rows="4" id="location' + loc_count + '" placeholder="Re-Survey No./Plot Name or Number,&#10;&#13;Landmark, Village/Taluk/Town, &#10;&#13;District, PIN"></textarea>' +
      '</td><td width="10%"></td><td width="25%"><div class="form-group"><label for="area">Area(in Acres):</label></div><div class="form-group"><input type="text" name="area_selection' + loc_count + '" class="form-control" id="area_selection' + loc_count + '">' +
            '</div></td></tr></table><br /><table width="100%">' +
            '<tr><td width="25%"><div class="form-group"><label for="gps_lat">GPS Latitude:</label></div><input type="text" class="form-control" name="lname" id="gps_lat' + loc_count + '"  placeholder="Optional" required/>' +
              '</td><td width="5%"></td><td width="25%"><div class="form-group" ><label for="gps_long">GPS Longitude:</label></div><input type="text" class="form-control" name="lname" id="gps_long' + loc_count + '"  placeholder="Optional" required/>' +
    '</td><td width="45%"></td></tr></table><hr><br><br>';


    loc_count = parseInt(loc_count) + 1;

 $('#loc_count').val(loc_count);
 $('#location_info').append(newloc);

 if (loc_count == 1)
  $('#removeButton').css("visibility", "hidden")
 else
 $('#removeButton').css("visibility", "visible")
}

function goToSignUp2() {
  if ($('#fname').val() == "") {
    document.getElementById("modalMessage").innerHTML = "Please enter a valid First Name.";
    $("#validateModal").modal('show');
    return false;
  }
  if ($('#lname').val() == "") {
    document.getElementById("modalMessage").innerHTML = "Please enter a valid Last Name.";
    $("#validateModal").modal('show');
    return false;
  }
  if ($('#phone').val() == "") {
    document.getElementById("modalMessage").innerHTML = "Please enter a phone number.";
    $("#validateModal").modal('show');
    return false;
  }
  if ($('#email').val() == "") {
    document.getElementById("modalMessage").innerHTML = "Please enter a valid Email.";
    $("#validateModal").modal('show');
    return false;
  }
  if (!validateEmail($('#email').val())) {
    document.getElementById("modalMessage").innerHTML = "Please enter a valid Email.";
    $("#validateModal").modal('show');
    return false;
  }
  if ($('#password').val() == "") {
    document.getElementById("modalMessage").innerHTML = "Please enter a valid password.";
    $("#validateModal").modal('show');
    return false
  }
  if ($('#rpassword').val() == "") {
    document.getElementById("modalMessage").innerHTML = "Please enter a valid password.";
    $("#validateModal").modal('show');
    return false
  }
  if ($('#rpassword').val() != $('#password').val()) {
    document.getElementById("modalMessage").innerHTML = "The passwords do not match.";
    $("#validateModal").modal('show');
    return false
  }
  if($('#captcha_ver').val() == "0") {
    $.ajax({
     type  : 'POST',
     url   : '/verifyRecaptcha',
     data  : {"Response":grecaptcha.getResponse()},
     success: function(res) {
       if (res.success) {
         location.hash = '#Step2';
         $('#captcha_ver').val("1");
         $('#step1').hide();
         $('#step2').show();
       } else if (res["error-codes"][0] == "missing-input-response") {
          document.getElementById("modalMessage").innerHTML = "Please click checkbox to verify that you are a human :)";
          $("#validateModal").modal('show');
        }
      },
      error : function (res) {
        document.getElementById("modalMessage").innerHTML = "Error in validating captcha response - " + res.error_codes;
        $("#validateModal").modal('show');
        return false;
      }
    })
  }
  else {
    location.hash = '#Step2';
    $('#step1').hide();
    $('#step2').show();
  }

}

function goBackToStep2() {
  $('#step2').show();
  $('#step3').hide();
  location.hash = "#Step2"
  $('#summary_info').html('<i class="fa fa-circle-o-notch fa-spin" style="font-size:72px"></i>');
}

function goBackToStep1() {
  $('#step1').show();
  $('#step2').hide();
  location.hash = "#"
}

function getPrice(priceList,val) {
  for (var i = 0;i < priceList.length;i++) {
    if (priceList[i].Max >= val && priceList[i].Min < val) {
      return priceList[i].Price;
    }
  }
}

$( "#email" )
 .focusout(function() {
   if ($('#emailaddr').val().length > 0)
   $.ajax({
     type: 'GET',
     url: '/checkIfEmailExists',
     data: {email: $('#emailaddr').val()},
     success: function (res) {
       //alert ("Email is " + res);
       if (res == "EmailDoesNotExist") {
         $('#emailvalidate').val("1");
       }
         else {
           document.getElementById("modalMessage").innerHTML = "The email ID provided already exists.";
           $("#validateModal").modal('show');
           $('#emailvalidate').val("0");
         }
     },
     error: function (res) {
       alert ("unable to reach server");
     }
 });
});

function showSummary() {
  for (var i = 0;i < parseInt($('#loc_count').val());i++) {
    if ($('#location' + i).val() == "") {
      document.getElementById("modalMessage").innerHTML = "Property " + (i + 1) + " has no location address specified.";
      $("#validateModal").modal('show');
      return;
    }
    if ($('#area_selection' + i).val() == "") {
      document.getElementById("modalMessage").innerHTML = "Please specify the size for Property " + (i + 1) + "." ;
      $("#validateModal").modal('show');
      return;
    }
    if (parseFloat($('#area_selection' + i).val()) > 100 ||  parseFloat($('#area_selection' + i).val()) < 0.5) {
      document.getElementById("modalMessage").innerHTML = "Property " + (i + 1) + " has an area of " + $('#area_selection' + i).val() + " Acres. This is not something we can support at the moment." ;
      $("#validateModal").modal('show');
      return;
    }
  }
  location.hash = '#Step3';
  $.ajax({
    type  : 'GET',
    url   : '/getPricing',
    success : function (data) {
      var table_header = '<table class="table table-striped" style="text-align:center"><thead><tr><th style="text-align:center">No.</th><th style="text-align:center">Location</th><th style="text-align:center">Area</th><th style="text-align:center">Monthly Subscription Price</th></tr></thead><tbody>'
      var table_rest = "";
      var price = [];
      var location_sum = 0;
      var item_price = 0;
      var summary_extra = "";
      var to_be_confirmed = false;

      for (var i = 0;i < parseInt($('#loc_count').val());i++) {
        var lat,long;
        if ($('#gps_lat' + i).val() == "" || $('#gps_long' + i).val() == "") {
          lat = "-";
          long = "-"
        } else {
          lat = $('#gps_lat' + i).val();
          long = $('#gps_long' + i).val();
        }
        table_rest += '<tr><td>' + (1 + i) + '</td><td>' + $('#location' + i).val() + '<br>Latitude: ' + lat + '<br>Longitude: ' + long + '</td><td>' + $('#area_selection' + i).val() + '</td><td>';
        item_price = getPrice(data,parseFloat($('#area_selection' + i).val()))
        if (item_price == "To be confirmed") {
          to_be_confirmed = true;
          table_rest += 'TBD</td></tr>';
        } else {
          location_sum = location_sum + (item_price * 12);
          table_rest += '&#8377;' + item_price + '</td></tr>';
        }
        //alert(table_rest);
      }
      if (to_be_confirmed) {
        table_rest += '<tr style="font-weight:bold;color:#011a63"><td></td><td> Annual Total </td><td></td><td>To be confirmed.</td></tr></tbody></table>';
        summary_extra = '<hr><br><br><p style="font-size:20px">Note: You will be able to trial our services by just paying the amount for the first three months. This amount will be confirmed with you shortly. The remaining amount can be paid at the end of the three month tenure.</p>'

      } else {
        table_rest += '<tr style="font-weight:bold;color:#011a63"><td></td><td> Annual Total </td><td></td><td>&#8377;' + location_sum + '</td></tr></tbody></table>';
        summary_extra = '<hr><br><br><p style="font-size:20px">You will be able to trial our services by just paying the amount for the first three months. This will be: <br> <p style="color:#01634b;font-size:24px;font-weight:bold">&#8377;' + (location_sum/4) + ' </p> <br><p style="font-size:20px">The remaining amount can be paid at the end of the three month tenure.</p>'
      }
      //alert('Pricing is ' + JSON.stringify(data))
      $('#summary_info').html(table_header + table_rest + summary_extra);
      $('#completeButton').prop('disabled', false);
    },
    error : function (err) {
      alert('Err');
    }
  })
  $('#step2').hide();
  $('#step3').show();
}


function complete() {
  document.getElementById("processingMessage").innerHTML = "Creating Account";
  $("#processingModal").modal('show');
  $.ajax({
    type: 'POST',
    url: '/getsalt',
    success: function (salt) {
     //alert(salt);
     var sha256 = new jsSHA('SHA-256', 'TEXT');
     sha256.update($("#password").val() + salt);
     var hash = sha256.getHash("HEX");
     //alert("Hashed val" + hash);
     var user = {};
     var loc = [];
     user.Email = $('#email').val();
     user.Uppu = salt;
     user.Hash = hash;
     user.FName = $('#fname').val();
     user.LName = $('#lname').val();
     user.Phone = $('#phone').val();
     for (var i = 0;i < parseInt($('#loc_count').val());i++) {
       var loc_info = {};
       loc_info.Addr = $('#location' + i).val();
       loc_info.Area = $('#area_selection' + i).val();
       loc_info.Lat = $('#gps_lat' + i).val();
       loc_info.Long = $('#gps_long' + i).val()
       loc[i] = loc_info;
     }
     user.Locs = loc;
     $.ajax({
         type : 'POST',
         url :"/saveUser",
         data : {"User":user},
         success : function(res) {
           setCookie("NewAccount","True",2);
           window.location.href = "/home";
         },
         error : function(res) {alert("Error in creating account!")}
       })
    },
    error: function (err) {
      alert("Unable to create account")
    }
  })
}



function getUserProfileDetails() {
  $('#headingDesc').html('Profile Information:');
  $('#propertySummary').html('<div style="width:100%;text-align:center"><i class="fa fa-circle-o-notch fa-spin" style="font-size:72px"></i></div>');
  //alert("Getting User information");
  $.ajax({
      type : 'GET',
      url :"/getUserProfileDetails",
      data : {"userid":$('#email').val()},
      success : function(res) {
        var data = "";
        data += '<br><br><form action="/saveProfileChanges" method="POST"><div class="row"><div class="col-sm-4" style="text-align:right"><div class="form-group"><label for="name">Name:</label></div></div>';
        data += '<div class="col-sm-6" style="text-align:center"><div class="form-group"><input type="text" class="form-control" value="' + res[0].FName + '" name="fname"></div></div></div>';
        data += '<div class="row"><div class="col-sm-4" style="text-align:right"><div class="form-group"><label for="name">Name:</label></div></div>';
        data += '<div class="col-sm-6" style="text-align:center"><div class="form-group"><input type="text" class="form-control" value="' + res[0].LName + '" name="lname"></div></div></div>';
        data += '<div class="row"><div class="col-sm-4" style="text-align:right"><div class="form-group"><label for="phone">Mobile:</label></div></div>';
        data += '<div class="col-sm-6" style="text-align:center"><div class="form-group"><input type="text" class="form-control" value="' + res[0].Phone + '" name="phone"></div></div></div>';
        data += '<div class="row"><div class="col-sm-4" style="text-align:right"><div class="form-group"><label for="email">Email:</label></div></div>';
        data += '<div class="col-sm-6" style="text-align:center"><div class="form-group"><input type="text" class="form-control" value="' + res[0].Email + '" name="email" id="email" readonly><input type="hidden" name="_id" id="_id" value="' + res[0]._id + '"></div></div></div>';
        data += '<div class="row"><div class="col-sm-4" style="text-align:right"><div class="form-group"><label for="password">Password:</label></div></div>';
        data += '<div class="col-sm-6" style="text-align:center"><div class="form-group"><input type="password" class="form-control" value="******" id="password" readonly><a href="#" data-target="#changePassword" data-toggle="modal" style="font-size:10px;float:right">Change Password</a></div></div></div>';
        data += '<div class="row"></br></div><div class="row"><div class="col-sm-6" style="text-align:right">' + '<button class="btn btn-primary" name="Save" type="submit" style="background-color:#454282">Save Changes</button></div>';
        data += '<div class="col-sm-6" style="text-align:left">' + '<button class="btn btn-primary" name="Back" style="background-color:#454282" onclick="location.href=\'/home \';return false;">Back</button></div></div></form>';

        $('#propertySummary').html(data);
      },
      error : function(res) { alert ("Error reading from server");}
  });

}

function getLocationSummary() {
  $.ajax({
    type: 'POST',
    url: '/getLocationSummary',
    data: {info: $('#email').val()},
    success: function (res) {
      var container = "";
      for( var i = 0;i < res.length;i++) {
        container += '<div class="bs-callout bs-callout-info"><h4>Location ' + (i+1)  + ' </h4><font class="label">Address:</font> ' + res[i].Addr + '<br><font class="label">Area:</font> ' + res[i].Area +  ' Acre(s)<br>';
        if (res[i].Lat == "" || res[i].Long == "") {
          container += 'Latitude: -  | Longitude: - </div>'
        } else {
          container += '<font class="label">Latitude:</font> ' + res[i].Lat + '  | <font class="label">Longitude:</font> ' + res[i].Long + ' </div>'
        }
      }
      $('#propertySummary').html(container);
    },
    error: function (err) {
      alert('Error reading form server');
    }
  });
}


function changePassword() {
  try {
    //alert("logging in with " + $(login_username).val() + " and " + $(login_password).val());
    $.ajax({
      type: 'POST',
      url: '/getSaltForUser',
      data: {user: $('#email').val()},
      success: function (salt) {
       //alert(salt);
       var sha256 = new jsSHA('SHA-256', 'TEXT');
       sha256.update($('#e_password').val() + salt);
       var hash = sha256.getHash("HEX");
       //alert("Hashed val" + hash);
       $.ajax({
         type: 'POST',
         url: '/getsalt',
         success: function (newsalt) {
          //alert(newsalt);
          var sha2562 = new jsSHA('SHA-256', 'TEXT');
          sha2562.update(newsalt + hash);
          var newhash = sha2562.getHash("HEX");
          //alert("New calculated Salt" + newhash);
          $.ajax({
            type: 'POST',
            url: '/changePassword',
            data: {attempt: newhash,gensalt: newsalt,user: $('#fname').val(),email: $('#email').val()},
            success: function (data) {
             //alert("Performing Login: Result is " + data);
             if (data == "Login Success") {
               //alert('login with existing password is success.');
               $.ajax({
                 type: 'POST',
                 url: '/getPasswordChangeSalt',
                 success: function (salt_for_new_pass) {
                  //alert("Got Salt for new Password" + salt);
                  var sha256 = new jsSHA('SHA-256', 'TEXT');
                  sha256.update($("#login_password").val() + salt_for_new_pass);
                  var hash = sha256.getHash("HEX");
                  //alert("Hashed val" + hash);
                  var changedPassData = '{"Password" : "'+ hash +'", "Uppu": "' + salt_for_new_pass + '", "user": "' + $('#email').val() + '"}';
                  $.ajax({
                      type : 'POST',
                      url :"/saveNewPassword",
                      data : {"changedPassData":changedPassData},
                      success : function(res) {
                        $('#information_modal-title-id').text('Success');
                        $('#information_modal-p-id').text('Your password has been changed.');
                        $('#information_modal').modal('show');
                      },
                      error : function(res) {alert("Error Changing Password!")}
                    })
                 },
                 error: function (err) {
                   alert("Unable to save wishlist")
                 }
               })
             } else {
               $('#error_modal-title-id').text("Error");
               $('#error_modal-p-id').text('Current password is incorrect.');
               $('#error_modal').modal('show');
             }
           },
           error: function (err) {
             alert("Unable to login")
           }
         });
        },
        error: function (err) {
          alert("Unable to login")
        }
      });
      },
      error: function (err) {
        alert("Unable to save wishlist")
      }
    })
  }
  catch (e) {alert("Error!!! - "+e)}
}

function passWordReset() {
  if ($('#username').val() == '') {
    $('#warning_modal-title-id').text('Warning');
    $('#warning_modal-p-id').text('Please provide an email address.');
    $('#warning_modal').modal('show');
    return false;
  }
  //alert('posting');
  $('#passwordChangeButton').html('<i class="fa fa-circle-o-notch fa-spin" style="font-size:24px;"></i><br><p>Processing...</p>')
  $.ajax({
     type  : 'POST',
     url   : '/verifyRecaptcha',
     data  : {"Response":grecaptcha.getResponse()},
     success: function(res) {
       if (res.success) {
          $.ajax({
            type  : 'POST',
            url   : '/resetPassword',
            data : {"username": $('#username').val()},
            success : function (res) {
              if (res == 'mailsent')
              $('#passwordChangeButton').html('<p style="font-size:20px">Done.</p>');
                $('#mail_sent-title-id').text('Success');
                $('#mail_sent-p-id').text('We have sent a link to your registered email address using which you can change your password.');
                $('#mail_sent').modal('show');
            },
            error : function (err) {
              alert ("Error: " + err);
            }
          })
        } else if (res["error-codes"][0] == "missing-input-response") {
          $('#warning_modal-title-id').text('Warning');
          $('#warning_modal-p-id').text('Please click checkbox to verify that you are a human :)');
          $('#warning_modal').modal('show');
        }
      },
      error : function (res) {
        alert("Error in validating captcha response - "+  res.error_codes);
      }
    })
}

function validateAndReset() {
  if ($('#password').val().length < 6) {
    $('#warning_modal-title-id').text('Warning');
    $('#warning_modal-p-id').text('Password needs to be more than 6 characters.');
    $('#warning_modal').modal('show');
    return false;
  } else if ($('#password').val() != $('#repassword').val()) {
    $('#warning_modal-title-id').text('Warning');
    $('#warning_modal-p-id').text('Password do not match.');
    $('#warning_modal').modal('show');
    return false;
  } else if ($('#password').val() == $('#repassword').val()) {
    $.ajax({
      type: 'POST',
      url: '/getsalt',
      success: function (salt) {
       //alert(salt);
       var sha256 = new jsSHA('SHA-256', 'TEXT');
       sha256.update($("#password").val() + salt);
       var hash = sha256.getHash("HEX");
       //alert("Hashed val" + hash);
     $.ajax({
           type : 'POST',
           url :"/setPassword",
           data : {"c": $('#c').val() , "h" : hash, "s": salt},
           success : function(res) {
             if (res == "success") {
               password_changed
               $('#password_changed-title-id').text('Success');
               $('#password_changed-p-id').text('Password changed sucessfully.');
               $('#password_changed').modal('show');
               $('#changePassword').html('<p>Password Changed</p><br><a href="/"><p style="font-size:20px">Login Now!</p></a>');
            }
           },
           error : function(res) {alert("Error in setting password")}
         })
      },
      error: function (err) {
        alert("Unable to get salt")
      }
    })
  }
}

function doLogin(action) {
  $('#processingModal').modal({
    backdrop: 'static',
    keyboard: false
  })
  document.getElementById("processingMessage").innerHTML = "Logging In";
  $("#processingModal").modal('show');
  try {
    //alert("logging in with " + $(login_username).val() + " and " + $(login_password).val());
    var uid_hash = $('#login_username').val()
    //alert(uid_hash);
    $.ajax({
      type: 'POST',
      url: '/getSaltForUser',
      data: {user: uid_hash},
      success: function (salt) {
       //alert(salt);
       var sha256 = new jsSHA('SHA-256', 'TEXT');
       sha256.update($('#login_password').val() + salt);
       var hash = sha256.getHash("HEX");
       //alert("Hashed val" + hash);
       $.ajax({
         type: 'POST',
         url: '/getsalt',
         success: function (newsalt) {
          //alert(newsalt);
          var sha2562 = new jsSHA('SHA-256', 'TEXT');
          sha2562.update(newsalt + hash);
          var newhash = sha2562.getHash("HEX");
          //alert("New calculated Salt" + newhash);
          $.ajax({
            type: 'POST',
            url: '/plogin',
            data: {attempt: newhash,gensalt: newsalt,user: uid_hash,email: $('#login_username').val()},
            success: function (data) {
             //alert("Performing Login: Result is " + data);
             if (data == "Login Success") {
               if(action == "") {
                 window.location.href = "/home";
               }
             } else {
               $('#processingModal').modal('hide');
               $('#invalid_password').modal('show');
             }
           },
           error: function (err) {
             alert("Unable to login")
           }
         });
        },
        error: function (err) {
          alert("Unable to login")
        }
      });
      },
      error: function (err) {
        alert("Unable to save wishlist")
      }
    })
  }
  catch (e) {alert("Error!!! - "+e)}
}

function logout() {
  $.ajax({
    type : 'GET',
    url :"/logout",
    success : function(res) {window.location.href = "/";},
    error : function(res) {alert("Error logging out")}
  })
}

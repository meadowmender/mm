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
    item.area = $('#area_selection' + i + ' option:selected').val();
    item.lat = $('#gps_lat' + i).val();
    item.long = $('#gps_long' + i).val();
    data_array[i] = item;
  }






  total_loc = parseInt(total_loc) - 1;

  for (var i = 0; i < total_loc;i++) {
      loc += '<table width="100%" id="form-group_prop_addr0"><tr><td width="65%"><div class="form-group" ><label for="address" id="form-group_prop_label' + i + '"><h4 class="heading">Property ' + (i + 1) + '</h4><button type="button" id="removeButton" class="btn btn-default btn-sm" onclick="removeLocation(' + i + ')"><span class="glyphicon glyphicon-remove remove-selector"></span> Remove </button></label><br /><label for="address" style="padding-top:20px">Address:</label></div>' +
      '<textarea class="form-control" rows="4" id="location' + i + '" placeholder="Re-Survey No./Plot Name or Number,&#10;&#13;Landmark, Village/Taluk/Town, &#10;&#13;District, PIN"></textarea>' +
        '</td><td width="10%"></td><td width="25%"><div class="form-group"><label for="area">Area:</label></div><div class="form-group"><select class="form-control" id="area_selection' + i + '">' +
              '<option value="">Select Area</option><option value="1">0.5 Acre - 1 Acre</option><option value="2">1 Acre - 2 Acre</option><option value="3">2 Acre - 4 Acre</option><option value="4"> > 5 Acres </option></select></div></td></tr></table><br /><table width="100%">' +
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
      $('#area_selection' + j + ' option[value="' + data_array[i].area + '"]').prop('selected',true);
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
      '</td><td width="10%"></td><td width="25%"><div class="form-group"><label for="area">Area:</label></div><div class="form-group"><select class="form-control" id="area_selection' + loc_count + '">' +
            '<option value="">Select Area</option><option value="1">0.5 Acre - 1 Acre</option><option value="2">1 Acre - 2 Acre</option><option value="3">2 Acre - 4 Acre</option><option value="4"> > 5 Acres </option></select></div></td></tr></table><br /><table width="100%">' +
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
  $.ajax({
   type  : 'POST',
   url   : '/verifyRecaptcha',
   data  : {"Response":grecaptcha.getResponse()},
   success: function(res) {
     if (res.success) {
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

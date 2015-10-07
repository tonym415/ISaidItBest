/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI'], function($, app){
	app.createNavBar()
	$("input[type=submit]").button();

		/**
	 *  Submits an ajax call to send signup info to the database
	 *  
	 *  @method userSignUp
	 */
	 function submitUserInfo(data){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
			data: data,
			type: "POST",
			url: app.engine 
		})
		.done(function(result){
			if (typeof(result) !== 'object'){
			 	data = JSON.parse(result)[0];
			}

			// internal error handling	
			if (data['error'] !== undefined){
				var validator = $("#signup").validate();
				validator.showErrors({
					"paypal_account": data['error']
				});
			}else{
				app.setCookie('user', data)
				window.location.assign(app.pages.home)
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
		.always(function() { /*console.log('getJSON request ended!');*/ });
	 }
//form validations
	$("input[name='username']").on('blur', function(){
        $('#username_availability_result').empty();  
    });

// check username availability
	$("input[name='username']").on('keyup', function(){
		username = $(this).val()
		minChars = 3
		// if the input is the correct length check for availability
		if (username.length >= minChars){
			$("#username_availability_result").html('Checking availability...')
			data = { "function": "UAC", "username" : username }
			 //use ajax to run the check  
	        // $.getJSON(app.engine, data)
	        $.ajax({
					contentType: "application/x-www-form-urlencoded",
					data: data, 
					type: "POST",
					url: app.engine 
				})
        	.done(function(result){  
            	availability = (result.available == "0") ? " is Available" : " is not Available"
                $('#username_availability_result').html(username + availability);  
            })
            .fail(function(jqXHR, textStatus, error){
            	var err = textStatus + ", " + error;
            	console.log("Response: " + jqXHR.responseText);
            	console.log("Request Failed: " + err);
	        });  
		  
		} 
	});

var valHandler = function(){
	formData = $(this.currentForm).serializeForm() 
	formData['function'] = "SUI"
	submitUserInfo(formData)
}
	
// validate signup form on keyup and submit
	$("#signup").validate({
		debug: true,
		submitHandler: valHandler,
		errorLabelContainer: $("signup_errors"),
		rules: {
			first_name: "required",
			last_name: "required",
			username: {
				required: true,
				minlength: 3
			},
			password: {
				required: true,
				minlength: 5
			},
			confirm_password: {
				required: true,
				minlength: 5,
				equalTo: $("input[name='password'")
			},
			email: {
				required: true,
				email: true
			},
			paypal_account: {
				required: true,
				minlength: 2
			}
		},
		messages: {
			first_name: "Please enter your first name",
			last_name: "Please enter your last name",
			username: {
				required: "Please enter a username",
				minlength: "Your username must consist of at least 3 characters"
			},
			password: {
				required: "Please provide a password",
				minlength: "Your password must be at least 5 characters long"
			},
			confirm_password: {
				required: "Please provide a password",
				minlength: "Your password must be at least 5 characters long",
				equalTo: "Please enter the same password as above"
			},
			email: {
				required: "Please enter a valid email address",
				email: "Your email address must be in the format of name@domain.com"
			}
		}
	});
	$("<p> If you already have and account...<a href='" + app.pages.home + "''>Login!</a></p>").appendTo("center")
});
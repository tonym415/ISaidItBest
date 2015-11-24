
/*
	Handles js interaction for the signup page
 */
require(['jquery','app' ,  'validate','jqueryUI', 'steps'], function($, app){
	// app.init('registration');

	/**
	 *  Submits an ajax call to send signup info to the database
	 *  @method userSignUp
	 */
	 function submitUserInfo(data){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
			desc: "Submit User information for registration",
			data: data,
			type: "POST",
			url: app.engine
		})
		.done(function(result){
			if (typeof(result) !== 'object'){
			 	data = JSON.parse(result)[0];
			}

			// internal error handling
			if (data.error !== undefined){
				var validator = $("#signup").validate();
				validator.showErrors({
					"paypal_account": data.error
				});
			}else{
				app.setCookie('user', data);
				$('.modal-container')
					.tabs({ active: 0}) // show login with username filled in
					.dialog('open');
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
		.always(function() { /*console.log('getJSON request ended!');*/ });
	 }
var valHandler = function(){
	formData = $(this.currentForm).serializeForm();
	formData['function'] = "SUI";
	submitUserInfo(formData);
};

	// wizardify form and set up validation
	$('#signup')
		.steps({
			headerTag: 'h1',
			bodyTag: 'fieldset',
			transitionEffect: 'slideLeft',
			stepsOrientation: 'vertical',
			onStepChanging: function (event, currentIndex, newIndex) {
		        // Always allow going backward even if the current step contains invalid fields!
		        if (currentIndex > newIndex) return true;
		        var form = $(this);

		        // Clean up if user went backward before
		        if (currentIndex < newIndex) {
		            // To remove error styles
		            $(".body:eq(" + newIndex + ") label.error", form).remove();
		            $(".body:eq(" + newIndex + ") .error", form).removeClass("error");
		        }

		        // Disable validation on fields that are disabled or hidden.
		        form.validate().settings.ignore = ":disabled,:hidden";

		        // Start validation; Prevent going forward if false
		        return form.valid();
		    },
		    onStepChanged: function (event, currentIndex, priorIndex) { },
		    onFinishing: function (event, currentIndex) {
		        var form = $(this);

		        // Disable validation on fields that are disabled.
		        // At this point it's recommended to do an overall check (mean ignoring only disabled fields)
		        form.validate().settings.ignore = ":disabled";

		        // Start validation; Prevent form submission if false
		        return form.valid();
		    },
		    onFinished: function (event, currentIndex) {$(this).submit();}
		})
		.validate({
			debug: true,
			submitHandler: valHandler,
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
					equalTo: $("#signup #password")
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

	//clear availibility validations
	$("#signup #username").on('blur', function(){
        $('#username_availability_result').empty();
    });

	// check username availability
	$("#signup #username").on('keyup', function(){
		username = $(this).val();
		minChars = 3;
		// if the input is the correct length check for availability
		if (username.length >= minChars){
			$("#username_availability_result").html('Checking availability...');
			data = { "function": "UAC", "username" : username };
			 //use ajax to run the check
	        $.ajax({
					contentType: "application/x-www-form-urlencoded",
					desc: "UserName availability",
					data: data,
					type: "POST",
					url: app.engine
				})
        	.done(function(result){
            	availability = (result.available == "0") ? " is Available" : " is not Available";
                $('#username_availability_result').html(username + availability);
            })
            .fail(function(jqXHR, textStatus, error){
            	var err = textStatus + ", " + error;
            	console.log("Response: " + jqXHR.responseText);
            	console.log("Request Failed: " + err);
	        });

		}
	});

});

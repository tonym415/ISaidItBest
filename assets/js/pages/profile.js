/*
	Handles js interaction for the signup page
 */
require(['jquery','app',  'validate','jqueryUI', 'steps'], function($, app){
	// page set up
	app.init('profile');

	disabled_fields = ['username', 'created'];
	$.each(disabled_fields, function(idx, value){
		$("input[name='" + value + "']").attr("disabled", true);
	});


	var dialog = $('#paypal_transaction').dialog({
		autoOpen: false,
		modal: true
	});



	function updateUserInfo(data){
		console.log(data)
	}

	var valHandler = function(){
		formData = $(this.currentForm).serializeForm();
		formData['function'] = "UUI";
		updateUserInfo(formData);
	}

// validate signup form on keyup and submit
	$("form").steps({
		headerTag: 'h1',
		bodyTag: 'fieldset',
		transitionEffect: 'slideLeft',
		stepsOrientation: 'vertical',
		onStepChanging: function (event, currentIndex, newIndex) {
	        // Always allow going backward even if the current step contains invalid fields!
	        if (currentIndex > newIndex)
	        {
	            return true;
	        }

	        var form = $(this);

	        // Clean up if user went backward before
	        if (currentIndex < newIndex)
	        {
	            // To remove error styles
	            $(".body:eq(" + newIndex + ") label.error", form).remove();
	            $(".body:eq(" + newIndex + ") .error", form).removeClass("error");
	        }

	        // if (newIndex == 2) { Avatar.init(); return true; }

	        // bypass validation (DEBUG)
			return true;

	        // Disable validation on fields that are disabled or hidden.
	        form.validate().settings.ignore = ":disabled,:hidden";

	        // Start validation; Prevent going forward if false
	        return form.valid();
	    },
	    onStepChanged: function (event, currentIndex, priorIndex) { },
	    onFinishing: function (event, currentIndex)
	    {
	        var form = $(this);

	        // Disable validation on fields that are disabled.
	        // At this point it's recommended to do an overall check (mean ignoring only disabled fields)
	        form.validate().settings.ignore = ":disabled";

	        // Start validation; Prevent form submission if false
	        return form.valid();
	    },
	    onFinished: function (event, currentIndex) {
		        var form = $(this);

		        // Submit form input
		        form.submit();
		    }
	 }).validate({
		debug: true,
		submitHandler: valHandler,
		errorLabelContainer: $("profile_errors"),
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
				equalTo: $("input[name='password']")
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

// ...more page set up
// load form
	data = app.getCookie("user");
	if (data !== undefined){
		$.each(data, function(key, value){
			element = $("input[name='" + key + "']");
			if (element.length > 0){ element.val(value); }
		});
	}

	current_theme = (app.getTheme() === undefined) ? app.defaultTheme : app.getTheme();
	var selector = "#themes option[value='" + current_theme + "']";
	if (current_theme !== undefined) {  $(selector).prop('selected', true);}

	$('#themes').selectmenu({
		width: 200,
		change: function(){
			app.setTheme($(this).val());
		}
	});

// paypal handler
	$('body').on('click', 'input[name=submit_paypal]', function(event){
		event.preventDefault();

		data = $('.paypal').serializeForm();
		$.ajax({
			contentType: "application/x-www-form-urlencoded",
			desc: "Paypal Request",
			data: data,
			type: "POST",
			"Access-Control-Allow-Origin" :"https://www.paypal.com/cgi-bin/webscr",
			"Access-Control-Allow-Methods" : "GET,POST",
			"Access-Control-Allow-Headers" : "Content-Type",
			url: "https://www.paypal.com/cgi-bin/webscr",
		});
		console.log(data);
	});
	// run avatar setup
	require(['avatar']);
});

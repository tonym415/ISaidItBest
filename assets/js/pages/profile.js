/*
	Handles js interaction for the signup page
 */
require([
	'jquery',
	'app',
	'validate',
	'jqueryUI',
	'steps',
	'additional_methods',
	'upload'
	], function($, app){
	// page set up
	app.init('profile');

	disabled_fields = ['username', 'created'];
	$.each(disabled_fields, function(idx, value){
		$("input[name='" + value + "']").attr("disabled", true);
	});

	$('#uploader').fileupload();

	function updateUserInfo(data){
		app.dMessage('Data', data);
		console.log(data);
		$.ajax({
			url: app.engine,
			data: data,
			type: 'POST',
			dataType: 'json',
			desc: 'Update Profile',
			success: function(data){
				app.dMessage('data', data);
			}
		});

	}

	var valHandler = function(){
		formData = $(this.currentForm).serializeForm();
		formData['function'] = "UUI";
		updateUserInfo(formData);

		// upload avatar
		if ($('#uploader').val() !== ""){
			filesList = $('#uploader')[0].files;

			$('#uploader').fileupload({
				dataType: 'json',
				url: app.engine + "?function=PU",
				function: 'Avatar Upload',
				done: function(e, data){
					$.each(data.result, function(index, file){
						$('<p/>').text(file.name).appendTo('#uploader');
					});
				}
			});

			$('#uploader').fileupload('add', {files: filesList});
		}
	};



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
			// return true;

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
		submitHandler: valHandler,
		rules: {
			first_name: "required",
			last_name: "required",
			username: {
				required: true,
				minlength: 3
			},
			origpassword: {
				minlength: 5,
				required: {
					depends: function(element){
						return $('#togPass').is(':checked');
					}
				}
			},
			newpassword: {
				minlength: 5,
				required: {
					depends: function(element){
						return $('#togPass').is(':checked');
					}
				}
			},
			confirmpassword: {
				minlength: 5,
				required:{
					depends: function(element){
						value = ($(element).val() == $('#newpassword').val());
						togged = $('#togPass').is(':checked');
						return togged && value;
					}
				}
			},
			email: {
				required: true,
				email: true
			},
			paypal_account: {
				required: true,
				minlength: 2
			},
			uploader: {
				accept: "image/*",
				required: {
					depends: function(element){
						return ($(element).val() !== "");
					}
				}
			}
		},
		messages: {
			first_name: "Please enter your first name",
			last_name: "Please enter your last name",
			username: {
				required: "Please enter a username",
				minlength: "Your username must consist of at least 3 characters"
			},
			origpassword: {
				required: "Please provide the original password",
				minlength: "Your password must be at least 5 characters long"
			},
			newpassword: {
				required: "Please provide new password",
				minlength: "Your password must be at least 5 characters long"
			},
			confirmpassword: {
				required: "Please confirm new password",
				minlength: "Your password must be at least 5 characters long",
				equalTo: "Please enter the same password as above"
			},
			email: {
				required: "Please enter a valid email address",
				email: "Your email address must be in the format of name@domain.com"
			},
			uploader: {
				accept: "You tried to upload an invalid file type"
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

	$('#togPass').on('change', function(){
		$(this).parent().parent().siblings().slideToggle('slow');
	}).parent().parent().siblings().hide();

	// run avatar setup
	require(['avatar']);
});

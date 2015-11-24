/*
	Handles js interaction for the signup page
 */
require([
	'jquery',
	'app',
	// 'avatar',
	'validate',
	'jqueryUI',
	'steps',
	'additional_methods',
	// 'upload',
	'fileInput',
	'bootstrap'
	], function($, app, Avatar){
	// page set up
	app.init('profile');
	var user = app.getCookie('user');


	disabled_fields = ['username', 'created'];
	$.each(disabled_fields, function(idx, value){
		$("input[name='" + value + "']").attr("disabled", true);
	});

	function updateUserInfo(data){
		$.ajax({
			url: app.engine,
			data: data,
			type: 'POST',
			dataType: 'json',
			desc: 'Update Profile',
			success: function(data){
				if (data.data === "Success")
				app.dMessage(data.data, "Profile successfully saved!");
			}
		});
	}

	function getProfileData(){
		formData = $('form').serializeForm();
		// filesList = ($('#avatar').val() !== "") ? $('#avatar')[0].files : null;
		// formData.file = filesList;
		formData.function = "UP";
		formData.user_id = user.user_id;

		// sanitize data
		if (formData.origpassword === "" && formData.newpassword === "" && formData.confirmpassword === ""){
			delete formData.origpassword;
			delete formData.newpassword;
			delete formData.confirmpassword;
		}
		return formData;
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
	    onFinished: function (event, currentIndex) {
		        var form = $(this);

		        // Submit form input
		        form.submit();
		    }
	 }).validate({
		submitHandler: function(){
			// if avatar chosen...
			uLoad = $('.file-input-ajax-new').val();
			if (uLoad === undefined){
				// upload form avatar...
				$('#avatar').fileinput('upload');
			}else{
				// manually upload form
				updateUserInfo(getProfileData());
			}
		},
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

	$('#uploader')
		.on('fileuploaderror', function(event, data, previewId, index) {
			var form = data.form, files = data.files, extra = data.extra,
			    response = data.response, reader = data.reader;
				app.dMessage("Error", response);
		})
		.on('fileuploaded', function(event, data, previewId, index) {
		   var form = data.form, files = data.files, extra = data.extra,
		    response = data.response, reader = data.reader;
		    app.dMessage("Success", extra.bdInteli + " " +  response.uploaded);
		});
// ...more page set up
// load form
	(function(){
		fdata = {'function': 'GUP', 'id':'getUser', 'user_id': user.user_id };
		$.ajax({
			url: app.engine,
			data: fdata,
		 	type: 'POST',
			success: function(result){
				if (result.data !== undefined){
					avInit = false;
					$.each(result.data, function(key, value){
						// element = $("input[name='" + key + "']");
						if (key === 'avatar'){
							initAvatar();
						}else{
							element = $("#" + key);
							if (element.length > 0){ element.val(value); }
						}
					});
					if (!avInit) initAvatar();

					// handle rating indicator
					wins = result.data.wins;
					losses = result.data.losses;
					app.showSkills(wins, losses);

				}
			}
		});
	})();

	function initAvatar(){
		avInit = true;
		$('#avatar').fileinput({
			showPreview: true,
			uploadAsync: true,
			uploadUrl: app.engine,
			uploadExtraData: getProfileData,
			overwriteInitial: true,
			maxFileSize: 1500,
			showClose: false,
			showCaption: false,
			browseLabel: ' ',
			removeLabel: ' ',
			browseIcon: '<i class="glyphicon glyphicon-folder-open"></i>',
			removeIcon: '<i class="glyphicon glyphicon-remove"></i>',
			removeTitle: 'Cancel or reset changes',
			elErrorContainer: '#kv-avatar-errors',
			msgErrorClass: 'alert alert-block alert-danger',
			defaultPreviewContent: '<img src="' + app.getAvatar() + '" alt="Your Avatar" class="avatar">',
			layoutTemplates: {main2: '{preview}  {remove} {browse}'},
			allowedFileExtensions: ["jpg", "png", "gif"]
		});
	}

	current_theme = (app.getTheme() === undefined) ? app.defaultTheme : app.getTheme();
	var selector = "#theme option[value='" + current_theme + "']";
	if (current_theme !== undefined) {  $(selector).prop('selected', true);}

	$('#theme').selectmenu({
		width: 200,
		change: function(){
			app.setTheme($(this).val());
		}
	});

	$('#togPass').on('change', function(){
		$(this).parent().parent().siblings().slideToggle('slow');
	}).parent().parent().siblings().hide();

});

/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI'], function($, app){
	app.init('contact');

	/**
	 *  Submits an ajax call to send signup info to the database
	 *
	 *  @method userSignUp
	 */
	 function submitUserInfo(data){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
			desc: "Submit User request for contact",
			data: data,
			type: "POST",
			url: app.engine
		})
		.done(function(data){
			if (typeof(data) !== 'object'){
			 	data = JSON.parse(result)[0];
			}

			// internal error handling
			if (data.error !== undefined){
				var validator = $("#contact").validate();
				validator.showErrors({
					"message": data.error
				});
			}else{
				app.dMessage(data.message.title, data.message.message);
			}
		});
	 }


var valHandler = function(){
	formData = $(this.currentForm).serializeForm();
	formData['function'] = "CU";
	submitUserInfo(formData);
};

// validate signup form on keyup and submit
	$("#contact").validate({
		debug: true,
		submitHandler: valHandler,
		rules: {
			name: "required",
			email: {
				required: true,
				email: true
			},
			message: {
				required: true,
				minlength: 2
			}
		},
		messages: {
			name: "Please enter your name",
			message: "Please enter your message",
			email: {
				required: "Please enter a valid email address",
				email: "Your email address must be in the format of name@domain.com"
			}
		}
	});
});

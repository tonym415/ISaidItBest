/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI'], function($, app){
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
				 	data = JSON.parse(result)[0];
					if (data[value] === undefined){
						console.log(data)
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
				.always(function() { /*console.log('getJSON request ended!');*/ });
	 }
//form validations
// validate signup form on keyup and submit
		$("#signup").validate({
			debug: true,
			submitHandler: function() {
				formData = $(this.currentForm).serializeForm() 
				console.log(JSON.stringify(formData))
				formData['function'] = "SUI"
				console.log(JSON.stringify(formData))
				submitUserInfo(formData)
	        },
			errorLabelContainer: $("signup_errors"),
			rules: {
				name: "required",
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
				name: "Please enter your name",
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
				email: "Please enter a valid email address",
			}
		});
});
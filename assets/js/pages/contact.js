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
				window.location.assign(app.pages.Home)
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
		.always(function() { /*console.log('getJSON request ended!');*/ });
	 }


var valHandler = function(){
	formData = $(this.currentForm).serializeForm() 
	formData['function'] = "CU"
	submitUserInfo(formData)
}
	
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
	$("<p> If you already have and account...<a href='" + app.pages.Home + "''>Login!</a></p>").appendTo("center")
});
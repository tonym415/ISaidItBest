/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI'], function($, app){
	app.createNavBar()
	$("input[type=submit]").button();

	$( "[id$=tabs]" ).tabs()//.addClass( "ui-tabs-vertical ui-helper-clearfix" );
	$( "[id$=Accordion]" ).accordion({
		animate: "easeInOutQuint",
		heightStyle: 'content',
		collapsible: true,
		active: false
	});
	//.addClass( "ui-tabs-vertical ui-helper-clearfix" );
    // $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

// var valHandler = function(){
// 	formData = $(this.currentForm).serializeForm() 
// 	formData['function'] = "SUI"
// 	submitUserInfo(formData)
// }
	
// // validate signup form on keyup and submit
// 	$("form").validate({
// 		debug: true,
// 		submitHandler: valHandler,
// 		errorLabelContainer: $("signup_errors"),
// 		rules: {
// 			first_name: "required",
// 			last_name: "required",
// 			username: {
// 				required: true,
// 				minlength: 3
// 			},
// 			password: {
// 				required: true,
// 				minlength: 5
// 			},
// 			confirm_password: {
// 				required: true,
// 				minlength: 5,
// 				equalTo: $("input[name='password'")
// 			},
// 			email: {
// 				required: true,
// 				email: true
// 			},
// 			paypal_account: {
// 				required: true,
// 				minlength: 2
// 			}
// 		},
// 		messages: {
// 			first_name: "Please enter your first name",
// 			last_name: "Please enter your last name",
// 			username: {
// 				required: "Please enter a username",
// 				minlength: "Your username must consist of at least 3 characters"
// 			},
// 			password: {
// 				required: "Please provide a password",
// 				minlength: "Your password must be at least 5 characters long"
// 			},
// 			confirm_password: {
// 				required: "Please provide a password",
// 				minlength: "Your password must be at least 5 characters long",
// 				equalTo: "Please enter the same password as above"
// 			},
// 			email: {
// 				required: "Please enter a valid email address",
// 				email: "Your email address must be in the format of name@domain.com"
// 			}
// 		}
// 	});
	// $("<p> If you already have and account...<a href='" + app.pages.Home + "''>Login!</a></p>").appendTo("center")
});
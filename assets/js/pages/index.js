/*
	Handles js interaction for the login page
 */
define(['jquery', 'validate', 'app', 'jqueryUI'], function($, validate, app){
	$("input[type=submit]").button();
//form validations
	var container = $("#errors")
	$("#login").validate({
		dubug: true,
		submitHandler: function(form){
			user = $("#username").val()
			pass = $("#password").val()
			if (user == "user" && pass == "password"){
				window.location.assign("game.html")
			}
		},
		errorContainer: container,
		errorLabelContainer: $("ol", container ),
		wrapper: "li",
		messages: {
			user: {
				required: " (required)",
				minlength: " (must be at least 3 characters)"
			},
			password: {
				required: " (required)",
				minlength: " (must be between 5 and 12 characters)",
				maxlength: " (must be between 5 and 12 characters)"
			}
		}
	});
});
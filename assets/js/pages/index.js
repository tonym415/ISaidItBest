/*
	Handles js interaction for the login page
 */
define(['jquery', 'validate', 'app', 'jqueryUI', 'cookie'], function($, validate, app){
	$("input[type=submit]").button();
	app.createNavBar();
	var user = app.getCookie('user');
	if (user !== undefined){
		// if same session USERNAME should be set
		name = user.USERNAME;
		if (name === 'undefined') {
			// if coming from registration page
			name = user.username;
			$("#password").val(user.password);
		}
		$("#username").val(name);
	}

	var valHandler = function(){
		user = $("#username").val();
		pass = $("#password").val();
		data = {'function': 'VU', 'username': user, 'password': pass};

		// validate user
		$.ajax({
			contentType: "application/x-www-form-urlencoded",
			data: data,
			type: "POST",
			url: app.engine
		})
		.done(function(result){
			if (app.isEmpty(result)){
				var validator = $("#login").validate();
				validator.showErrors({
					"username": "Invalid User/Password combination<br /> Try <a href='" + app.pages.registration + "'>creating a user</a>"
				});
			}else{
				// create cookie using user info
				// console.log(result)
				app.setCookie('user', result);
				window.location.assign(app.pages.game);
			}
        })
        .fail(function(jqXHR, textStatus, error){
        	var err = textStatus + ", " + error;
        	console.log("Response: " + jqXHR.responseText);
        	console.log("Request Failed: " + err);
        });
	};

//form validations
	$("#login").validate({
		dubug: true,
		submitHandler: valHandler,
		rules: {
			username: {
				required: true,
				minlength: 3
			},
			password: {
				required: true,
				minlength: 5,
				maxlength: 12
			}
		},
		messages: {
			username: {
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
	$("<p> If you are not already a member...<a href='" + app.pages.registration + "''>Sign up!</a></p>").appendTo("center");
});

/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI', 'steps'], function($, app){
	var showLogin = app.init('home');
	// TODO: add fuctionality for lost password form
	$(".modal-container")
		.tabs({
			beforeActivate: function(event, ui){
				// if going from reset password to signup...
				if (ui.newPanel[0].id === 'signup-tab'){
					// reset signup tab to prevent...weirdness
					if ($('#reset-tab').is(':visible')) toggleSignIn();
				}
			}
		})
		.dialog({
			// resizable: false,
			autoResize: true,
			autoOpen: false,
			minHeight: "auto",
			closeOnEscape: true,
			dialogClass: 'no-close',
			modal: true,
			width: 'auto',
			height: 'auto',
			buttons: {
				Close: function () {
					$(this).dialog("close");
				}
			}
		});

	$('.main-nav').on('click',function(event){
		signup = $(event.target).is('.cd-signup');
		if (signup) app.agreement();

		signin = $(event.target).is('.cd-signin');
		if (signup || signin){
			index = (signup) ? 1 : 0;
			$('.modal-container')
				.tabs({ active: index })
				.dialog('open')
				.siblings('div.ui-dialog-titlebar').remove();
		}
	});

	// if players is redirected to this page make them login
	if (showLogin){
		$('.modal-container')
			.tabs({ active: 0 })
			.dialog('open')
			.siblings('div.ui-dialog-titlebar').remove();
	}

	$('.cd-form-bottom-message').click(toggleSignIn);

	function toggleSignIn(){ $("#login-tab, #reset-tab").toggle(); }





	/* Facebook code */




	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=1518603065100165";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));





	// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '1518603065100165',
    cookie     : true,  // enable cookies to allow the server to access the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' // use version 2.2
  });

  // Now that we've initialized the JavaScript SDK, we call
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

 
  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
  }
});

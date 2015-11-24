/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI', 'steps'], function($, app){
	app.init('home');

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
			resizable: false,
			autoOpen: false,
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
		signin = $(event.target).is('.cd-signin');
		if (signup || signin){
			index = (signup) ? 1 : 0;
			$('.modal-container')
				.tabs({ active: index })
				.dialog('open')
				.siblings('div.ui-dialog-titlebar').remove();
		}
	});

	$('.cd-form-bottom-message').click(toggleSignIn);

	function toggleSignIn(){ $("#login-tab, #reset-tab").toggle();}
});

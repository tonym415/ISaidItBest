/*
	Handles js interaction for the signup page
 */
require(['jquery','app' , 'validate','jqueryUI', 'steps'], function($, app){
	app.createLoginNavBar()
	$("input[type=submit]").button();

	$("#reset-tab").toggle()
	$(".modal-container").tabs().dialog({
		appendTo: "body",
		modal: true,
		width: 750,
		height: 550
	});

	$('.main-nav').on('click',function(event){
		index = ($(event.target).is('.cd-signup')) ? 1 : 0;
		$('.modal-container').tabs({ active: index });
	});
	// $("a[href='#login-tab'], a[href='#signup-tab']").click(function(event){
	// 	event.preventDefault();
	// 	var index = $('.modal-container ul').index($(this));

	// })

	$("#signup").steps({
		headerTag: 'h1',
		bodyTag: 'fieldset',
		transitionEffect: 'slideLeft',
		stepsOrientation: 'vertical'
	})	
});
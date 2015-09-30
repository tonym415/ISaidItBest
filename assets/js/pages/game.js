/**
 *  Handles all functions for the game page
 *  @module  
 */
require([
	'jquery',
	'app',
	'flipclock',
	'validate',
	'jqueryUI'
	], function($, app){
		$("#accordion").accordion({ heightStyle: 'content', collapsable: true});

		$("input[type=button]").button();	

		$(".sel").selectmenu({ 
			width: 200
		});

		$("#subCategory").selectmenu({ 
			disabled: true
		});

		

	/**
	 * Category selection box
	 */
	$(".category").selectmenu({ 
		/**
		 * Handles load of the subcategory select box
		 */
		change: function(){
			value = $(this).val().capitlize();
			$("#subCategory")
				.selectmenu("enable")
				.empty()

				$.ajax({
					contentType: "application/x-www-form-urlencoded",
					data: {"function": "LCQ", "category" : value},
					type: "POST",
					url: app.engine 
				})
				.done(function(result){
				 	data = JSON.parse(result)[0];
					if (data[value] === undefined){
						$("#subCategory")
							.empty()
							.append(new Option("None", "---"))
							.selectmenu("disable")
					}else{
						$.each(data[value], function(val, text){
							$("#subCategory").append(new Option(text, val))
							$("#subCategory").selectmenu("refresh")
						})
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
				.always(function() { /*console.log('getJSON request ended!');*/ });
		}
	});

	/**
	 * Clock instantiation
	 * @type {FlipClock}
	 */
		clock = $('.countdown_timer').FlipClock({
			autoStart: false,
			countdown: true,
			clockFace: 'MinuteCounter'
		});

	/**
	 * Set click event to parameter selection button
	 */
	$('#btn_submitParameters').click(function(){
		app.loadDebate(app.submitParameters());
	});
});
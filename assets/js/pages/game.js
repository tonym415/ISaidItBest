/**
 *  Handles all functions for the game page
 *  @module  
 */
require([
	'jquery',
	'app',
	'flipclock',
	'validate',
	'jqueryUI',
	'cookie'
	], function($, app){
		// handle url spoofing
		if (document.referrer.indexOf(app.pages.Home) < 0){
			if (document.referrer.indexOf(document.location.pathname) < 0){
				window.location.assign(app.pages.Home)
			}
		}

		// handle page setup upon arrival
		app.createNavBar()
		$.cookie.json = true
		info = $.cookie('user')
		userSpan = "<div>Welcome, " + info.USERNAME + "</div>"
		wins = "<br /><img src='../assets/css/images/checked.gif' width='16px' height='16px'/>   Wins: " + info.WINS + "<br />"
		$("#userInfo").append(userSpan)
		$(wins).appendTo("#userInfo div")
		

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
				.done(function(data){
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
				.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + jqXHR.responseText); })
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
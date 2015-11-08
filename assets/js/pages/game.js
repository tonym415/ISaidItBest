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
	'livequery',
	'cookie',
	'tooltipster'
	], function($, app){
		// game parameters global var
		var params,
			pollCounter = 0;

		// handle page setup upon arrival
		app.init('game');

	/**
	 * Clock instantiation
	 * @type {FlipClock}
	 */
		clock = $('.countdown_timer').FlipClock({
			autoStart: false,
			countdown: true,
			clockFace: 'MinuteCounter'
		});

	(function loadMeta(){
		$.ajax({
			data: {'function': "GMD", 'id': 'getMetaData'},
			url: app.engine,
			type: 'POST',
			dataType: 'json',
			desc: 'utility (load metadata)',
			success: function(data){
				$('#wager')
					.empty()
					.append(new Option("None", ""));
				// load question selectmenu
				$.each(data.wagers, function(){
					$('#wager')
						.append($('<option />')
						.val(this.credit_id)
						.text(this.credit_value + ' credit(s)'))
						.val("")
						.selectmenu('refresh');
				});
				$('#timeLimit')
					.empty()
					.append(new Option("None", ""));
				// load question selectmenu
				$.each(data.times, function(){
					$('#timeLimit')
						.append($('<option />')
						.val(this.time_id)
						.text(this.time_in_seconds.toString().toMMSS()))
						.val("")
						.selectmenu('refresh');
				});
			}
		});
	})();

	// get players and start game
	function getGame(){
		params.function = 'GG';
		$.ajax({
			data: params,
			url: app.engine,
			type: 'POST',
			dataType: 'json',
			desc: 'Game Creation',
			success: function(data){
				if (data.status !== 'complete'){
					if (pollCounter < 15){
						pollCounter++;
						setTimeout(getGame(), 15000);
					}else{
						pollCounter = 0;
					}
				}else{
					// update game ui
					console.log(pollCounter);
					console.log(data);
				}
			}
		});
	}

	// set up parameter form validation
	$('#gameParameters').validate({
		submitHandler: function(){
			vals = $(this.currentForm).serializeForm();
			info = app.getCookie('user');
			vals.user_id = info.user_id;
			vals.function = 'SGP';
			params = vals;
			$.post(app.engine, vals);
			app.dMessage('Params', app.prettyPrint(params));
			getGame();
		},
		rules: {
			p_paramCategory: { selectNotEqual: "" },
			paramQuestions: { selectNotEqual: "" },
			timeLimit: { selectNotEqual: "" },
			wager: { selectNotEqual: "" }
		},
		messages: {
			p_paramCategory: "You must choose a category",
			paramQuestions: "You must choose a question",
			timeLimit: 'You must choose a time limit',
			wager: 'You must choose a wager'
		}
	});

	// load question box with values based on category/subcategory
	function primeQBox(catID){
		// destination selectmenu
		q_select = '#paramQuestions';
		// reset questions list
		$(q_select)
			.empty()
			.selectmenu('destroy')
			.selectmenu({width: 200, style: 'dropdown'})
			.append(new Option("None", ""));

		// retrieve and load questions for selected id
		app.getCatQuestions(catID, q_select);
	}

	// set a watch for additions/removal on the dom for select boxes (not including template)
	$("select[id*=Category]:not([id*=temp])")
		.livequery(function(){
			id = $(this).prop('id');
			// add validation
			$(this).closest('form').validate();
			$(this).rules("add", {
				selectNotEqual : "",
				messages: {
					id : "Please choose a subcategory"
				}
			});

			// initialize selectmenu
			$(this).selectmenu({
				width: 200,
				change: function(){
					// load appropriate questions for selection
					primeQBox($(this).val());

					// validate select
					$(this).closest('form').validate().element(this);
					//  bind change event to all select menus to enable subcategory menu selection
					boolSubs = $(this).siblings('input').prop("checked");

					// get clones if present
					clones = $(this).parent().siblings('.clone');
					hasClones = clones.length > 0;
					// remove clones
					if (hasClones){
						// kill all clones below current check
						$.each(clones, function(){
							$(this).remove();
						});
					}

					// if sub-categories are requested
					if (boolSubs) app.subCheck($(this));

				}
			});
		});

	// set watch for additions/removal on the dom for checkboxes (not including template)
	$("input[id*=CategoryChk]:not([id*=temp])")
		.livequery(function(){
			$(this)
				.change(function(event){
					event.stopPropagation();
					if($(this).is(':checked')){
						var select = $(this).siblings('select');
						app.subCheck(select);
					}else{
						// load appropriate questions for selection
						primeQBox("#" + $(this).siblings('select').prop('id'));

						// get all p tags that are not the original and do not contain the submit button
						cloneP = $(this).parent().siblings('.clone');
						// kill all clones below current check
						$.each(cloneP, function(){
							$(this).remove();
						});
					}
				}
			);
		});
});

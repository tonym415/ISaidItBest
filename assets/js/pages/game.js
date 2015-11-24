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
	'tooltipster',
	'blockUI'
	], function($, app){
		// game parameters global var
		var user,
			timeout,
			params,
			paramMeta = {},
			pollCounter = 0;

		// handle page setup upon arrival
		app.init('game');
		user = app.getCookie('user');

	function enrichMeta(){
		// created inbuilt search function
		paramMeta.getTimeById = function(id){
			var retVal = -1;
		    var self = this;
			var property = 'time_id';
		    for(var index=0; index < self.times.length; index++){
		        var item = self.times[index];
		        if (item.hasOwnProperty(property)) {
		            if (item[property] === parseInt(id)) {
		                retVal = item.time_in_seconds;
		                return retVal;
		            }
		        }
		    }
		    return retVal;
		};
	}

	(function loadMeta(){
		$.ajax({
			data: {'function': "GMD", 'id': 'getMetaData'},
			url: app.engine,
			type: 'POST',
			dataType: 'json',
			desc: 'utility (load metadata)',
			success: function(data){
				paramMeta = data;
				// call enhancing function
				enrichMeta();
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
		// create ajax poll
		game = function(){
			$.ajax({
				data: params,
				url: app.engine,
				type: 'POST',
				dataType: 'json',
				desc: 'Game Creation',
				global: false,
				success: function(data){
					if (pollCounter <= 4){
						pollCounter++;
						params.counter = pollCounter;
						if (data.status === 'pending'){
							getGame();
						}else if(data.status === 'complete'){
							// update game ui
							clearTimeout(timeout);
							$('#game_id').val(data.game_id);
							loadDebate();
						}else if(data.queue){
							// set the created queue_id to params
							params.queue_id = data.queue.queue_id;
							$('#cancelSearch h1').html('Searching for a game...');
							getGame();
						}
					}else{
						$('#game').unblock();
						pollCounter = 0;
						app.dMessage('Data', data);
					}
				}
			});
		};
		// if this is the first time called immediately excute ajax
		if (params.counter === 0){
			$('#cancelSearch h1').html('Submitting your parameters...');
			$('#game').block({message: $('#cancelSearch'), css:{ width: '275px'}});
			game();
		} else {
			// if polling
			timeout = setTimeout(game, 5000);
		}
	}


	// set up parameter form validation
	$('#gameParameters').validate({
		submitHandler: function(){
			params = $(this.currentForm).serializeForm();
			params.user_id = user.user_id;
			params.function = 'GG';
			params.counter = pollCounter;
			openAccordionPanel('next');
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

	function submitGame(){
		data.function = 'SUG';
		app.dMessage('Submitting Game', data);
		$.ajax({
			url: app.engine,
			data: data,
			type: 'POST',
			dataType: 'json',
			desc: 'Game Submission',
			success: function(data){
				if (!data.error){
					// build vote form
					$.each(data.users, function(){
						if ($(this).user_id === user.user_id){
							// append input control at start of form
							 $("<input type='radio' />")
								.attr("id", "commentRdo")
								.attr("name", "commentRdo")
								.val($(this).username)
								.prependTo("#debateVote");
						}
					});

					// show vote/hide game
					toggleGame();
				}else{
					app.dMessage(data.error, data.stm);
				}
			}
		});
	}

	function toggleGame(){
		$('#debate, #debateResults').toggle();
	}

	/**
	 * Game Clock instantiation
	 * @type {FlipClock}
	 */
		gameClock = $('#game_timer').FlipClock({
			autoStart: false,
			countdown: true,
			clockFace: 'MinuteCounter',
			stop: function(){
				data = $('#gameUI').serializeForm();
				data.user_id = user.user_id;
				submitGame(data);
			}
		});
	/**
	 *  Wait Clock instantiation
	 * @type {FlipClock}
	 */
		waitClock = $('#wait_timer').FlipClock(10,{
			autoStart: false,
			countdown: true,
			clockFace: 'MinuteCounter',
			stop: function(){
				$.unblockUI();
				gameClock.start();
			}
		});

	function loadDebate(){
		$('#game').unblock();
		// // show timer
		// $(".countdown_timer").show();

		//set game criteria
		var q_text = $('#paramQuestions :selected').text();
		q_text += "\n (Wager: " + $('#wager :selected').text() + ")";
		$("#question").html(q_text).wrap('<pre />');

		// set clock based on time limit parameter
		min = paramMeta.getTimeById($('#timeLimit').val());
		gameClock.setTime(min);
		$.blockUI({message: $('#gameWait'), css:{ width: '305px'}});
		waitClock.start();
	}

	$('#cancel').click(function(){
		$('#game').unblock();
		openAccordionPanel('last');
		params.function = 'CG';
		params.id = 'cancelGame';
		$.ajax({
			url: app.engine,
			data: params,
			type: 'POST',
			dataType: 'json',
			desc: 'Game Cancellation',
			success: function(data){
				// cancel poll
				clearTimeout(timeout);
				if (data.error === undefined){
					func = function(){
						params.counter = pollCounter = 0;
						$(this).dialog('close');
					};
					msgOpt = {
						buttons: {
							Yes: function(){
								getGame();
								func();
							},
							No: func
						}
					};
					app.dMessage(
						"Alert",
						'Cancellation Confirmed<p>Retry?</p>',
						msgOpt
					);
				}else{
					app.dMessage(data.error, data.stm);
				}
			}
		});
	});

	function openAccordionPanel(position) {
	    var current = app.accordion.accordion("option","active");
	        maximum = app.accordion.find("h3").length;
		if (position === 'next'){
	        position = current+1 === maximum ? 0 : current+1;
		}else{
	        position = current-1 < 0 ? 0 : current-1;
		}
	    app.accordion.accordion("option","active",position);
	}

	$('#debateVote').validate({
		submitHandler: function(){
			data = $(this.currentForm).serializeForm();
			app.dMessage('Data', data);
		},
		rules: {
			commentRdo: 'required'
		},
		messages: {
			commentRdo: "You must vote for a comment"
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

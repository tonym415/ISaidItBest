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
			timeLeft = 0,
			params,
			divVotePrefix = 'comment_',
			onStateClass = "ui-state-highlight",
			offStateClass = "ui-widget-content",
			disableStateClass = "ui-state-disabled",
			gameSubmitted = false,
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
							$.each(data.users, function(){
								$('<div />')
									.attr({ id: this.username })
									.appendTo('#players');
								$('<img  />')
									.attr({
										class: 'avatar',
										src: app.getAvatar(this.avatar),
										title: this.username
									})
									.appendTo('#' + this.username);
								$('<br />').appendTo('#players');
							});
							loadDebate();
						}else if(data.queue){
							// set the created queue_id to params
							params.queue_id = data.queue.queue_id;
							matchText = 'Please stay with us while Isaiditbest finds you the best match up...';
							$('#cancelSearch h1').html(matchText);
							getGame();
						}
					}else{
						$('#game_panel').unblock();
						clearTimeout(timeout);
						pollCounter = 0;
						app.dMessage(
							"Alert",
							'<h2>Game Not Found</h2><p>Retry?</p>',
							{
								buttons: {
									Yes: function(){
										$('#game_panel').block({
											message: $('#cancelSearch'),
											css:{ width: '275px'}
										});
										getGame();
										$(this).dialog('close');
									},
									No: function(){
										cancelGame();
										// enable/disable appropriate panels
										toggleParams();
										// go back to parameters
										openAccordionPanel('last');
										$(this).dialog('close');
									}
								}
							}
						);
					}
				}
			});
		};
		// if this is the first time called immediately excute ajax
		if (params.counter === 0){
			$('#cancelSearch h1').html('Submitting your parameters...');

			// enable/disable appropriate panels
			toggleParams();

			openAccordionPanel('next');
			$('#game_panel').block({message: $('#cancelSearch'), css:{ width: '275px'}});
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
	// validation for debate game ui
	$('#gameUI').validate({
		submitHandler: function(){
			data = $(this.currentForm).serializeForm();
			data.user_id = user.user_id;
			submitGame(data);
			// get the time left on the clock to know
			// how long to wait for other users
			timeLeft = gameClock.getTime().time;
			gameClock.stop();
		}
	});

	function submitGame(data){
		gameSubmitted = true;
		data.function = 'SUG';
		// app.dMessage('Submitting Game', data);
		$.ajax({
			url: app.engine,
			data: data,
			type: 'POST',
			dataType: 'json',
			desc: 'Game Submission',
			success: function(result){
				if (!result.error){
					// reset counter for other uses
					pollCounter = 0;
					commentPoll();
				}else{
					app.dMessage(result.error, result.stm);
				}
			}
		});
	}

	function getCommentPollData(){
		return {
			"function" : "GCG", // Get 	Comments from Game
			'id' : 'commentPoll',
			'game_id' : $('#game_id').val(),
			'counter' : pollCounter
		};
	}

	// comment polling
	function commentPoll(){
		opts = {
			getData: getCommentPollData,
			desc: 'Comment Polling',
			strPending: 'Waiting on comments from {0} players ...',
			completeFunc: displayComments,
			strInitial: 'Gathering player comments...'
		};
		poller(opts);
	}

	function poller(options){
		data = options.getData();
		// create ajax poll
		ajaxCall = function(){
			$.ajax({
				data: data,
				url: app.engine,
				type: 'POST',
				dataType: 'json',
				desc: options.desc,
				global: false,
				success: function(results){
					if (pollCounter <= 400){
						pollCounter++;
						data.counter = pollCounter;
						if (!results.status){ app.dMessage(data.error, data.stm);}
						if (results.status === 'pending'){
							// update ui continue polling
							$('#game_panel').unblock();
							msg = $.validator.format(options.strPending, [results.pending]);
							$('#game_panel').block({message: msg, css:{ width: '275px'}});
							poller(options);
						}else if(results.status === 'complete'){
							// update game ui
							clearTimeout(timeout);
							options.completeFunc(results.users);
							$('#game_panel').unblock();
						}
					}else{
						$('#game_panel').unblock();
						pollCounter = 0;
						app.dMessage('Data', data);
					}
				}
			});
		};
		// if this is the first time called immediately excute ajax
		if (data.counter === 0){
			$('#game_panel').block({message: options.strInitial, css:{ width: '275px'}});
			ajaxCall();
		} else {
			// if polling
			timeout = setTimeout(ajaxCall, 5000);
		}
	}

	function displayComments(users){
		// show vote/hide game
		toggleGame();

		// build vote form
		$('#btnVote').before('<ul id="selectable" >');
		$.each(users, function(){
			$('#debateVote ul').append(
				$('<li />')
					.append(
						$('<div id="' + divVotePrefix + this.user_id + '" />').append(
							$('<img class="avatar" src=' + app.getAvatar(this.avatar) + " />"),
							$('<div />')
								.addClass('votequote')
								.text(this.thoughts),
							$('<cite />').text(this.username)
						)
					)
					.addClass(offStateClass)
					.addClass('selectable')
				);
		});

		// create selectable and disable current user as selection
		$('#selectable').selectable({
			filter:'li.selectable',
			selected: function(event, ui){
				// deselect selection if selected previously
				if ($.inArray(onStateClass, ui.selected.classList) > -1){
					$(ui.selected).addClass(offStateClass).removeClass(onStateClass);
				}else{
					$( ".ui-selected", this ).each(function() {
						// current user cannot vote for themselves
						selectedId = $(this).children().prop('id').substring(divVotePrefix.length);
						if (parseInt(selectedId) === user.user_id){
							app.dMessage("Illegal Action", "You cannot vote for yourself!");
						}else{
							$(this).removeClass(offStateClass).addClass(onStateClass);
						}
					});
				}
				$('li.selectable').not(".ui-selected").not(disableStateClass).each(function() {
					$(this).removeClass(onStateClass).addClass(offStateClass);
				});
			}
		});

		// disable current user comment from selection
		$('#' + divVotePrefix + user.user_id).parent()
			.removeClass(offStateClass)
			.addClass(disableStateClass);
	}

	// validation for voting form
	$('#debateVote').validate({
		submitHandler: function(){
			selectedComment = $('#selectable').find('li').hasClass(onStateClass);
			if (selectedComment){
					selectedComment =  $('#selectable').find('li.ui-state-highlight');
					idText = selectedComment.children().prop('id');
					vote_id = parseInt(idText.substring(divVotePrefix.length));
			}else{
				app.dMessage("Error", "You must select a comment.");
				return false;
			}
			//gather data
			data = $(this.currentForm).serializeForm();
			data.game_id = $('#game_id').val();
			data.function = 'SVG';
			data.counter = pollCounter = 0;
			data.user_id = user.user_id;
			data.vote_id = vote_id;
			submitVote(data);
			// app.dMessage('Data', data);
		}
	});

	function submitVote(data){
		$.ajax({
			url: app.engine,
			data: data,
			type: 'POST',
			dataType: 'json',
			desc: 'Vote Submission',
			success: function(result){
				if (!result.error){
					// reset counter for other uses
					pollCounter = 0;
					votePoll();
				}else{
					app.dMessage(result.error, result.stm);
				}
			}
		});
	}

	function getVotePollData(){
		return {
			"function" : "GVG", // Get 	votes from Game
			'id' : 'votePoll',
			'game_id' : $('#game_id').val(),
			'counter' : pollCounter
		};
	}
	// comment polling
	function votePoll(){
		opts = {
			getData: getVotePollData,
			desc: 'Vote Polling',
			strPending: 'Waiting on votes from {0} players ...',
			completeFunc: loadWinner,
			strInitial: 'Gathering player votes...'
		};
		poller(opts);
	}

	function loadWinner(users){
		// disable game, enable parameter selection
		toggleParams();

		// show results
		if (!$('h3:contains("Game Results")').is(':visible')){
			$('h3:contains("Game Results")').toggle();
		}
		$('h3:contains("Game Results")').click();
			$('#results_title')
				.after(
					$('<span />')
						.text(app.prettyPrint(users))
						.wrap('<div />')
				);

		app.dMessage("Winner", users);
	}

	function toggleParams(){
		// disable/enable params
		$('h3:contains("Parameter Selection")').toggleClass('ui-state-disabled');
		// disable/enable game
		$('h3:contains("Debate Game")').toggleClass('ui-state-disabled');
	}

	function toggleGame(){
		$('#debate, .debateVote').toggle();
	}

	/**
	 * Game Clock instantiation
	 * @type {FlipClock}
	 */
		gameClock = $('#game_timer').FlipClock({
			autoStart: false,
			countdown: true,
			clockFace: 'MinuteCounter',
			callbacks: {
				stop: function(){
					data = $('#gameUI').serializeForm();
					data.user_id = user.user_id;
					if (!gameSubmitted) submitGame(data);
				}
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
			callbacks: {
				stop: function(){
					$.unblockUI();
					gameClock.start();
				}
			}
		});

	function loadDebate(){
		// disable waiting message
		$('#game_panel').unblock();

		//set game title(question)/wager
		$("#question")
			.html($('#paramQuestions :selected').text())
			.append(
				$('<h5>')
					.html("(Wager: " + $('#wager :selected').text() + ")")
			);


		// set clock based on time limit parameter
		min = paramMeta.getTimeById($('#timeLimit').val());
		gameClock.setTime(min);
		$.blockUI({message: $('#gameWait'), css:{ width: '305px'}});
		waitClock.start();
	}

	$('#cancel').click(function(){
		$('#game_panel').unblock();
		// enable/disable appropriate panels
		toggleParams();
		openAccordionPanel('last');
		cancelGame().success(function(data){
			// cancel poll
			clearTimeout(timeout);
			if (!data.error){
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
		});
	});

	function cancelGame(callback){
		params.function = 'CG';
		params.id = 'cancelGame';
		return $.ajax({
			url: app.engine,
			data: params,
			type: 'POST',
			dataType: 'json',
			desc: 'Game Cancellation'
		});
	}

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


	// load question box with values based on category/subcategory
	function primeQBox(catID){
		// destination selectmenu
		q_select = '#paramQuestions';
		// reset questions list
		$(q_select)
			.empty()
			.selectmenu('destroy')
			.selectmenu({width: '100%', style: 'dropdown'})
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

/**
 * This module sets up an
 * @module app
 * @return {Object} object with specific initialization and data handling for game.html
 */
define(['jquery', 'cookie', 'blockUI', 'jqueryUI', 'validate','tooltipster'], function($){
	var objCategories = {},
		defaultTheme = 'ui-lightness',
		app_engine = "/assets/cgi-bin/engine.py",
		default_avatar = 'assets/css/images/anon_user.png',
		selectMenuOpt = { width: '65%'},
		tabOptions = {
			active: false,
			collapsible: true,
			heightStyle: 'content',
			hide: { effect: "explode", duration: 1000 },
			// hide: { effect: "slide", direction: 'right', duration: 1000 },
			show: { effect: "slide", duration: 800 }
		},
		navPages = {
			'home' : 'index.html',
			'game' : 'game.html',
			'feedback': 'feedback.html',
			'profile': 'profile.html',
			'about': 'about.html',
			'admin': 'admin.html'
		},
		skillLevels = [{
				"title" : "Blowhard",
				"description" : "Look who hasn't even won eleven games....."
			},{
				"title" : "Bigmouth",
				"description" : "Get some games under you belt and we'll talk"
			},{
				"title" : "Conversationalist",
				"description" : "Looks like someone is making money"
			},{
				"title" : "Commentator",
				"description" : "Gaining momentum"
			},{
				"title" : "Scholar",
				"description" : "Look who can argue!"
			},{
				"title" : "Lecturer",
				"description" : "Debater Spectacular"
			},{
				"title" : "Advocate",
				"description" : "You know your stuff"
			},{
				"title" : "Orator",
				"description" : "Basically, Winston Churchill."
			},{
				"title" : "Elocutionist",
				"description" : "Straight winning"
			},{
				"title" : "Rhetorician",
				"description" : "Apex"
			}
		];

	$.fn.tooltipster('setDefaults',{
		trigger: 'custom',
		onlyOne: false,
		positionTracker: true,
		position: 'right',
		updateAnimation: false,
		animation: 'swing',
		positionTrackerCallback: function(){
			this.hide();
		}
	});

	var init = function(page){
		var returnValue,
			showLogin = false;
		this.currentPage = page;
		// show active page
		$('.main-nav li').removeClass();
		$('#' + page).addClass('ui-state-active pageLinks');

		// TODO: allow login and signup to work on all allowedPages
		// pages allowed to be viewed without logging in
		allowedPages = ['home', 'feedback', 'about'];
		// is current page on the VIP list?
		if (-1 == $.inArray(page, allowedPages) ){
			// if not logged in send to login page
			user = this.getCookie('user');
			if (user === undefined) window.location.assign(this.pages.home + "?true");
		}else{
			// if location is home page after redirection (see above) set value to open login form
			locParams = window.location;
			webPage = locParams.pathname.split('/')[1];
			search = locParams.search.split('?')[1];
			showLogin = (webPage === this.pages.home && search !== undefined);
		}

		//  Initalize app setup functions
		this.setTheme();
		this.navBar(page);

		// page specific initialization
		switch (page) {
			case 'home':
				$("#reset-tab").toggle();
				returnValue = showLogin;
				break;
			case 'game':
				// create counter for sub-category templates
				$(document).data("tempCount",0);

				// init selectmenus
				$(".sel").selectmenu(selectMenuOpt);

				// init param tabs
				$('#paramOptions').tabs(tabOptions);

				// load category selectmenu
				this.getCategories();

				// activate accordion
				this.accordion = $("#accordion").accordion({
					heightStyle: 'content',
					collapsable: true
				});

				// hide debate results panel
				$("#debateResults").toggle();

				// hide result pane till necessary
				// $("h3:contains('Debate Game')").toggleClass('ui-state-disabled');
				$("h3:contains('Debate Game')").toggle();
				$('h3:contains("Game Results")').toggle();
				$("h3:contains('Pre Game')").toggle();


				break;
			case 'admin':
				// load category selectmenu
				this.getCategories();
				$('select').selectmenu(selectMenuOpt);
				// create counter for sub-category templates
				$(document).data("tempCount",0);
				break;
			case 'feedback':
				optCategory = {
					change: function(){
						// validate select
						$(this).closest('form').validate().element(this);
					}
				};
				settings = $.extend({}, selectMenuOpt, optCategory);
				$(".sel").selectmenu(settings);
				$("input").not('[type=submit]').width('110%');
				break;
			default:

		}

		// jquery-fy page with Page Stylings
		$("input[type=submit]").button();
		$("input[type=button]").button();

		// final page setup
		// add event listener for logout
		this.logout();
		this.setFooter();
		this.rankInfo();
		// initialize agreement module
		this.agreement();
		return returnValue;
	};

	function setFooter(){
		// universal function to create the footer
		// NOTE: ids/classes are important progmatically (caution when changing)

		// rules div
		tplRules = "<div class='agreement_text' style='display:none;'> \
						<div class='rules'> \
							<h2>Rules and Regulations</h2> \
							<ol> \
								<li> \
									While <b><i>Isaiditbest</b></i> allows great leniency regarding freedom of speech while debating, Isaiditbest reserves the right to suspend or revoke membership to any member for anything that <b><i>Isaiditbest</b></i> determines is hate speech. Similarly, any intimidating language towards other members is also strictly prohibited. By using this website, all users acknowledge that Wesaiditbest retains the right to make these decisions regarding who may debate on our website. \
								</li> \
								<li> \
									Group coordination, where there is a prearranged agreement between multiple members to vote for each other, is strictly prohibited.<br /> \
									<p> \
										By using this website, all users acknowledge that any attempt to perform these actions will result in a ban and potential forfeit of remaining credit, which may be used only for the purposes of reimbursing potentially harmed contestants. Any use of this website comes with the knowledge that Isaiditbest retains the right to determine whether group coordination occurred and take these listed actions. Any customers facing potential suspension or credit forfeit will be given a minimum of 72 hours to appeal our decision. By using this website, all users give their consent to <b><i>Isaiditbest</b></i> to determine if group coordination occurred and undertake the actions mentioned in this document. \
									</p><br /> \
									<p> \
										<b><i>Isaiditbest</i></b> retains the right to make any and all decisions regarding who may use this website and all game decisions, including retroactive game decisions in the case that group coordination is believed to have occurred. By signing up and participating in games, I agree to these terms. \
									</p> \
								</li> \
							</ol> \
							<br> \
							<p> \
								<a class='agreement_close' href='#'>Close this dialog</a> \
							</p> \
						</div>";
		txtFooter = "Use of this website constitutes acceptance of the ISaidItBest \
			<a class=\"agreement\" href=\"#\">Rules Agreement</a>";

		// wrap the content of the body with a container and wrap that
		// with container to accomodate the footer stylings
		$('body').wrapInner("<div id='content'></div>");
		$('#content').wrap('<div id="container" />');
		$('<div />')
			.addClass('footer')
			.html(txtFooter + tplRules)
			.prepend(
				$('<div class="placeHolder" />'),	// enable subCheck
				$('<div class="test" />')			// enable test btn toggle
			)
			.insertAfter('#container');

	}

	function agreement(){
		// make sure rules are read before 'agreeing'
		$('.rules').scroll(function(){
			if ($(this).scrollTop() + $(this).innerHeight() + 2 >= $(this)[0].scrollHeight){
				$('#rulesChk').prop('disabled', false);
				$('#rulesChk').prop('checked', true);
			}
		});

		$('.agreement_close').click(function(){
			event.preventDefault();
			$.unblockUI();
		});

		$('.agreement').click(function(){
			event.preventDefault();
			// open rules
			$.blockUI({
				fadeIn: 1000,
				css: {
					top:  ($(window).height() - 500) /2 + 'px',
	                left: ($(window).width() - 500) /2 + 'px',
	                width: '500px'
				},
				message: $('.agreement_text'),
				onOverlayClick: $.unblockUI
			});
		});
	}

	function showRanking(){
		if ($('div#ranks').length === 0) {
			$('.footer')
				.append(
					$('<div id="ranks" />')
						.addClass('hidden')
						.append(
							$('<div />')
								.addClass('center-content')
								.append('<h1>Rank Description</h1>')
								.append('<dl />')
					)
				);

			$.each(skillLevels,function(idx, value){
				$('#ranks dl')
						.append(
							$('<dt />')
								.append(
									$('<img src="/assets/css/images/trans1.png" />')
										.removeClass()
										.addClass('star' + (1 + idx)),
									$('<span>' + value.title + '</span>')
								)
						)
						.append(
							$('<dd />')
								.html(value.description)
						);

			});

			// let the user know that 0 stars and 1/2 star are equal rank
			$('dt:first')
				.prepend(
					$('<img src="/assets/css/images/trans1.png" />')
						.removeClass()
						.addClass('star0')
					,$('<br />')
				)


			$('#ranks')
				.append("<a class='rank_close' href='#'>Close this dialog</a>");

			$('.rank_close').click(function(){
				event.preventDefault();
				$.unblockUI();
			});
		}
		return $('#ranks');
	}

	function rankInfo(){
		$('.rankInfo').click(function(){
			event.preventDefault();
			// open rules
			$.blockUI({
				fadeIn: 1000,
				css: {
					top:  ($(window).height() - 500) /2 + 'px',
	                left: ($(window).width() - 500) /2 + 'px',
	                width: '500px'
				},
				message: showRanking(),
				onOverlayClick: $.unblockUI
			});
		});



	}

	function getAvatar(avFilespec){
		if (avFilespec === undefined){
			info = getCookie('user');
			return (info.avatar) ? '/assets/avatars/' + info.avatar : default_avatar;
		}else{
			return (avFilespec !== "") ? '/assets/avatars/' + avFilespec : default_avatar;
		}
	}

	function logout(){
		app = this;
		$('.logout').on('click', function(e){
			e.preventDefault();
			$.removeCookie('user');
			window.location.assign(app.pages.home);
		});
	}

	var loginNavBar = function(page){
		// logged in user
		info = this.getCookie('user');
		for(var key in navPages){
			// don't show links if not logged in
			if (info === undefined){
				if (key == 'profile') $('#' + key).toggle();
				if (key == 'admin')  $('#' + key).toggle();
				if (key == 'game')  $('#' + key).toggle();
			}else{
				// don't show admin to reg user
				if (key == 'admin' && info.role == 'user')  $('#' + key).toggle();
				if (key == 'registration')  $('#' + key).toggle();
			}
		}

		if (info){
			// hide signin/signup
			$('.cd-signin, .cd-signup').toggle();
			// if (page === 'home') return false;
			userSpan = "<span id='welcome' class='ui-widget'>Welcome, <a href='" +  navPages.profile + "'>   "  + info.username  ;
			userSpan += "<img src='" + getAvatar() + "' title='Edit " + info.username + "' class='avatar_icon'></a>";
			userSpan += "<br /><span class='skill_level ui-widget'><span class='skill_level_text rankInfo'>Level</span>:<img src='/assets/css/images/trans1.png' class=''></span></span>";
			$("header").after(userSpan);

			// show skills
			this.showSkills();
		}else{
			$('.logout').toggle();
		}
	};

	var showSkills = function(){
		user = this.getCookie('user');
		data = {};
		data.user_id = user.user_id;
		data.id = 'tr';
		data.function = 'TRU';
		$.ajax({
			desc: 'Get TrackRecord',
			data: data,
			type: "POST",
			url: app_engine
			})
			.done(function(data, textStatus, jqXHR){
				data = data[0];
				wins = data.wins;
				losses = data.losses;
				sumGames = wins + losses;
				winPct = wins / sumGames;
				winPct = (isNaN(winPct)) ? 0 : winPct;
				rate_level = parseInt(Math.ceil(winPct * 10));
				rate_class = 'star' + rate_level;
				$('.skill_level img').removeClass().addClass(rate_class);
				$('.skill_level_text').html(getLevelName(winPct * 100));
		});
	};
	function getLevelName(val){
		// get the index of the skill level name
		idx = val % 100 / 10 | 0;
		return skillLevels[idx].title;
	}

	var loading = function(msg){
		loadingImg = '<img src="assets/css/images/loading.gif" />';
		loadingHtml = ' <h3>We are processing your request.  Please be patient.</h3>';
		msg =  (msg === undefined) ?  loadingImg + loadingHtml : loadingImg + msg;
		$.blockUI({message: msg});
	};

	var unloading = function(element){
		var data = $(window).data();

		if (data['blockUI.isBlocked'] == 1) {
			$('#content').unblock();
		}
		$.unblockUI();
	};

	$(document)
		.ajaxStart(function(event, xhr, options) {
	    	loading();
	    })
		.ajaxComplete(function(event, xhr, options) {
			// if options.function == logger or utility...don't log
			if (options.function === undefined){
				// if (options.desc === undefined) return false;
				user = getCookie("user");
				if (typeof(options.data) === 'object') options.data = JSON.stringify(options.data);
				data = {
					'function': 'LOG',
					'user_id': (user === undefined) ? 0 : user.user_id,
					'description': options.desc || 'utility function',
					'action' : options.data || 'utility data',
					'result' : xhr.responseText,
					'detail' : options.url + " | " + xhr.status + " | " + xhr.statusText
				};
				// log event
				$.ajax({
					contentType: "application/x-www-form-urlencoded",
					function: 'logger',
					data: data,
					type: "POST",
					url: app_engine
					})
					.done(function(data, textStatus, jqXHR){
						// NOTE: comment line below for production
						// console.log("Logged data: " + JSON.stringify(data, null, 4));
					})
					.fail(function(jqXHR, textStatus, errorThrown) { console.log('log request failed! ' + textStatus); })
					.always(function() { return false; });
			}
	    	unloading();
	    })
		.ajaxError(function(event, xhr, options) {
	    	unloading();
	    });

	/**
	 * sets cookies with info
	 */
	 function setCookie(name, data){
	 	$.cookie.json = true;
	 	$.removeCookie(name);

		// remove default theme and use user theme
		if (name == 'user') $.removeCookie('theme');

	 	$.cookie(name, data);
	 }

	 function setTheme(theme){
	 	// if no theme sent set default
	 	var cook_theme;
		uObj = getCookie('user');
		if (typeof(uObj) !== "undefined") cook_theme = uObj.theme;

	 	if (theme === undefined){
	 		theme = (cook_theme === undefined) ? defaultTheme : cook_theme;
 		}

 		theme = theme.replace(/['"]+/g,'');
 		// refresh cookie
 		$.removeCookie("theme");
	 	$.cookie("theme", theme);

	 	cook_theme = $.cookie('theme');
		var theme_url = "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/themes/" + theme + "/jquery-ui.css";
		$('head').append('<link href="'+ theme_url +'" rel="Stylesheet" type="text/css" />');
	}

	/**
	 * gets cookies info
	 */
	 function getCookie(name){
	 	$.cookie.json = true;
	 	return $.cookie(name);
	 }

	 function pprint(obj){
	 	return "<pre>" + JSON.stringify(obj, null, 2) + "</pre>";
	 }

	/**
	 * Determines of an object is empty
	 * @return {Boolean} [description]
	 */
	function isEmpty(obj){
	 	length = Object.getOwnPropertyNames(obj).length;
	 	return 	length > 0 ? false : true;
	 }
	var getCategories = function(){
		app = this;
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
			function: 'utility',
			data: {'function' : 'GC'},
			type: "POST",
			url: app_engine
		})
		.done(function(result){
			if (typeof(result) !== 'object'){
			 	result = JSON.parse(result)[0];
			}
			// internal error handling
			if (result.error !== undefined){
				console.log(result.error);
				return result;
			}else{
				app.objCategories = result.categories;
				loadCategories(app.objCategories);
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			app.dMessage(textStatus + ': request failed! ', errorThrown);
			console.log(textStatus + ': request failed! ' + errorThrown);
		});
	};

	 /**
 	 * loads categories into appropriate selectmenu
 	 * @param  {object} categories object containing all category data
 	 * @return none
 	 */
 	var loadCategories = function(objCategories){
 		if (objCategories === undefined) {
 			getCategories();
 			return false;
 		}
 		// get all "Category" select menus
 		menus = $('select[id$=Category]').not('[id*=Sub]').not('[id*=temp]');
 		$.each(menus, function(){
 			$(this)
 				.empty()
 				.append(new Option("None", ""));
 			element = $(this);
 			$.each(objCategories, function(idx, objCat){
 				parentID = objCat.parent_id;
 				cat = objCat.category;
 				id = objCat.category_id;
 				if (element.hasClass('allCategories')){
 					// do not filter categories
 					element.append(new Option(cat, id));
 				}else{
 					// get top level categories
 					if (parentID === 0){
 						element.append(new Option(cat, id));
 					}
 				}
 			});
 			$(this).selectmenu().selectmenu("refresh", true);
 		});

 	};


	var getCatQuestions = function(catID, elementID){
		app = this;
		if (catID === "") return false;
		qList = $(elementID);
		data = {'function' : 'GQ'};
		data.category_id = catID;
		$.ajax({
			contentType: "application/x-www-form-urlencoded",
			function: 'utility',
			data: data,
			type: "POST",
			url: app_engine
		})
		.done(function(result){
			if (typeof(result) !== 'object'){
				app.dMessage('Error Getting Category Questions', result);
				return result;
			}
			// internal error handling
			if (result.error !== undefined){
				app.dMessage(result.error.error, result.error.msg);
				console.log(result.error);
				return result;
			}
			// load question selectmenu
			$.each(result.questions, function(){
				qList.append($('<option />').val(this.question_id).text(this.question_text));
				qList.val("");
				qList.selectmenu('refresh');
			});
		});
	};

	function escapeId(myID){
		return "#" + myID.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
	}
	/**
	 * Check if a number is in between min and max
	 * @return {Boolean} Boolean
	 */
	 Number.prototype.between = function(min, max){
		 return this.valueOf() >= min && this.valueOf() <= max;
	 };

	/**
	 * Capitalizes string
	 * @return {String} capitalized string
	 */
	String.prototype.capitlize = function(){
		return this.toLowerCase().replace( /\b\w/g, function(m){
			return m.toUpperCase();
		});
	};

	/**
	 * get prefix
	 * @return {String} prefix of string
	 */
	String.prototype.prefix = function (separator) {
	    separator = (separator === undefined) ? '_' : separator;
	    return this.substring(0, this.indexOf(separator) + 1);
	};

	/**
	 * Converts form data to js object
	 * @return {formdata} object
	 */
	$.fn.serializeForm = function(checkAll) {
	    var o = {"id": this.prop('id')};

	    var a = (checkAll) ? this.serializeAllArray() : this.serializeArray();
	    // var a = this.serializeArray();
	    $.each(a, function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
	    return o;
	};

	/**
	 * Converts form data to js object
	 * @return {formdata} object
	 */
	 $.fn.serializeAllArray = function () {
		return $('input', this);
	 };

	/**
	 * Converts seconds to HH:MM:SS
	 * @return {string} string
	 */
	String.prototype.toMMSS = function () {
	    var sec_num = parseInt(this, 10); // don't forget the second param
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    // if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    // var time    = hours+':'+minutes+':'+seconds;
	    var time    = minutes+':'+seconds;
	    return time;
	};

    // validator selectmenu method
    $.validator.addMethod("selectNotEqual", function(value, element, param) {
		return param != value;
    },"Please choose a subcategory");

	// validator defaults
	$.validator.setDefaults({
		debug: true,
		ignore: "",
		errorPlacement: function (error, element) {
			// account for jquery selectmenu
			id = escapeId(element.context.id);
			/* 	I was lazy and copied the forms so ids are duplicated
				The next if is to specify the element by form
			*/
			if (id.indexOf('[') < 0){
				// the previous test is for dynamic subcategory elements (eg. "#p_subCategory\\[2\\]")
				currentForm = "#" + $(element).closest('form')[0].id;
				currentId = currentForm + " " + id;
				element = $(currentId);
			}
			if (element[0].nodeName === "SELECT"){
				// account for jquery selectmenu structure which
				// uses a span to display list/button
				// next() refers to '#' + element.id + '-button'
				element = element.next();
			}
			// last chance to init element if not done already
			if ($(element).data('tooltipster-ns') === undefined) $(element).tooltipster();

			var lastError = $(element).data('lastError'), // get the last message if one exists
				newError = $(error).text();               // set the current message

			$(element).data('lastError', newError);  // set "lastError" to the current message for the next time 'errorPlacement' is called

			if(newError !== '' && newError !== lastError){  // make sure the message is not blank and not equal to the last message before allowing the Tooltip to update itself
				$(element)
					.tooltipster('content', newError) // insert content into tooltip
					.tooltipster('show');              // show the tooltip
			}
		},
		success: function (label, element) {
			if (element.nodeName === "SELECT"){
				// account for jquery selectmenu structure which
				// uses a span to display list/button
				// next() refers to '#' + element.id + '-button'
				element = $(element).next();
			}
			// last chance to init element if not done already
			if ($(element).data('tooltipster-ns') === undefined) $(element).tooltipster();
			$(element).tooltipster('hide');  // hide tooltip when field passes validation
		},
		showErrors: function (errorMap, errorList) {
              if (typeof errorList[0] != "undefined") {
                  var position = $(errorList[0].element).position().top;
                  $('html, body').animate({
                      scrollTop: position
                  }, 300);

              }
              this.defaultShowErrors();
          }
	});

	function get_mboxDefaults(title, message){
		return {
			autoResize: true,
			dialogClass: 'no-close',
			modal: true,
		    title: title,
			open: function(){
				icon = '<span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 5px 0;"></span>';
				$(this).parent().find("span.ui-dialog-title").prepend(icon);
				$(this).html(message);
			},
		   buttons: {
			    Ok: function () {
				   $(this).dialog("close");
			    }
		   }
	   };
	}

	/** return the app object with var/functions built in */
	return {
		init: init,
		defaultTheme: defaultTheme,
		selectMenuOpt: selectMenuOpt,
		tabOptions: tabOptions,
		// site pages referred here so no hard coding is necessary
		pages: navPages,
		// CGI script that does all the work
		engine : app_engine,
		objCategories: objCategories,
		// utility functions
		// get message box default options (params: title, message)
		mboxDefaults: get_mboxDefaults,
		isEmpty: isEmpty,
		setCookie: setCookie,
		getCookie: getCookie,
		showSkills: showSkills,
		showLoading: loading,
		navBar: loginNavBar,
		hideLoading: unloading,
		setTheme: setTheme,
		prettyPrint: pprint,
		logout: logout,
		getCategories: getCategories,
		loadCategories: loadCategories,
		getCatQuestions: getCatQuestions,
		getAvatar: getAvatar,
		agreement: agreement,
		setFooter: setFooter,
		rankInfo: rankInfo,
		dMessage : function(title, message, options){
			title = (title === undefined) ? "Error" : title;
			if (message !== undefined){
				// print objects in readable form
				message = (typeof(message) === 'object') ? this.prettyPrint(message) : message;
			}else{
				message = "";
			}
			settings = this.mboxDefaults(title, message);
			if (options) settings = $.extend({}, this.mboxDefaults(title, message), options);
			$('<div />').dialog(settings);
		},
		getTheme: function(){
			$.cookie.json = true;
			current_theme =  $.cookie('theme');
			return (current_theme === undefined) ? this.defaultTheme : current_theme;
		},
		subCheck:function(element){
			app = this;
			if (element === undefined) return false;

			// get calling element info
			current_id = parseInt(element.val());
	        current_selection = $("option:selected", element).text();
	        element_id_prefix = element.attr('id').prefix();
	        element_is_top = false;

	        // quit if None selected
			if (isNaN(current_id)) return false;

	        // check the categories object for subcategories of current selection
	        catCollection = [];
			$.each(app.objCategories, function(idx, objCat){
				parentID = objCat.parent_id;
				catID = objCat.category_id;

				if (current_id == catID && parentID === undefined ){ element_is_top = true; }
				// accumulate children
				if (parentID == current_id){
					catCollection.push(objCat);
				}
			});

	        if (catCollection.length > 0){
	        	/* create subcategory select, fill and new subs checkbox */

	        	// get the template paragraph element
	        	$('.placeHolder').load('templates.html #subCatTemplate', function(response, status, xhr){
					if (status != 'error'){
			        	parentP = $('#subCatTemplate');
			        	// clone it
			        	var clone = parentP.children().clone();

						// add identifying class for later removal
						clone.addClass('clone');

			        	// get current iteration of instantiation of the template for naming
						var iteration = $(document).data('tempCount');
						// increment iteration as index and save new iteration
			    		index = ++iteration;
			    		$(document).data('tempCount', iteration);

			        	// loop through all child elements to modify before appending to the dom
			        	clone.children().each(function(){
			        		changeID = true;
							elName = null;
							elID = null;
			        		// get the id ov the current element
			        		var templateID = $(this).prop('id');
			        		// make sure there are no blank ids
			        		switch ($(this).prop('type') || $(this).prop('nodeName').toLowerCase()){
								case 'label':
				        			strFor = $(this).prop('for');
				        			origPrefix = strFor.prefix();
				        			strFor = strFor.replace(origPrefix, element_id_prefix) + index;
				        			// change 'for' property for label
				        			$(this).prop('for', strFor);
				        			changeID = false;
				        			break;
			        			case 'select':
			        			case 'select-one':
				        			elID = templateID.replace(templateID.prefix(), element_id_prefix) + "[" + index + "]";
				        			elName = templateID.replace(templateID.prefix(), element_id_prefix) + "[]";
				        			// add new option to select menu based on parent id
				        			$(this)
										.addClass('required')
										.empty()
										.append(new Option("None", ""));
										tmpSelect = $(this);
										$.each(catCollection, function(idx, objCat){
											cat = objCat.category;
											id = objCat.category_id;
											tmpSelect.append(new Option(cat, id));
										});
										break;
								case 'checkbox':
				        			elID = templateID.replace(templateID.prefix(), element_id_prefix) + index;
									elName = elID;
				        			break;
				        		default:
				        			changeID = false;
			        		}
			        		// only change the id of necessary elements
			        		if (changeID)  {

								$(this).prop({"id":elID, "name": elName });

							}
			        	});
			        	element.parent().after(clone);
						$('.placeHolder').empty();
					}else{
						app.dMessage(status.capitlize() + ' - Template File', xhr.statusText);
					}
				});

	        }else{
	        	// category is top-level
	        	msg = "No Sub-category found for: " + current_selection;
	        	title = "Selection Error: " + current_selection;
	        	msg += (element_is_top) ? " is a top-level category!" : " has no sub-categories";
	        	app.dMessage(title, msg);
	        }
		}
	};
});

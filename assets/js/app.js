/**
 * This module sets up an
 * @module app
 * @return {Object} object with specific initialization and data handling for game.html
 */
define(['jquery', 'cookie', 'blockUI'], function($){

	var defaultTheme = 'excite-bike';
	var app_engine = "/assets/cgi-bin/engine.py";

	var navPages = {
			'home' : 'index.html',
			'game' : 'game.html',
			'registration': 'signup.html',
			'contact': 'contact.html',
			'profile': 'profile.html',
			'admin': 'admin.html',
			'main': 'main.html'
		};

	var navBar = function(){
		$('body').prepend('<div id="navDiv">').addClass('ui-widget-header');
		$('#navDiv').append('<ul id="navBar">').addClass('ui-state-default');
		for(var key in navPages){
			// the following line is necessary for production
			// it is comment now for testing purposes only
			// TODO: uncomment line below
			// if (key == 'profile') continue;
			listItem = "<li><a href='" +  navPages[key] + "'> " + key + "</a></li>";
			$('#navBar').append(listItem);
		}

	};

	var loginNavBar = function(){

		for(var key in navPages){
			// the following line is necessary for production
			// it is comment now for testing purposes only
			// TODO: uncomment line below
			// if (key == 'profile') continue;
			listItem = "<li><a href='" +  navPages[key] + "'> " + key + "</a></li>";
			$('.main-nav ul').append($(listItem));
		}

		$('.main-nav ul').append('<li><a class="cd-signin" href="#0">Sign in</a></li>').addClass('ui-state.default');
		$('.main-nav ul').append('<li><a class="cd-signup" href="#0">Sign up</a></li>').addClass('ui-state.default');
	};

	var loading = function(msg){
		loadingImg = '<img src="assets/css/images/loading.gif" />';
		loadingHtml = ' <h1>We are processing your request.  Please be patient.</h1>';
		if (msg === undefined){ msg = loadingImg + loadingHtml; }
		$.blockUI({message: msg});
	};

	var unloading = $.unblockUI;

	var ajxBody =  $("body");
	if (ajxBody !== undefined){
		ajxBody.bind("ajaxStart", function() {
	    	loading();
	    }).bind("ajaxStop", function() {
	    	unloading();
	    }).bind("ajaxError", function() {
	    	unloading();
	    });
	}

	/**
	 * sets cookies with info
	 */
	 function setCookie(name, data){
	 	$.cookie.json = true;
	 	$.removeCookie(name);
	 	$.cookie(name, data);
	 }

	 function setTheme(theme){
	 	// if no theme sent set default
	 	var cook_theme = $.cookie('theme');
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

	 function pprint(str){
	 	return JSON.stringify(str, null, 2);
	 }

	/**
	 * Determines of an object is empty
	 * @return {Boolean} [description]
	 */
	function isEmpty(obj){
	 	length = Object.getOwnPropertyNames(obj).length;
	 	return 	length > 0 ? false : true;
	 }

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
		$.fn.serializeForm = function() {
		    var o = {"id": this.prop('id')};
		    var a = this.serializeArray();
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
	 * Initalize app setup functions
	 */
	setTheme();

	/** return the app object with var/functions built in */
	return {
		defaultTheme: defaultTheme,
		// site pages referred here so no hard coding is necessary
		pages: navPages,
		// CGI script that does all the work
		engine : app_engine,
		// utility functions
		isEmpty: isEmpty,
		setCookie: setCookie,
		getCookie: getCookie,
		createNavBar: navBar,
		// createNavBar: loginNavBar,
		createLoginNavBar: loginNavBar,
		showLoading: loading,
		hideLoading: unloading,
		setTheme: setTheme,
		prettyPrint: pprint,
		getTheme: function(){
			$.cookie.json = true;
			current_theme =  $.cookie('theme');
			return current_theme;
		},
		/**
		 * @descriptions Gathers all parameters for the debate and puts them in given format
		 * @method
		 * @return {Object} parameters in an object ready for cgi consumption
		 */
		submitParameters : function(){
				validParams = true;
				params = {"function": "LCQ"};
				errorMessage = "";
				$("select").each(function(){
					selectedValue = $(this).val();
					id = $(this).context.id;
					selectedText = $(this).find(":selected").text();
					// test for valid parameter values
					// TODO: Add jquery validator
					if (selectedValue == "---"){
						errorMessage += "<br /> " + id.capitlize() + ": "  + selectedText;
						validParams = false;
						return;
					}else{
						id = $(this).context.id;
						params[id] = selectedValue;
						params[id + "_text"] = selectedText;
					}
				});

				if (!validParams){
					// debug statment
					console.log(params);
					$('#game_messages').html(errorMessage);
					errorTitle = "Invalid parameters: \n";
					$('#game_messages').dialog({ title: errorTitle, autoOpen: true, modal: true});
					return false;
				}

				// send data to serverside script
				$.ajax({
					contentType: "application/x-www-form-urlencoded; charset=utf-8",
					data: params,
					type: "POST",
					url: this.engine
				})
				.done( function(result) { /*console.log("success"); console.log(result)*/})
				.fail( function(request, error) { console.log("Error"); console.log(request);});

				return params;
			},
		/**
		 * loads the debate parameters, generates time clock, disables parameter selection and starts the debate
		 * @param  {object} data Parameters for the debate
		 */
		loadDebate : function(data){
				if (!data) { return data; }
			 	$(".countdown_timer").hide();
			 	$("#debate").hide();
				$("#ui-id-1").addClass('ui-state-disabled');
				$("#ui-id-2").click();
				// TODO: notify user of submission status (success/fail)
				$("#successNotice").fadeIn(1000, function(){
					// notify user of the search for a game
					 $("#searchingNotice").fadeIn(1000,function(){
						$("#game").addClass("searching");
						// $("#game").append("<img id='searchImg' src='/assets/images/search1.gif' />");
						$("#successNotice").fadeOut(5000,function(){
							// when the success notice fades
							$("#searchingNotice").hide();
							$("#game").removeClass("searching");
							$("#searchImg").remove();
						 	$("#debate").show();
						 	$(".countdown_timer").show();
						 	//set game criteria
						 	var q_text = params.subCategory_text + "\n (Wager: " + params.wager_text + ")";
						 	$("#question").html(q_text).wrap('<pre />');
						 	// set clock based on time limit parameter
						 	min = params.timeLimit * 60;
						 	clock.setTime(min);
						 	clock.start();
						});
					});
				});

			}
	};
});

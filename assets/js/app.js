/**
 * This module sets up an
 * @module app
 * @return {Object} object with specific initialization and data handling for game.html
 */
define(['jquery', 'cookie', 'blockUI', 'jqueryUI', 'validate','tooltipster'], function($){
	var objCategories = {};
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
		if (page !== 'home' && page !== 'registration'){
			// if not logged in send to login page
			user = this.getCookie('user');
			if (user === undefined) window.location.assign(this.pages.home);
		}

		//  Initalize app setup functions
		setTheme();
		this.createNavBar();

		// page specific initialization
		switch (page) {
			case 'game':
				// load category selectmenu
				this.getCategories();
				this.accordion = $("#accordion").accordion({ heightStyle: 'content', collapsable: true});
				$("#debateResults").toggle();
				$(".sel").selectmenu({ width: 200 });
				// create counter for sub-category templates
				$('#subCatTemplate').data("tempCount",0);
				break;
			case 'admin':
				// load category selectmenu
				this.getCategories();
				// create counter for sub-category templates
				$('#subCatTemplate').data("tempCount",0);
				break;
			default:

		}

		// jquery-fy page with Page Stylings
		$("input[type=submit]").button();

		// add event listener for logout
		this.logout();
	};

	var navBar = function(){
		// logged in user
		$.cookie.json = true;
		info = $.cookie('user');

		$('body').prepend('<div id="navDiv">').addClass('ui-widget-header');
		$('#navDiv').append('<ul id="navBar">').addClass('ui-state-default');
		for(var key in navPages){
			// don't show admin to reg user
			if (info === undefined){
				if (key == 'profile') continue;
				if (key == 'admin') continue;
			}else{
				if (key == 'admin' && info.role == 'user') continue;
				if (key == 'registration') continue;
			}
			// main in progress so dont clutter
			if (key == 'main') continue;

			// add pages to header
			listItem = "<li><a href='" +  navPages[key] + "'> " + key + "</a></li>";
			$('#navBar').append(listItem);
		}

		if (info){
			userSpan = "<span style='right:0; position:absolute;'>Welcome, <a href='" + navPages.profile + "'> " + info.username + "</a></span>";
			// $("#navDiv").append(userSpan);
			logSpan = "<div id='logout' style='right:0; position:relative;'><a href='javascript:void(0)'>Logout?</a></div>";
			// logSpan = "<span ><a href='javascript:void(0)'>Logout?</a></span>";
			$("#navDiv").append(userSpan).append(logSpan);
		}
	};

	function logout(){
		app = this;
		$('#logout a').on('click', function(e){
			e.preventDefault();
			$.removeCookie('user');
			window.location.assign(app.pages.home);
		});
	}

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
		msg =  (msg === undefined) ?  loadingImg + loadingHtml : loadingImg + msg;
		$.blockUI({message: msg});
	};

	var unloading = $.unblockUI;

	$(document)
		.ajaxStart(function(event, xhr, options) {
	    	loading();
	    })
		.ajaxComplete(function(event, xhr, options) {
			// if options.function == logger or utility...don't log
			if (options.function === undefined){
				// if (options.desc === undefined) return false;
				user = getCookie("user");
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
						console.log("Logged data: " + JSON.stringify(data, null, 4));
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
			if (element.context.nodeName === "SELECT"){
				element = $('#' + element.context.id + '-button');
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
				element = $('#' + element.id + '-button');
			}
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
	/** return the app object with var/functions built in */
	return {
		init: init,
		defaultTheme: defaultTheme,
		// site pages referred here so no hard coding is necessary
		pages: navPages,
		// CGI script that does all the work
		engine : app_engine,
		objCategories: objCategories,
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
		logout: logout,
		getCategories: getCategories,
		loadCategories: loadCategories,
		getCatQuestions: getCatQuestions,
		dMessage : function(title, message, options){
			app = this;
			title = (title === undefined) ? "Error" : title;
			if (message !== undefined){
				// print objects in readable form
				message = (typeof(message) === 'object') ? app.prettyPrint(message) : message;
			}else{
				message = "";
			}
			defaultOpts = {
				autoResize: true,
				dialogClass: 'no-close',
				modal: true,
			    title: title,
				open: function(){
					icon = '<span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 5px 0;"></span>';
					$(this).parent().find("span.ui-dialog-title").prepend(icon);
				   var markup = message;
				   $(this).html(markup);
				},
			   buttons: {
				   Ok: function () {
					   $(this).dialog("close");
				   }
			   }
		    };
			settings = defaultOpts;
			if (options) settings = $.extend({}, defaultOpts, options);

			// app.mBox.dialog('option','title', title);
			// $('#message-content').html(message);
			// app.mBox.dialog('open');
			$('<div />').dialog(settings);
		},
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
	        	parentP = $('#subCatTemplate');
	        	// clone it
	        	var clone = parentP.children().clone();
				// add identifying class for later removal
				clone.addClass('clone');

	        	// get current iteration of instantiation of the template for naming
				var iteration = parentP.data('tempCount');
				// increment iteration as index and save new iteration
	    		index = ++iteration;
	    		parentP.data('tempCount', iteration);

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

/**
 * This module sets up an  
 * @module app
 * @return {Object} object with specific initialization and data handling for game.html
 */
define(['jquery', 'cookie'], function($){

	var navPages = {
			'Home' : 'index.html',
			'Game' : 'game.html',
			'Registration': 'signup.html',
			'Contact': 'contact.html',
			'Admin': 'admin.html'
		};

	var navBar = function(){
		$('body').prepend('<div id="navDiv">')
		$('#navDiv').append('<ul id="navBar">')
		for(key in navPages){
			listItem = "<li><a href='" +  navPages[key] + "'> " + key + "</a></li>"
			$('#navBar').append(listItem)
		}

	};
	/**
	 * sets cookies with info
	 */
	 function setCookie(name, data){
	 	$.cookie.json = true
	 	$.removeCookie(name)
	 	$.cookie(name, data)
	 };

	/**
	 * gets cookies info
	 */
	 function getCookie(name){
	 	$.cookie.json = true
	 	return $.cookie(name)
	 };

	/**
	 * Determines of an object is empty
	 * @return {Boolean} [description]
	 */
	function isEmpty(obj){
	 	length = Object.getOwnPropertyNames(obj).length
	 	return 	length > 0 ? false : true
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
		 * Converts form data to js object
		 * @return {[type]} object
		 */
		$.fn.serializeForm = function() {
		    var o = {};
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

	/** return the app object with var/functions built in */
	return {
		// site pages referred here so no hard coding is necessary
		pages: navPages,		/**
		 * CGI script that does all the work
		 * @type {String}
		 */
		engine : "/assets/cgi-bin/engine.py",
		// utility functions
		isEmpty: isEmpty,
		setCookie: setCookie,
		getCookie: getCookie,
		createNavBar: navBar,
		/**
		 * @descriptions Gathers all parameters for the debate and puts them in given format 
		 * @method
		 * @return {Object} parameters in an object ready for cgi consumption
		 */
		submitParameters : function(){
				errorMessage = "Invalid parameters: \n"
				validParams = true
				params = {"function": "LCQ"}
				$("select").each(function(){
					selectedValue = $(this).val()
					id = $(this).context.id
					selectedText = $(this).find(":selected").text()
					// test for valid parameter values
					// TODO: Add jquery validator 
					if (selectedValue == "---"){
						errorMessage += "\n  " + id.capitlize() + ": "  + selectedText
						validParams = false
						return 
					}else{
						id = $(this).context.id
						params[id] = selectedValue 
						params[id + "_text"] = selectedText 
					}
				})

				if (!validParams){
					// debug statment
					console.log(params)
					alert(errorMessage)
					return false
				}

				// send data to serverside script
				$.ajax({
					contentType: "application/x-www-form-urlencoded; charset=utf-8",
					data: params,
					type: "POST",
					url: this.engine
				})
				.done( function(result) { /*console.log("success"); console.log(result)*/})
				.fail( function(request, error) { console.log("Error"); console.log(request)});

				return params
			},
		/**
		 * loads the debate parameters, generates time clock, disables parameter selection and starts the debate 
		 * @param  {object} data Parameters for the debate 
		 */
		loadDebate : function(data){
				if (!data) return data;
			 	$(".countdown_timer").hide()
			 	$("#debate").hide()
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
							$("#searchingNotice").hide()
							$("#game").removeClass("searching");
							$("#searchImg").remove()
						 	$("#debate").show()
						 	$(".countdown_timer").show()
						 	//set game criteria
						 	var q_text = params.subCategory_text + "\n (Wager: " + params.wager_text + ")"
						 	$("#question").html(q_text).wrap('<pre />')
						 	// set clock based on time limit parameter
						 	min = params.timeLimit * 60
						 	clock.setTime(min)
						 	clock.start()
						})
					});
				});

			}
	};

});
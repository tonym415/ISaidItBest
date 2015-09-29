define(['jquery'], function($){
	String.prototype.capitlize = function(){
		return this.toLowerCase().replace( /\b\w/g, function(m){
			return m.toUpperCase();
		});
	};

// return the app object with var/functions built in
	return {
		engine : "../ISaidItBest/assets/cgi-bin/testv2.py",
		submitParameters : function(){
				errorMessage = "Invalid parameters: \n"
				validParams = true
				params = {"function": "loadCategoryQuestions"}
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
						$("#game").append("<img id='searchImg' src='../ISaidItBest/assets/images/search1.gif' />");
						$("#successNotice").fadeOut(5000,function(){
							// when the success notice fades 
							$("#searchingNotice").hide()
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
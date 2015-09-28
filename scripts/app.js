var engine = "./scripts/test.py"
var clock 
$(document).ready(function(){
	// debugging validations only NOT FOR PRODUCTION
	// $.validator.setDefaults({
	// 	debug: true,
	// 	success: "valid"
	// });

	//form validations
	var container = $("#errors")
	$("#login").validate({
		dubug: true,
		submitHandler: function(form){
			user = $("#username").val()
			pass = $("#password").val()
			if (user == "user" && pass == "password"){
				window.location.assign("game.html")
			}
		},
		errorContainer: container,
		errorLabelContainer: $("ol", container ),
		wrapper: "li",
		messages: {
			user: {
				required: " (required)",
				minlength: " (must be at least 3 characters)"
			},
			password: {
				required: " (required)",
				minlength: " (must be between 5 and 12 characters)",
				maxlength: " (must be between 5 and 12 characters)"
			}
		}
	});

	$("#signup").validate()
	$("#accordion").accordion({ heightStyle: 'content', collapsable: true});

	// timer instantiation
	clock = $('.countdown_timer').FlipClock({
		autoStart: false,
		countdown: true,
		clockFace: 'MinuteCounter'
	});

	$("input[type=button]").button();	

	$(".sel").selectmenu({ 
		width: 200
	});

	$("#subCategory").selectmenu({ 
		disabled: true
	});


	$(".category").selectmenu({ 
		change: function(){
			value = $(this).val();
			$("#subCategory")
				.selectmenu("enable")
				.empty()

				$.ajax({
					contentType: "application/x-www-form-urlencoded",
					data: {"function": "loadCategoryQuestions", "category" : value},
					type: "POST",
					url: engine 
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
				.always(function() { console.log('getJSON request ended!'); });
		}
	});
});

function submitCredentials(){
	user = $("#username").val()
	pass = $("#password").val()
	if (user == "user" && pass == "password"){
		window.location.assign("game.html")
	}else{
		alert("Username and Password information incorrect!!!")
		$("#username").val("")
		$("#password").val("")
	}
};


function submitParameters(){
	errorMessage = "Invalid parameters: "
	validParams = false
	params = {"function": "loadCategoryQuestions"}
	$("select").each(function(){
		selectedValue = $(this).val()
		selectedText = $(this).find(":selected").text()
		// test for valid parameter values
		// TODO: Add jquery validator 
		if (selectedValue == "---"){
			errorMessage += " Invalid parameter values (" + selectedValue + ")"
			return false
		}else{
			id = $(this).context.id
			params[id] = selectedValue 
			params[id + "_text"] = selectedText 
			validParams = true
		}
	})
	// debug statment
	console.log(params)

	if (!validParams){
		alert(errorMessage)
		return false
	}

	// send data to serverside script
	$.ajax({
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		data: params,
		type: "POST",
		url: engine
	})
	.done( function(result) { console.log("success"); console.log(result)})
	.fail( function(request, error) { console.log("Error"); console.log(request)});

	loadDebate(params)
};

function loadDebate(data){
 	$(".countdown_timer").hide()
 	$("#debate").hide()
	$("#ui-id-2").click();
	// TODO: notify user of submission status (success/fail)
	$("#successNotice").fadeIn(1000, function(){
		// notify user of the search for a game
		 $("#searchingNotice").fadeIn(1000,function(){
			$("#game").append("<img id='searchImg' src='images/search1.gif' />");
			$("#successNotice").fadeOut(5000,function(){
				// when the success notice fades 
				$("#searchingNotice").hide()
				$("#searchImg").remove()
			 	$("#debate").show()
			 	$(".countdown_timer").show()
			 	//set game criteria
			 	$("#question").text(params.subCategory_text)
			 	// set clock based on time limit parameter
			 	min = params.timeLimit * 60
			 	clock.setTime(min)
			 	clock.start()
			})
		});
	});

}
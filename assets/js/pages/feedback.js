/*
	Handles js interaction for the feedback page
 */
require(['jquery','app' , 'validate','jqueryUI'], function($, app){
	app.init('feedback');

	// load catagories for feedback
	(function(){
		$.ajax({
			data: {'function': "FBC", 'id': 'feedback_categories'},
			url: app.engine,
			type: 'POST',
			dataType: 'json',
			desc: 'utility (load metadata)',
			success: function(results){
				// load question selectmenu
				$('#category')
					.empty()
					.append(new Option("None", "0"));
				$.each(results, function(){
					$('#category')
						.append(new Option(this.value, this.id))
						.val("0")
						.selectmenu('refresh')
				});
			}
		});
	})();

	// custom validation for category box...give user another chance to choose before submission
	function confirmCategory(valid){
		// override validation of category field
		if (categoryValid){
			valid = categoryValid;
		}
		if (!valid){
			var validator = $('form').validate();
			validator.showErrors({
				'category' : "Please select a category"
			});
			msgOpt = {
				buttons: {
					Yes: function(){
						categoryValid = true;
						validator.resetForm();
						$(this).dialog('close');
						$('form').submit();
						$(this).dialog('destroy');
					},
					No: function(){
						$(this).dialog('destroy');
					}
				}
			};

			title = "Message Category";
			message = "Are you sure you can't find a category to describe your message";
			settings = $.extend({}, app.mboxDefaults(title, message), msgOpt);
			$('<div id="confirmChoice" />').dialog(settings);

		}
	}

	// validate signup form on keyup and submit
	// calls submitFeedback on valid()
	var categoryValid = false;
	$("#frmFeedback").validate({
		submitHandler: function(){
			formData = $(this.currentForm).serializeForm();
			formData.function = "FB";
			submitFeedback(formData);
		},
		rules: {
			category: {
				required: {
					depends: function(element){
						// validate value
						var invalidValue = "0",
						currentValue = $(element).val(),
						valid = invalidValue != currentValue;

						// if not valid...are you sure?
						if (!categoryValid){
							confirmCategory(valid);
						}else{
							valid = categoryValid;
						}
						return valid;
					}
				}
			},
			name: "required",
			email: {
				required: true,
				email: true
			},
			message: {
				required: true,
				minlength: 2
			}
		},
		messages: {
			category: "Please select a category",
			name: "Please enter your name",
			message: "Please enter your message",
			email: {
				required: "Please enter a valid email address",
				email: "Your email address must be in the format of name@domain.com"
			}
		}
	});

	/**
	 *  Submits an ajax call to send signup info to the database
	 *
	 *  @method submitFeedback
	 */
	 function submitFeedback(data){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
			desc: "Submit User request for feedback",
			data: data,
			type: "POST",
			url: app.engine
		})
		.done(function(results){
			// internal error handling
			if ('error'  in results){
				var validator = $("#frmFeedback").validate();
				validator.showErrors({
					"message": results.error
				});
			}else{
				app.dMessage(results.title, results.message);
			}
		});
	 }

});

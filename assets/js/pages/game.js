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
	'cookie'
	], function($, app){
		// if not logged in send to login page
		user = app.getCookie('user');
		if (user === undefined){
			window.location.assign(app.pages.home);
		}

		// handle page setup upon arrival
		app.createNavBar();

		// Page Stylings
		$("#accordion").accordion({ heightStyle: 'content', collapsable: true});
		$("input[type=submit]").button();
		$(".sel").selectmenu({ width: 200 });
		// $("#paramQuestions").selectmenu({ disabled: true });

		// load category selectmenu
		app.getCategories(app);

	/**
	 * Clock instantiation
	 * @type {FlipClock}
	 */
		clock = $('.countdown_timer').FlipClock({
			autoStart: false,
			countdown: true,
			clockFace: 'MinuteCounter'
		});

    // validator selectmenu method
    $.validator.addMethod("selectNotEqual", function(value, element, param) {
        return param != value;
    });

	// set up parameter form validation
	$('#gameParameters').validate({
		debug: true,
		ignore: "",
		errorElement: 'span',
		errorClass: "field-validation-error",
		highlight: function (element, errorClass) {
            $(element).addClass("input-validation-error");
        },
        unhighlight: function (element, errorClass) {
            $(element).removeClass("input-validation-error");
        },
		errorPlacement: function (error, element) {
		   error.insertAfter($('span[errorfor="' + element.attr("name") + '"]'));
	    },
		invalidHandler: function (form, validator) {
           $.each(validator.errorList, function (index, value) {
               if (value.element.nodeName.toLowerCase() == 'select') {
                   $(value.element).next('span').addClass("input-validation-error");
               }
           });
        },
		submitHandler: function(){
			vals = $(this.currentForm).serializeForm();
			app.dMessage(app, 'Values', app.prettyPrint(vals));
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
	function primeQBox(element){
		catID = $(element).val();
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
			// // add validation
			// $(this).closest('form').validate();
			// $(this).rules("add", {
			// 	selectNotEqual : "",
			// 	messages: {
			// 		selectNotEqual: "Please choose a subcategory"
			// 	}
			// });

			// initialize selectmenu
			$(this).selectmenu({
				width: 200,
				change: function(){
					// load appropriate questions for selection
					primeQBox("#" + $(this).prop('id'));

					// validate select
					// $(this).closest('form').validate().element(this);
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
					if (boolSubs) subCheck($(this));

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
						subCheck(select);
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

	function subCheck(element){
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
			app.dMessage(app, title, msg);
		}
	}
});

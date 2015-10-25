/*
	Handles js interaction for the signup page
 */
require(['jquery','app', 'jqGrid','adminLib', 'validate','jqueryUI', 'livequery'], function($, app, jqGrid, lib){
	var objCategories,
		loadCategories,
		editor,
		userGrid,
		getCategories,
		valHandler,
		dMessage;

	// create counter for sub-category templates
	$('#subCatTemplate').data("tempCount",0);

	// page setup
	app.createNavBar();
	$("input[type=submit], input[type=button]").button();

	// global messagbox
	var msgBox = app.msgBox($('#dialog-message'));
	dMessage = app.dMessage;

	function submitInfo(data, desc){
		$.ajax({
			contentType: "application/x-www-form-urlencoded",
			desc: desc,
			data: data,
			type: "POST",
			url: app.engine
			})
			.done(function(result){
				if (typeof(result) !== 'object'){
					try {
						result = JSON.parse(result)[0];
					}catch(err){
						msg = "<h2>Stack Trace:</h2><p>" + err.stack + "</p><h2>Ajax Result:</h2><p>" + result + "</p>";
						dMessage(app, "Error: " + err, msg);
						console.log(err);
					}
				}
				// internal error handling
				if (result.hasOwnProperty('error')){
					msg = "<h2>Error:</h2><p>" + result.error.error + "</p><h2>Message:</h2><p>" + result.error.stm + "</p>";
					dMessage(app, "Error", msg);
					console.log(result.error);
				}else{
					switch (data.function){
						case "AC":
							dMessage(app, "Success", "Category Adopted");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#adoptCategory'));
							break;
						case "DC":
							dMessage(app, "Success", "Category Removed");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#deleteCategory'));
							break;
						case "RC":
							dMessage(app, "Success", "Category Renamed");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#renameCategory'));
							break;
						case "CC":
							dMessage(app, "Success", "Category Added");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#createCategory'));
							break;
						case "GAU":
						case "UU":
							userGrid.trigger('reloadGrid');
							editor.dialog("close");
							break;
						case "CQ":
							dMessage(app, "Success", "Question Added");
							resetForm($('#createQuestion'));
							break;
					}
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				dMessage(app, 'Request Failed', textStatus + ' ' + errorThrown);
				console.log('request failed! ' + textStatus);
			});
		}

	function resetForm(form){
		form.children('.orig')
			.find(':checkbox').trigger('click')
			.find('select').selectmenu('value', '')
			.find('input[type=text]').val('')
			.find('textarea').val('');
		attachValidator(form.prop('id'));
	}

	/* Validation of forms */
	valHandler = function(){
		formData = $(this.currentForm).serializeForm();
		formID = formData.id;
		formData['function'] = lib.formManager[formID].abbr;
		submitInfo(formData, lib.formManager[formID].desc);
		return false;
	};

	// validator defaults
	$.validator.setDefaults({
		debug: true,
		wrapper: 'li',
		ignore: "",
        errorPlacement: function(error, element){
            error.appendTo(element.closest('form').children('.errors'));
        }
	});

	function formLoad(e, ui){
		panel = (ui.newPanel === undefined) ? ui.panel : ui.newPanel;
		// find forms for tab
		available_forms = panel.children().find('form');
		$.each(available_forms, function(){
			formName = $(this).prop('id');
			attachValidator(formName);
		});
	}

	function attachValidator(formName){
		// add validators for forms in manager
		mgrObj = lib.formManager[formName];
		// if a manager object exists for the current form
		if (mgrObj){
			formValidator = mgrObj.validator;
			if (formValidator !== undefined){
				// create validator
				$("#" + formName).validate(formValidator);
				// add submitHandler to form validator
				$("#" + formName).data('validator').settings.submitHandler = valHandler;
			}
		}
		$(this).on('submit', function(){
			event.preventDefault();
			return false;
		});
	}

	$( "[id$=tabs]" ).tabs({
		width: 650,
		create: formLoad,
		activate: formLoad
	});

	$( "[id$=Accordion]" ).accordion({
		width: 550,
		animate: "easeInOutQuint",
		heightStyle: 'content',
		collapsible: true,
		active: false
	});

	// set a watch for additions/removal on the dom for select boxes (not including template)
	$("select[id*=Question]")
		.livequery(function(){
			// add validation
			$(this).closest('form').validate();
			$(this).rules("add", {
				selectNotEqual : "",
				messages: {
					selectNotEqual: "Please choose a subcategory"
				}
			});

			// initialize selectmenu
			$(this).selectmenu({
				width: 350,
				change: function(){
					$(this).closest('form').find('textarea[name$=Text]')
						.prop("disabled", false)
						.val($("option:selected", this).text());
				}
			});
		});

	// set a watch for additions/removal on the dom for select boxes (not including template)
	$("select[id*=Category]:not([id*=temp])")
		.livequery(function(){
			// add validation
			$(this).closest('form').validate();
			$(this).rules("add", {
				selectNotEqual : "",
				messages: {
					selectNotEqual: "Please choose a subcategory"
				}
			});

			// initialize selectmenu
			$(this).selectmenu({
				width: 200,
				change: function(){
					// validate select
					$(this).closest('form').validate().element(this);
					//  bind change event to all select menus to enable subcategory menu selection
			        boolSubs = $(this).siblings('input').prop("checked");
					// if sub-categories are requested
					if (boolSubs) subCheck($(this));

					// add events to load questions if appropriate
					prefix = $(this).prop('id').prefix();
					if (prefix === 'q_') getCatQuestions($(this).val());
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
						// check the id of the checkbox to see if it is a clone
						chkID = $(this).prop('id');

						// get all p tags that are not the original and do not contain the submit button
						cloneP = $(this).parent().siblings().not('p:has("input[type=submit]")').not('.orig');
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
		$.each(objCategories, function(idx, objCat){
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
        	dMessage(app, title, msg);
        }
	}

	getCategories = function(){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
			function: 'utility',
			data: {'function' : 'GC'},
			type: "POST",
			url: app.engine
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
				objCategories = result.categories;
				loadCategories();
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			dMessage(app, textStatus + ': request failed! ', errorThrown);
			console.log(textStatus + ': request failed! ' + errorThrown);
		});
	};
	getCategories();


	/**
	 * loads categories into appropriate selectmenu
	 * @param  {object} categories object containing all category data
	 * @return none
	 */
	loadCategories = function(){
		if (objCategories === undefined) {
			getCategories();
			return false;
		}
		// get all "Category" select menus
		menus = $('#tabs select[id$=Category]');
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

	getCatQuestions = function(catID){
		data = {'function' : 'GQ'};
		if (catID !== undefined) data.category_id = catID;
		$.ajax({
			contentType: "application/x-www-form-urlencoded",
			function: 'utility',
			data: data,
			type: "POST",
			url: app.engine
		})
		.done(function(result){
			if (typeof(result) !== 'object'){
				result = JSON.parse(result)[0];
			}
			// internal error handling
			if (result.error !== undefined){
				dMessage(app, result.error.error, result.error.msg);
				console.log(result.error);
				return result;
			}
			// load question selectmenu
			qList = $('#q_currentQuestion');
			qList.empty();
			$.each(result.questions, function(){
				qList.append($('<option />').val(this.question_id).text(this.question_text));
			});
		});
	};


	editor = $('#editor').dialog({
		dialogClass: "no-close",
		height: 500,
		minWidth: 450,
		autoOpen: false,
		modal: true,
		open: function(){
			$('form', this).trigger('focus');
		},
		show: {
	        effect: "blind",
	        duration: 500
	    },
	    hide: {
	        effect: "slideUp",
	        duration: 500
	    },
	    buttons: [{
			text: "Save",
	    	icons: {
	    		primary: "ui-icon-disk"
	    	},
	    	click: function(){
	    		$(this).find('form').trigger('submit');
	    	}
	    },{
			text: "Cancel",
	    	icons: { primary: "ui-icon-cancel" },
	    	click: function(){
	    		$(this).dialog("close");
	    	}
	    }]
	});

	// Grid options
	$.jgrid.no_legacy_api = true;
	$.jgrid.useJSON = true;

	logGrid = lib.getLogGrid("#logGrid");
	userGrid = lib.getUserGrid("#userGrid");
	userGrid.jqGrid('setGridParam', {
		onSelectRow: function(id, status, e){
			data = $(this).getRowData(id);
			editor.dialog("option","title", "Editing Details for: " + data.first_name + " " + data.last_name);
			$.each(data, function(key, value){
				element = $("input[id='" + key + "']");
				if (element.length > 0){
					if (element.prop('type') == 'checkbox'){
						element.prop('checked', (value == '1'));
					}else{
						element.val(value);
					}
				}
			});
			editor.dialog("open");
		}
	});

	$('#logGrid').jqGrid('navGrid', '#logpager', {add:false,edit:false,del:false});
	function gridResize(){
		logGrid.jqGrid('setGridWidth',  parseInt($(window).width()) - 40);
		userGrid.jqGrid('setGridWidth',  parseInt($(window).width()) - 40);
	}
	gridResize();
	$(window).resize(gridResize());

});

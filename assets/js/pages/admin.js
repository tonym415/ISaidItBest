/*
	Handles js interaction for the signup page
 */
require(['jquery','app', 'jqGrid', 'validate','jqueryUI'], function($, app, jqGrid){
	var objCategories,
		loadCategories,
		editor,
		userGrid,
		getCategories,
		valHandler,
		dMessage,
		msgBox;

	// page setup
	app.createNavBar();
	$("input[type=submit]").button();
	$( "[id$=tabs]" ).tabs(); //.addClass( "ui-tabs-vertical ui-helper-clearfix" );
	$( "[id$=Accordion]" ).accordion({
		animate: "easeInOutQuint",
		heightStyle: 'content',
		collapsible: true,
		active: false
	});
	// create counter for sub-category templates
	$('#subCatTemplate').data("tempCount",0);

	msgBox = $( "#dialog-message" ).dialog({
		minHeight: 350,
		maxHeight: 500,
		minWidth: 450,
		maxWidth: 600,
		autoOpen: false,
		dialogClass: 'no-close',
		modal: true,
		open: function(){
			icon = '<span class="ui-icon ui-icon-circle-zoomout" style="float:left; margin:0 7px 5px 0;"></span>';
			$(this).parent().find("span.ui-dialog-title").prepend(icon);
		},
		buttons: {
			Ok: function(){ $(this).dialog("close"); }
		}
    });


	dMessage = function(title, message){
		title = (title === undefined) ? "Error" : title;
		message = (message === undefined) ? "Sub-category not found" : message;
		msgBox.dialog('option','title', title);
		$('#message').html(message);
		msgBox.dialog('open');
	};

	// bind select menus
	$('p').on("change","select[id$=Category]:not([id*=temp])", setSelectEvents);
	$('p').on("change","input[id$=CategoryChk]", setChkEvents);

	function setSelectEvents(event){
		// get all selectmenus except template
		$("select[id$=Category]:not([id*=temp])").selectmenu({
			width: 200,
			change: function(){
				//  bind change event to all select menus to enable subcategory menu selection
		        boolSubs = $(this).siblings('input').prop("checked");
				// if sub-categories are requested
				if (boolSubs){ subCheck($(this)); }
			}
		});
	}
	setSelectEvents();

	// bind chkboxes
	function setChkEvents(){
		$("input[id$=CategoryChk]").change(function(){
			if($(this).is(':checked')){
				var select = $(this).siblings('select');
				subCheck(select);
			}
		});
	}
	setChkEvents();

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

        	// get the parent paragraph element
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
        		// get the id ov the current element
        		var elID = $(this).prop('id');
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
	        			elID = elID.replace(elID.prefix(), element_id_prefix) + index;
	        			// add new option to select menu based on parent id
	        			$(this)
							.empty()
							.append(new Option("None", "---"));
							tmpSelect = $(this);
							$.each(catCollection, function(idx, objCat){
								cat = objCat.category;
								id = objCat.category_id;
								tmpSelect.append(new Option(cat, id));
							});
							break;
					case 'checkbox':
	        			elID = elID.replace(elID.prefix(), element_id_prefix) + index;
	        			break;
	        		default:
	        			changeID = false;
        		}
        		// only change the id of necessary elements
        		if (changeID)  $(this).prop("id", elID);
        	});
        	element.parent().after(clone);

        	// add events
        	setSelectEvents();
        	setChkEvents();
        }else{
        	// category is top-level
        	msg = "No Sub-category found for: " + current_selection;
        	title = (element_is_top) ? " is a top-level category!" : " has no sub-categories";
        	title += current_selection + title;
        	dMessage(title, msg);
        }
	}

	getCategories = function(){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
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
				// console.log("Get: " + JSON.stringify(objCategories))
				loadCategories();
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
		.always(function() { app.hideLoading(); });
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
				.append(new Option("None", "---"));
			element = $(this);
			$.each(objCategories, function(idx, objCat){
				parentID = objCat.parent_id;
				cat = objCat.category;
				id = objCat.category_id;
				// get top level categories
				if (parentID === null){
					element.append(new Option(cat, id));
				}
			});
			$(this).selectmenu("refresh");
		});

	};

	editor = $('#editor').dialog({
		dialogClass: "no-close",
		height: 500,
		minWidth: 450,
		autoOpen: false,
		modal: true,
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
	    		app.showLoading();
	    		$(this).find('form').submit();
	    	}
	    },{
			text: "Cancel",
	    	icons: { primary: "ui-icon-cancel" },
	    	click: function(){
	    		$(this).dialog("close");
	    	}
	    }]
	});

	function loadEditor(data){
		console.log(data);
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
	// Grid options
	$.jgrid.no_legacy_api = true;
	$.jgrid.useJSON = true;

	userGrid = $("#jqGrid").jqGrid({
		url: app.engine + "?function=GAU",
		contentType: "application/json",
		datatype: "json",
		jsonReader: {
			root: "records",
			id: "user_id",
			repeatitems: false
		},
		 colModel: [
			{ label: 'User ID', name: 'user_id', width: 50, formatter: "integer", align: "center"},
			{ label: 'First Name', name: 'first_name', width: 75, align: "center" },
			{ label: 'Last Name', name: 'last_name', width: 90, align: "center" },
			{ label: 'User Name', name: 'username', width: 90, align: "center" },
			{ label: 'Email', name: 'email', width: 90, formatter: "email", align: "center" },
			{ label: 'Credit', name: 'credit', width: 50, formatter: "currency", formatoptions: {prefix: "$", thousandsSeparator: ",", decimalPlaces: 2}, align: "center"},
			{ label: 'Role', name: 'role', width: 50, align: "center" },
			{ label: 'Created', name: 'created', width: 100, formatter: "date", formatoptions: { srcformat: 'Y-m-d H:i:s', newformat: 'd-M-Y'}, align: "center"},
			{ label: 'Wins', name: 'wins', width: 30, formatter: "integer", align: "center"},
			{ label: 'Losses', name: 'losses', width: 30, formatter: "integer", align: "center"},
			{ label: 'Active', name: 'active', width: 30, formatter: "checkbox", align: "center"},
			{ label: 'Active', name: 'active', width: 3, hidden: true}
		],
		loadError:function(xhr,status, err){
			try {
				$.jgrid.info_dialog($.jgrid.errors.errcap,'<div class="ui-state-error">'+ xhr.responseText +'</div>', $.jgrid.edit.bClose,
				{buttonalign:'right'});
			} catch(e) {
				alert(xhr.responseText);}
		},
		loadonce: true,
		height: "auto",
		width: "auto",
		viewrecords: true, // show the current page, data rang and total records on the toolbar
		rowNum: 30,
		rownumbers: true,
		autoencode: true,
		ignoreCase: true,
		shrinkToFit: false,
		// pager: "#jqGridPager"
		defaults : {
			recordtext: "View {0} - {1} of {2}",
		        emptyrecords: "No records to view",
			loadtext: "Loading...",
			pgtext : "Page {0} of {1}"
		},
		onSelectRow: function(id, status, e){
			rowData = $(this).getRowData(id);
			loadEditor(rowData);
		}
	});
	//.addClass( "ui-tabs-vertical ui-helper-clearfix" );
    // $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

   function submitInfo(data){
	 	$.ajax({
			contentType: "application/x-www-form-urlencoded",
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
				console.log(result.error);
				// var validator = $("#signup").validate();
				// validator.showErrors({
				// 	"paypal_account": result.error
				// });
			}else{
				switch (data.function){
					case "GAU":
					case "UU":
						userGrid.trigger('reloadGrid');
					editor.dialog("close");
				}
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
		.always(function() { app.hideLoading(); });
	 }

    /* Validation of forms */
	valHandler = function(){
		funcName = "";
		formData = $(this.currentForm).serializeForm();
		formID = $(this.currentForm).prop('id');
		switch (formID){
			case 'update':
				funcName = "UU";
				break;
			default:
				funcName = "GAU";
		}
		formData['function'] = funcName;
		submitInfo(formData);
	};

	$('#update').validate({
		submitHandler: valHandler,
		rules: {
			first_name: "required",
			last_name: "required",
			username: {
				required: true,
				minlength: 3
			},
			email: {
				required: true,
				email: true
			},
			messages: {
				first_name: "Please enter your first name",
				last_name: "Please enter your last name",
				username: {
					required: "Please enter a username",
					minlength: "Your username must consist of at least 3 characters"
				},
				email: {
					required: "Please enter a valid email address",
					email: "Your email address must be in the format of name@domain.com"
				}
			}
		}
	});

	loadCategories();
});

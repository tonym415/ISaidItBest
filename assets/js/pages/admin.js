/*
	Handles js interaction for the signup page
 */
require(['jquery','app', 'jqGrid', 'validate','jqueryUI'], function($, app, jqGrid){
	var objCategories,
		loadCategories,
		editor,
		userGrid,
		valHandler

	// page setup
	app.createNavBar()

	$("input[type=submit]").button();
	$("select").selectmenu({width: 200});

	$( "[id$=tabs]" ).tabs()//.addClass( "ui-tabs-vertical ui-helper-clearfix" );
	$( "[id$=Accordion]" ).accordion({
		animate: "easeInOutQuint",
		heightStyle: 'content',
		collapsible: true,
		active: false
	});

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
				console.log(result.error)
				return result;
			}else{
				objCategories = result['categories'];
				// console.log("Get: " + JSON.stringify(objCategories))
				loadCategories()	
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })
		.always(function() { app.hideLoading(); });
	};
	getCategories()

	/**
	 * loads categories into appropriate selectmenu 
	 * @param  {object} categories object containing all category data 
	 * @return none 
	 */
	function loadCategories(){
		if (objCategories === undefined) { 
			objCategories = getCategories()
		} 
		// get all "Category" select menus
		menus = $('#tabs select[id$=Category]');
		$.each(menus, function(){
			$(this)
				.empty()
				.append(new Option("None", "---"))
			element = $(this);
			$.each(objCategories, function(idx, objCat){
				parent = objCat.parent_category;
				cat = objCat.category;
				id = objCat.category_id;
				// get top level categories
				if (parent == null){
					element.append(new Option(cat, id))
				}
			});
			$(this).selectmenu("refresh")
		})
		
	}

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
	    		$(this).find('form').submit()
	    	}
	    },{
			text: "Cancel",
	    	icons: { primary: "ui-icon-cancel" },
	    	click: function(){
	    		$(this).dialog("close")
	    	}
	    }]
	});

	function loadEditor(data){
		console.log(data)
		editor.dialog("option","title", "Editing Details for: " + data.first_name + " " + data.last_name)
		$.each(data, function(key, value){
			element = $("input[id='" + key + "']")
			if (element.length > 0){ 
				if (element.prop('type') == 'checkbox'){
					element.prop('checked', (value == '1'))
				}else{
					element.val(value) 
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
			rowData = $(this).getRowData(id)
			loadEditor(rowData)
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
				console.log(result.error)
				// var validator = $("#signup").validate();
				// validator.showErrors({
				// 	"paypal_account": result.error
				// });
			}else{
				switch (data.function){
					case "GAU":
					case "UU":
						userGrid.trigger('reloadGrid');
						editor.dialog("close")
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
				funcName = "UU"
				break;
			default:
				funcName = "GAU"
		}
		formData['function'] = funcName
		submitInfo(formData)
	}

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

	loadCategories()
});
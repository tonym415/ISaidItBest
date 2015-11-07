/*
	Handles js interaction for the signup page
 */
require([
	'app',
	'adminLib',
	'jqGrid',
	'jquery',
	'jqueryUI',
	'validate',
	'livequery',
	], function(app, lib, jqGrid){

	// page setup
	app.init('admin');

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
						app.dMessage("Error: " + err, msg);
						console.log(err);
					}
				}
				// internal error handling
				if (result.hasOwnProperty('error')){
					msg = "<h2>Error:</h2><p>" + result.error.error + "</p><h2>Message:</h2><p>" + result.error.stm + "</p>";
					app.dMessage("Error", msg);
					console.log(result.error);
				}else{
					switch (data.function){
						case "AC":
							app.dMessage("Success", "Category Adopted");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#adoptCategory'));
							break;
						case "DC":
							app.dMessage("Success", "Category Removed");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#deleteCategory'));
							break;
						case "RC":
							app.dMessage("Success", "Category Renamed");
							objCategories = result.categories;
							loadCategories();
							resetForm($('#renameCategory'));
							break;
						case "CC":
							app.dMessage("Success", "Category Added");
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
							app.dMessage("Success", "Question Added");
							resetForm($('#createQuestion'));
							break;
					}
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				app.dMessage('Request Failed', textStatus + ' ' + errorThrown);
				console.log('request failed! ' + textStatus);
			});
		}

	function resetForm(form){
		form.children().not('.clone')
			.find(':checkbox').prop('checked', false)
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
		activate: formLoad,
		heightStyle: 'fill'
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

					// check to see if clones are present
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
					if (boolSubs) app.subCheck($(this));

					// add events to load questions if appropriate
					prefix = $(this).prop('id').prefix();
					if (prefix === 'q_') {
						// clear previous selections
						q_txt = $('#q_editText').val('');
						$('#q_currentQuestion')
							.empty()
							.append(new Option('None',""))
							.selectmenu('destroy')
							.selectmenu({width: 200, style: 'dropdown' });
							app.getCatQuestions($(this).val(), '#q_currentQuestion');
					}
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
						app.subCheck(select);
					}else{
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

	// Grid options
	$.jgrid.no_legacy_api = true;
	$.jgrid.useJSON = true;

	logGrid = $("#logGrid").jqGrid(lib.getGrid("#logGrid"));
	userGrid = $("#userGrid").jqGrid(lib.getGrid("#userGrid"));

	logGrid.jqGrid('navGrid', '#logPager', { search: true, edit: false, add: false, del: false, refresh: true },{},{},{},{multipleSearch: true, showQuery: true});
	userGrid.jqGrid('navGrid', '#userPager', { search: true, edit: true, add: false, del: true, refresh: true },{height: 320, reloadAfterSubmit: true},{},{height: 320, reloadAfterSubmit: true},{multipleSearch: true, showQuery: true});

	(function grpLog(){
		var colModel = $('#logGrid')[0].p.colModel;
		$('#logColumns')
			.empty()
			.append(new Option("None", "clear"))
			.selectmenu({
				width: 200,
				change: function(){
					var vl = $(this).val();
					if(vl) {
						if(vl == "clear") {
							logGrid.jqGrid('groupingRemove',true);
						} else {
							logGrid.jqGrid('groupingGroupBy',vl);
						}
					}
				}
			});
			element = $('#logColumns');
			$.each(colModel, function(idx, mod){
				element.append(new Option(mod.label, mod.name));
			});
	})();

	// handle grid resizing
	$(window).on('resize', function(){
		$('[id*=Grid').jqGrid('setGridWidth',  parseInt($(window).width()) - 40);
	});

});

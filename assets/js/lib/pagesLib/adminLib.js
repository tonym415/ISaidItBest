define(['jquery', 'app'], function($, app) {
    /*
    * multi-form managment object
    */
    var formManager = {
        "createCategory" :{
            abbr: "CC",
            desc: "Create Category",
            validator: {
                rules: { c_Category: 'required' },
                messages: { c_Category: "Please enter your new category name"}
            }
        },
        "renameCategory" :{
            abbr: "RC",
            desc: "Rename Category",
            validator: {
                rules: {
                    r_currentCategory: { selectNotEqual: "" },
                    r_newCategory: 'required'
             },
                messages: {
                    r_currentCategory: "Please choose the category",
                    r_newCategory: 'Enter a new name for the selected category'
                }
            }
        },
        "deleteCategory" :{
            abbr: "DC",
            desc: "Delete Category",
            validator: {
                rules: {
                    d_Category: { selectNotEqual: "" }
                },
                messages: { selectNotEqual: "Select a category to delete"}
            }
        },
        "adoptCategory" :{
            abbr: "AC",
            desc: "Category Association",
            validator: {
                rules: {
                    a_Category: { selectNotEqual: "" },
                    a_parentCategory: { selectNotEqual: "" }
                },
                messages: {
                    a_Category: "Select a category to be associated",
                    a_parentCategory: "Select a parent category"
                }
            }
        },
        "createQuestion" :{
            abbr: "CQ",
            desc: "Create Question",
            validator: {
                rules: {
                    q_Category: { selectNotEqual: "" },
                    q_text: 'required'
                },
                messages: {
                    q_Category: "Select a category to assign question",
                    q_text: "Enter question"
                }
            }
        },
        "update" :{
            abbr: "UU",
            desc: "Update User information",
            validator: {
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
            }
        }
    };

    gridDefaults = {
        loadError:function(xhr,status, err){
            try {
               app.dMessage("Error loading Users", '<div class="ui-state-error">'+ xhr.responseText +'</div>');
            } catch(e) {
               alert(xhr.responseText);}
       },
       datatype: 'json',
       rowNum: 10,
       rowList: [10, 25, 50, 100, 200, 500],
       gridview: true,
       autoencode: true,
       viewrecords: true, // show the current page, data rang and total records on the toolbar
       rownumbers: true,
       toppager: true,
       regional: 'en',
       height: 325,
       shrinkToFit: true,
       autoWidth: true,
       gridModal: true,
       hiddengrid: true,
       jqModal: true
    };

    gridOptions = {
        logGrid: {
            url: app.engine + "?function=GL",
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                id: "log_id",
                repeatitems: true
            },
            // colNames: ['ID','User', 'Desc','Action','Result','Detail','When?'],
            colModel: [
               {label: 'ID', name: 'log_id', key: true, width: 30, index: "log_id"},
               {label: 'User', name: 'username', index: 'username', width: 75, search: true},
               {label: 'Desc', name: 'description', index: 'description', width: 150, search: true},
               {label: 'Action', name: 'action', index: 'action', width: 150, search: true},
               {label: 'Result', name: 'result', index: 'result', width: 150, search: true},
               {label: 'Detail', name: 'detail', index: 'detail', width: 150, search: true},
               {label: 'When?', name: 'datetime', index: 'datetime', width: 100, searchoptions:{dataInit:function(el){$(el).datepicker({dateFormat:'yy-mm-dd'});} }},
           ],
           grouping: true,
           rowNum: 25,
           sortname: 'datetime',
           sortorder: 'desc',
           groupingView: {
               groupField: ['datetime'],
               groupColumnShow : [true],
               groupText : ['<b>{0} - {1} Item(s)</b>'],
               groupCollapse : true,
               groupOrder: ['desc']
           },
           toppager: false,
           pager: $("#logPager")
        },
        userGrid: {
            url: app.engine + "?function=GAU",
            caption: "User Manager",
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                id: "user_id",
                repeatitems: true
            },
            colNames: [
                'User ID',
                'First Name',
                'Last Name',
                'User Name',
                'Email',
                'Credit',
                'Role',
                'Created',
                'Wins',
                'Losses',
                'Active'
            ],
            colModel: [
               {name: 'user_id', key:true, width: 50,  align: "center",editable: false, editoptions:{readonly: true, size: 20}},
               {name: 'first_name', width: 75, align: "center",editable: true,sortable: true, sorttype: 'text',  editoptions:{size: 20}},
               {name: 'last_name', width: 90, align: "center",editable: true,sortable: true, sorttype: 'text', editoptions:{size: 20} },
               {name: 'username', width: 90, align: "center",editable: true,sortable: true, sorttype: 'text', editoptions:{size: 20} },
               {name: 'email', width: 90, formatter: "email", align: "center",editable: true, editoptions:{size: 20} },
               {name: 'credit', width: 50, formatter: "currency", formatoptions: {prefix: "$", thousandsSeparator: ",", decimalPlaces: 2}, align: "center",editable: true, editoptions:{size: 20}},
               {name: 'role', width: 50, align: "center", sortable: true, sorttype: 'text', editable: true, edittype: "select", editoptions:{value:"1:admin;2:user"} },
               {name: 'created', width: 100, align: "center",editable: false, editoptions:{size: 20, readonly: true}},
               {name: 'wins', width: 30,  align: "center",editable: true, editoptions:{size: 20}},
               {name: 'losses', width: 30, align: "center",editable: true, editoptions:{size: 20}},
               {name: 'active', width: 30, align: "center",editable: true, formatter: "checkbox", formatoptions: { disabled: false},
            edittype: "checkbox", editoptions: {value: "Yes:No", defaultValue: "Yes"},
            stype: "select", searchoptions: { sopt: ["eq", "ne"],
                value: ":Any;1:Yes;0:No" } }
           ],
           sortname: 'created',
           sortorder: 'desc',
           groupingView: { groupField: ['role']},
           editurl: app.engine + '?function=UU',
           pager: "#userPager"
       }
    };
   function getGrid(element){
        gridName = element.substring(1);
        // get a copy of defaults to modify
        gDefaults = $.extend(true, {}, gridDefaults);
        gridSettings = $.extend(gDefaults, gridOptions[gridName]);
        return gridSettings;
   }

    return {
        formManager: formManager,
        getGrid: getGrid
    };
});

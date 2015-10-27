define(['jquery', 'app', 'validate','jqueryUI','jqGrid','locale'], function($, app) {
    var formManager;

    // validator methods
    $.validator.addMethod("selectNotEqual", function(value, element, param) {
        // , $.validator.format("Select box must not equal '{0}''")// return param != $(element).find('option:selected').text();
        return param != value;
    });

    /*
    * multi-form managment object
    */
    formManager = {
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

    function getUserGrid(element){
        var grid = $(element).jqGrid({
            url: app.engine + "?function=GAU",
            datatype: "json",
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
               {name: 'user_id', width: 50, formatter: "integer", align: "center"},
               {name: 'first_name', width: 75, align: "center" },
               {name: 'last_name', width: 90, align: "center" },
               {name: 'username', width: 90, align: "center" },
               {name: 'email', width: 90, formatter: "email", align: "center" },
               {name: 'credit', width: 50, formatter: "currency", formatoptions: {prefix: "$", thousandsSeparator: ",", decimalPlaces: 2}, align: "center"},
               {name: 'role', width: 50, align: "center" },
               {name: 'created', width: 100, align: "center"},
               {name: 'wins', width: 30, formatter: "integer", align: "center"},
               {name: 'losses', width: 30, formatter: "integer", align: "center"},
               {name: 'active', width: 30, formatter: "checkbox", align: "center"}
            //    { label: 'Active', name: 'active', width: 3, hidden: true}
           ],
           loadError:function(xhr,status, err){
               try {
                   $.jgrid.info_dialog($.jgrid.errors.errcap,'<div class="ui-state-error">'+ xhr.responseText +'</div>', $.jgrid.edit.bClose,
                   {buttonalign:'right'});
               } catch(e) {
                   alert(xhr.responseText);}
           },
           rowNum: 5,
           rowList: [10, 25, 50, 100],
           sortname: 'created',
           sortorder: 'desc',
           gridview: true,
           autoencode: true,
           viewrecords: true, // show the current page, data rang and total records on the toolbar
           rownumbers: true,
           toppager: true,
           regional: 'en',
           height: "%",
           shrinkToFit: true,
           autoWidth: true,
           gridModal: true,
           pager: "#userPager"
       });
       return grid;
   }

    function getLogGrid(element){
        var grid = $(element).jqGrid({
            url: app.engine + "?function=GL",
            datatype: "json",
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                id: "log_id",
                repeatitems: true
            },
            colNames: ['ID','User', 'Desc','Action','Result','Detail','When?'],
            colModel: [
               {name: 'log_id', width: 30, index: "log_id", search: true},
               {name: 'username', index: 'username', width: 75, search: true},
               {name: 'description', index: 'description', width: 150, search: true},
               {name: 'action', index: 'action', width: 150, search: true},
               {name: 'result', index: 'result', width: 150, search: true},
               {name: 'detail', index: 'detail', width: 150, search: true},
               {name: 'datetime', index: 'datetime', width: 100, searchoptions:{dataInit:function(el){$(el).datepicker({dateFormat:'yy-mm-dd'});} }},
           ],
           loadError:function(xhr,status, err){
               try {
                   dMessage(app,"Error loading Logs", '<div class="ui-state-error">'+ xhr.responseText +'</div>');
               } catch(e) {
                   alert(xhr.responseText);
               }
           },
           rowNum: 10,
           rowList: [10,20,50],
           sortname: 'datetime',
           sortorder: 'desc',
           gridview: true,
           autoencode: true,
           viewrecords: true, // show the current page, data rang and total records on the toolbar
           rownumbers: true,
           toppager: true,
           regional: 'en',
           height: 400,
           shrinkToFit: true,
           autoWidth: true,
           gridModal: true,
           pager: $("#logPager")
       });
       return grid;
   }
    return {
        formManager: formManager,
        getLogGrid: getLogGrid,
        getUserGrid: getUserGrid
    };
});

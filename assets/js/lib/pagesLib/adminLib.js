define(['jquery', 'app', 'validate'], function($, app) {
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
                    q_parentCategory: { selectNotEqual: "" }
                },
                messages: {
                    q_Category: "Select a category to be adopted",
                    q_parentCategory: "Select a parent category"
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

    function getGrid(element){
        var grid = $(element).jqGrid({
            mtype: "POST",
            url: app.engine + "?function=GAU",
            function: 'utility',
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
           }
       });
       return grid;
   }

    return {
        formManager: formManager,
        getGrid: getGrid
    };
});

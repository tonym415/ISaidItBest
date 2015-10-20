/* Validation of forms */
valHandler = function(){
    formData = $(this.currentForm).serializeForm();
    formID = formData.form_id;
    formData['function'] = formManager[formID].abbr;
    submitInfo(formData);
};

/*
* multi-form managment object
*/
formManager = {
    "createCategory" :{
        abbr: "CC",
        validator: {
            submitHandler: valHandler,
            rules: { c_category: 'required' },
            messages: { c_category: "Please enter your new category name"}
        }
    },
    "update" :{
        abbr: "UU",
        validator: {
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
        }
    }
};

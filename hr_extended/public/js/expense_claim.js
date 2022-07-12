frappe.ui.form.on("Expense Claim", {
    city: function(frm){
        frappe.call({
            method:'hr_extended.custom_expense_claim.get_tier',
            args:{city:frm.doc.city},
            callback: function(r){
                console.log(r.message)
                frm.set_value("city_category",r.message)
            }
        })
    },
    refresh: function(frm){
        frappe.call({
            method:'hr_extended.custom_expense_claim.set_cities',
            callback: function(r){
                frappe.meta.get_docfield('Expense Claim', 'city', frm.doc.name).options = r.message;
                frm.refresh_field('city')
        
            }
        })
        

        // frm.fields_dict['expenses'].grid.get_field("expense_type").get_query = function(doc, cdt, cdn) {
        //     return {
        //         filters: [
        //             ['Expense Claim Type', 'deferred_expense_account', '=', 1],

        //         ]
        //     }
        // }
    },
    employee: function(frm){
        frappe.call({
            method:'hr_extended.custom_expense_claim.set_filter',
            args:{grade:frm.doc.grade},
            callback: function(r){
                cur_frm.fields_dict['expenses'].grid.get_field('expense_type').get_query= function(doc,cdt,cdn)
                {
                    return{
                        filters:[
                            ['expense_type','in',r.message]
                        ]
                    }
                }
                
        
            }
        })
    },
    
})


frappe.ui.form.on("Expense Claim Detail",{
    expense_type: function(frm,cdt,cdn){
		var child = locals[cdt][cdn];
        console.log('//////////////',frm.doc.city_category)
    
        if (frm.doc.city_category != null){
        
        frappe.call({
            method:'hr_extended.custom_expense_claim.on_change_amt',
            args:{exp_type:child.expense_type,doc:frm.doc.city_category,child:child},
            callback: function(r){
                console.log(r.message)
                if (child.expense_type==r.message[1]) {
                    frm.fields_dict.expenses.grid.update_docfield_property("amount", "read_only", 1);
                child.amount=r.message[0]
                cur_frm.refresh_field('amount');
                cur_frm.refresh_field('expenses');
                frappe.msgprint("Full Claim Allowed.")
                    
                } else {
                    frm.fields_dict.expenses.grid.update_docfield_property("amount", "read_only", 0);
                cur_frm.refresh_field('amount');
                cur_frm.refresh_field('expenses');
                }
            
                
            }
        })
    }
    else{
        frappe.throw('Please Enter City First.')
    }
    
    },

    end_odo: function(frm,cdt,cdn){
        var child = locals[cdt][cdn];
        if (child.start_odo != null || ""  && child.end_odo != null || ""  ){
            frappe.call({
                method:'hr_extended.custom_expense_claim.distance',
                args:{s_odo:child.start_odo,e_odo:child.end_odo},
                callback: function(r){
                    console.log(r.message)
                    // frm.fields_dict.expenses.grid.update_docfield_property("distance_travelled", "read_only", 1);
                    child.distance_travelled=r.message;
                    cur_frm.refresh_field('distance_travelled');
                    cur_frm.refresh_field('expenses');
            
                }
            })

        }

        else{
            frappe.throw("Please Enter Both Start ODO and End ODO.")
        }

    },

    amount_per_distance: function(frm,cdt,cdn){
        var child= locals[cdt][cdn];
        frappe.call({
            method:'hr_extended.custom_expense_claim.amt_on_dist',
            args:{exp_type:child.expense_type,doc:frm.doc.city_category,amt:child.amount_per_distance,dist:child.distance_travelled},
            callback: function(r){
                console.log(r.message)
                frm.fields_dict.expenses.grid.update_docfield_property("amount", "read_only", 1);
                child.amount=r.message;
                cur_frm.refresh_field('amount');
                cur_frm.refresh_field('expenses');

                
            }
        })

    }
    
})



    
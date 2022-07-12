from numpy import s_
import frappe

@frappe.whitelist()
def get_tier(city):
    query =frappe.db.sql("""select parent from `tabCity Category Child Table` where city_name='{0}'
    """.format(city),as_dict=1)
    for i in query:
        return i.get("parent")


@frappe.whitelist()
def set_cities():
    lst=[""]
    query= frappe.db.sql("""select city_name from `tabCity Category Child Table`
    
    """,as_dict=1)
    for i in query:
        lst.append(i.get('city_name'))
    
    return lst

@frappe.whitelist()
def set_filter(grade):
    lst=[]
    a = frappe.db.sql("select allowed_expense_claim_type from `tabExpense Claim Type MS` where parent='{0}'".format(grade),as_dict=1)
    for i in a:
        lst.append(i.get('allowed_expense_claim_type'))
    return lst


@frappe.whitelist()
def fuel_amt(self,method):
    
    for i in self.expenses:
        if i.category == 'Fuel':
            i.amount=int(i.distance_travelled)*int(i.amount_per_distance)

        query = frappe.db.sql("select city_category, max_amt_alloweddailyfuel from `tabExpense Claim Type Table` where parent='{0}' and city_category='{1}'".format(i.expense_type,self.city_category),as_dict=1)
        # print('[]]]]]]]]]]]][]]]]]]]]',query)
        for j in query:
            if i.amount > int(j.get('max_amt_alloweddailyfuel')):
                frappe.throw('Maximum Allowed Amount Limit Exceeded in Row {}.'.format(i.expense_type))

        q = frappe.db.sql("select full_claim_allowed, max_amt_alloweddailyfuel from `tabExpense Claim Type Table` where parent='{0}' and city_category='{1}'".format(i.expense_type,self.city_category),as_dict=1)
        print('///////////',q)
        for k in q:
            if k.get('full_claim_allowed')==1:
                i.amount=k.get('max_amt_alloweddailyfuel')


@frappe.whitelist()
def city_once(self,method):
    lst=[]
    for i in self.expense_claim_type:
        lst.append(i.city_category)
    print('..................',len(lst),len(set(lst)))
    if len(lst) != len(set(lst)):
        frappe.throw('Duplicate City Category Not Allowed.')


@frappe.whitelist()
def on_change_amt(exp_type,doc):
    q = frappe.db.sql("select full_claim_allowed, max_amt_alloweddailyfuel,parent from `tabExpense Claim Type Table` where parent='{0}' and city_category='{1}'".format(exp_type,doc),as_dict=1)
    print(q)
    for k in q:
        if k.get('full_claim_allowed')==1:
            return [k.get('max_amt_alloweddailyfuel'),k.get('parent')]
        else:
            return True

    
@frappe.whitelist()
def distance(s_odo,e_odo):
    if int(s_odo) < int(e_odo):
        return int(e_odo) - int(s_odo)
    else:
        return frappe.throw("Start ODO cannot be greater than End ODO.")


@frappe.whitelist()
def amt_on_dist(exp_type,doc,amt,dist):
    q = frappe.db.sql("select full_claim_allowed, max_amt_alloweddailyfuel,parent from `tabExpense Claim Type Table` where parent='{0}' and city_category='{1}'".format(exp_type,doc),as_dict=1)
    for i in q:
        if i.get('full_claim_allowed')!=1 and exp_type=='Fuel' and amt != (None or ""):
            return int(amt)*int(dist)
        else:
            frappe.throw("Please Enter Amount Per Distance.")


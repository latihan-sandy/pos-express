module.exports = function (app) {

    let connection = app.get('connection');
    let pageName = "Sales";
    let routeName = "sales";
    let layouts = "pages/" + routeName;

    // Index
    app.get('/' + routeName, (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.render(layouts + '/index', {
                title: pageName,
                createUrl: "/" + routeName + "/create"
            });
        } else {
            res.redirect('/login');
        }
    });

    // Datatable
    app.post('/' + routeName + '/datatable', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            connection.query("SELECT COUNT(*) as total FROM transactions WHERE type_of = 1", function (err, rows, fields) {
                if (err) throw err;

                let totalRecords = parseInt(rows[0].total);
                let draw = req.param('draw');
                let row = req.param('start');
                let rowperpage = req.param('length');
                let columnIndex = req.param('order')[0]["column"];
                let columnName = req.param('columns')[columnIndex]['name'];
                let columnSortOrder = req.param('order')[0]['dir'];
                let searchValue = req.param('search')['value'];

                let action = '<a href="javascript:void(0);" target="_blank" data-route="' + req.protocol + '://' + req.get('host') + '/' + routeName + '/row_id" class="btn btn-success btn-sm btn-show"><i class="fa fa-search"></i></a>';
                action += '&nbsp;<a href="javascript:void(0);" target="_blank" data-route="' + req.protocol + '://' + req.get('host') + '/' + routeName + '/row_id/edit" class="btn btn-info btn-sm btn-edit"><i class="fa fa-edit"></i></a>';
                action += '&nbsp;<a href="javascript:void(0);"  data-route="' + req.protocol + '://' + req.get('host') + '/' + routeName + '/row_id" class="btn btn-danger btn-sm btn-delete"><i class="fa fa-trash"></i></a>';

                let sql = "SELECT DISTINCT";
                sql += " transactions.invoice_date as transactions_invoice_date, ";
                sql += " transactions.invoice_number as transactions_invoice_number, ";
                sql += " transactions.status as transactions_status, ";
                sql += " customers.name as customers_name, ";
                sql += " transactions.grandtotal as transactions_grandtotal, ";
                sql += " transactions.id as key_id, ";
                sql += " '" + action + "' as action ";

                let filter = " WHERE type_of = 1";
                if (searchValue && searchValue.length > 0) {
                    filter += " AND ";
                    filter += " transactions.invoice_date LIKE '%" + searchValue + "%' OR ";
                    filter += " transactions.invoice_number LIKE '%" + searchValue + "%' OR ";
                    filter += " customers.name LIKE '%" + searchValue + "%'";
                }
                sql += " FROM transactions LEFT JOIN customers ON customers.id = transactions.customer_id " + filter;

                connection.query(sql, function (err, result, fields) {
                    if (err) throw err;
                    let totalFiltered = result.length;
                    sql += " ORDER BY " + columnName + " " + columnSortOrder + " LIMIT " + rowperpage + " OFFSET " + row;
                    connection.query(sql, function (err, result_query, fields) {
                        if (err) throw err;
                        let response = {
                            "draw": draw,
                            "iTotalRecords": totalRecords,
                            "iTotalDisplayRecords": totalFiltered,
                            "aaData": result_query
                        }
                        res.send(response);
                    });
                });

            });
        } else {
            res.redirect('/login');
        }
    });

    // Create
    app.get('/' + routeName + '/create', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            connection.query("SELECT * from transactions WHERE DATE(invoice_date) = DATE(NOW()) AND type_of = 1 ORDER BY id DESC LIMIT 1", function (err, result, fields) {
                if (err) throw err;
                let dateIndex = new Date().toISOString().replace('-', '').split('T')[0].replace('-', '');
                let invoice_number = "SLS." + dateIndex + ".00001";
                let user_id = req.session.user.id;
                let dateTime = app.get('dateTime');
                let dt = dateTime.create();
                let formatted = dt.format('Y-m-d H:M:S');
                if (result.length > 0) {
                    let lastData = result[0];
                    let lastNumber = lastData.invoice_number;
                    let arrNumber = lastNumber.split(".");
                    let last_element = arrNumber[arrNumber.length - 1];
                    let next_element = parseInt(last_element) + 1;
                    let digit = 5;
                    let i_number = ("" + next_element).length;
                    for (i = digit; i > i_number; i--) {
                        next_element = "0" + next_element;
                    }
                    invoice_number = "SLS." + dateIndex + "." + next_element;
                }
                let data = {
                    type_of: 1,
                    status: 0,
                    invoice_number: invoice_number,
                    invoice_date: formatted,
                    customer_id: null,
                    customer_id: null,
                    user_id: user_id,
                    total_items: 0,
                    subtotal: 0,
                    discount: 0,
                    tax: 0,
                    grandtotal: 0,
                    cash: 0,
                    change: 0,
                    notes: null,
                    created_at: formatted,
                    updated_at: formatted,

                }
                connection.query("INSERT INTO transactions SET ?", data, function (err, result, fields) {
                    if (err) throw err;
                    let id = result.insertId;
                    res.redirect('/' + routeName + "/" + id + "/edit");
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    // Details
    app.get('/' + routeName + '/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("SELECT transactions.*, customers.name as customer_name, users.username as user_username FROM transactions LEFT JOIN users ON users.id = transactions.user_id LEFT JOIN customers ON customers.id = transactions.customer_id WHERE transactions.id = " + id, function (err, result, fields) {
                if (err) throw err;
                let transaction = result[0];
                connection.query("SELECT * FROM transaction_details INNER JOIN products ON products.id = transaction_details.product_id WHERE transaction_id = " + id, function (err, result, fields) {
                    if (err) throw err;
                    let details = result;
                    res.render(layouts + '/details', {
                        title: pageName,
                        listURL: "/" + routeName,
                        createURL: "/" + routeName + "/create",
                        editURL: "/" + routeName + "/" + id + "/edit",
                        deleteURL: "/" + routeName + "/delete/" + id,
                        printURL: "/" + routeName + "/print/" + id,
                        id: id,
                        data: transaction,
                        is_paid: parseInt(transaction.status) == 1 ? "Y" : null,
                        details: details
                    });
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    // Edit
    app.get('/' + routeName + '/:id/edit', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("SELECT * FROM transactions WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                let tranasction = result[0];
                connection.query("SELECT * FROM customers ORDER BY name ASC", function (err, result, fields) {
                    if (err) throw err;
                    let customers = result;
                    res.render(layouts + '/form', {
                        title: pageName,
                        submitURL: "/" + routeName + "/" + id + "/update",
                        listURL: "/" + routeName,
                        createURL: "/" + routeName + "/create",
                        deleteURL: "/" + routeName + "/delete/" + id,
                        id: id,
                        data: tranasction,
                        customers: customers,
                        is_paid: parseInt(tranasction.status) == 1 ? "Y" : null
                    });
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    // Update
    app.post('/' + routeName + '/:id/update', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            let product_id = req.param('product_id');
            let customer_id = req.param('customer_id');
            let price = req.param('price');
            let qty = req.param('qty');
            let total = req.param('total');
            let dateTime = app.get('dateTime');
            let dt = dateTime.create();
            let formatted = dt.format('Y-m-d H:M:S');
            connection.query("DELETE FROM transaction_details WHERE transaction_id = " + id, function (err, result, fields) {
                if (err) throw err;
                let totalItems = 0;
                for (i = 0; i < product_id.length; i++) {
                    let data = {
                        "transaction_id": parseInt(id),
                        "product_id": parseInt(product_id[i]),
                        "price": price[i] ? parseFloat(price[i]) : 0,
                        "qty": qty[i] ? parseInt(qty[i]) : 0,
                        "total": total[i] ? parseFloat(total[i]) : 0,
                        "created_at": formatted,
                        "updated_at": formatted,
                    }
                    totalItems = parseInt(totalItems) + parseInt(qty[i]);
                    connection.query("UPDATE products SET stock = stock - " + parseInt(qty[i]) + " WHERE id = " + product_id[i], function (err, result, fields) {
                        if (err) throw err;
                    });
                    connection.query("INSERT INTO transaction_details SET ? ", data, function (err, result, fields) {
                        if (err) throw err;
                    });
                }
                // UPDATE transactions
                let updateData = {
                    "status": 1,
                    "customer_id": customer_id,
                    "total_items": totalItems,
                    "grandtotal": parseFloat(req.param('grandtotal')),
                }
                connection.query("UPDATE transactions SET ? WHERE id = " + id, updateData, function (err, result, fields) {
                    if (err) throw err;
                    req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Transaction has been paid successfully');
                    req.flash('notice_type', 'success');
                    res.redirect('/' + routeName + "/" + id);
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    // Delete
    app.delete('/' + routeName + '/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("DELETE FROM transactions WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                connection.query("DELETE FROM transaction_details WHERE transaction_id = " + id, function (err, result, fields) {
                    if (err) throw err;
                    res.send(result);
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    app.post('/' + routeName + '/delete/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("DELETE FROM transactions WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                connection.query("DELETE FROM transaction_details WHERE transaction_id = " + id, function (err, result, fields) {
                    if (err) throw err;
                    req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record deleted successfully');
                    req.flash('notice_type', 'success');
                    res.redirect('/' + routeName);
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    // print
    app.get('/' + routeName + '/print/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("SELECT transactions.*, customers.name as customer_name, users.username as user_username FROM transactions LEFT JOIN users ON users.id = transactions.user_id LEFT JOIN customers ON customers.id = transactions.customer_id WHERE transactions.id = " + id, function (err, result, fields) {
                if (err) throw err;
                let transaction = result[0];
                connection.query("SELECT * FROM transaction_details INNER JOIN products ON products.id = transaction_details.product_id WHERE transaction_id = " + id, function (err, result, fields) {
                    if (err) throw err;
                    let details = result;
                    res.render(layouts + '/print', {
                        title: pageName,
                        listURL: "/" + routeName,
                        createURL: "/" + routeName + "/create",
                        editURL: "/" + routeName + "/" + id + "/edit",
                        deleteURL: "/" + routeName + "/delete/" + id,
                        printURL: "/" + routeName + "/print/" + id,
                        id: id,
                        data: transaction,
                        is_paid: parseInt(transaction.status) == 1 ? "Y" : null,
                        details: details,
                        layout: false
                    });
                });
            });
        } else {
            res.redirect('/login');
        }
    });
}
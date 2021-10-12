module.exports = function (app) {

    let connection = app.get('connection');
    let pageName = "Role";
    let routeName = "roles";
    let layouts = "pages/" + routeName;
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

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
            connection.query("SELECT COUNT(*) as total FROM roles", function (err, rows, fields) {
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

                let sql = "SELECT ";
                sql += " roles.name as roles_name, ";
                sql += " roles.description as roles_description, ";
                sql += " roles.id as key_id, ";
                sql += " '" + action + "' as action ";

                let filter = "";
                if (searchValue && searchValue.length > 0) {
                    filter += " WHERE ";
                    filter += " roles.name LIKE '%" + searchValue + "%' OR ";
                    filter += " roles.description LIKE '%" + searchValue + "%'";
                }
                sql += " FROM roles " + filter;

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
            res.render(layouts + '/form', {
                title: pageName,
                submitURL: "/" + routeName + "/store",
                listURL: "/" + routeName,
                id: null,
                data: null,
            });
        } else {
            res.redirect('/login');
        }
    });

    // Store
    app.post('/' + routeName + '/store', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let data = {
                "name": req.param('name'),
                "description": req.param('description'),
                "created_at": req.param('created_at'),
                "updated_at": req.param('updated_at'),
            }

            connection.query("SELECT * FROM roles WHERE name = ? ", [req.param('name')], function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0){
                    req.flash('notice_message', '<i class="fa fa-warning"></i>&nbsp; the name has already been taken.');
                    req.flash('notice_type', 'warning');
                    res.redirect('/' + routeName+"/create");
                }else{
                    connection.query("INSERT INTO roles SET ?", data, function (err, result, fields) {
                        if (err) throw err;
                        let id = result.insertId;
                        req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record created successfully');
                        req.flash('notice_type', 'success');
                        res.redirect('/' + routeName + "/" + id);
                    });
                }
            });
            
        } else {
            res.redirect('/login');
        }
    });

    // Details
    app.get('/' + routeName + '/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("SELECT * FROM roles WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                res.render(layouts + '/details', {
                    title: pageName,
                    listURL: "/" + routeName,
                    createURL: "/" + routeName + "/create",
                    editURL: "/" + routeName + "/" + id + "/edit",
                    deleteURL: "/" + routeName + "/delete/" + id,
                    id: id,
                    data: result[0],
                    is_admin: result[0].name === "Admin" ? true : false
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
            connection.query("SELECT * FROM roles WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                res.render(layouts + '/form', {
                    title: pageName,
                    submitURL: "/" + routeName + "/" + id + "/update",
                    listURL: "/" + routeName,
                    createURL: "/" + routeName + "/create",
                    deleteURL: "/" + routeName + "/delete/" + id,
                    id: id,
                    data: result[0],
                    is_admin: result[0].name === "Admin" ? true : false
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
            let data = {
                "name": req.param('name'),
                "description": req.param('description'),
                "updated_at": req.param('updated_at'),
            }
            connection.query("SELECT * FROM roles WHERE name = ? AND id != ? ", [req.param('name'), id], function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0) {
                    req.flash('notice_message', '<i class="fa fa-warning"></i>&nbsp; the name has already been taken.');
                    req.flash('notice_type', 'warning');
                    res.redirect('/' + routeName + "/create");
                } else {
                    connection.query("UPDATE roles SET ? WHERE id = " + id, data, function (err, result, fields) {
                        if (err) throw err;
                        req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record created successfully');
                        req.flash('notice_type', 'success');
                        res.redirect('/' + routeName + "/" + id);
                    });
                }
            });
        } else {
            res.redirect('/login');
        }
    });

    // Delete
    app.delete('/' + routeName + '/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("DELETE FROM roles WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                res.send(result);
            });
        } else {
            res.redirect('/login');
        }
    });

    app.post('/' + routeName + '/delete/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("DELETE FROM roles WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record deleted successfully');
                req.flash('notice_type', 'success');
                res.redirect('/' + routeName);
            });
        } else {
            res.redirect('/login');
        }
    });
}
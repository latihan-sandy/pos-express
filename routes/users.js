module.exports = function (app) {

    let connection = app.get('connection');
    let md5 = app.get('md5');
    let pageName = "User";
    let routeName = "users";
    let layouts = "pages/" + routeName;
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

     let syncRoles = function (roles, user_id) {
         connection.query("DELETE FROM users_roles WHERE user_id = " + user_id, function (err, rows, fields) {
             if (err) throw err;
             if (roles && roles.length > 0) {
                 roles.forEach(function (row) {
                     let data = {
                         "user_id": user_id,
                         "role_id": row
                     }
                     connection.query("INSERT INTO users_roles SET ? ", data, function (err, rows, fields) {
                         if (err) throw err;
                         connection.query("SELECT * FROM roles WHERE id = "+row, function (err, rows, fields) {
                             if (err) throw err;
                         });
                     });
                 });
                 connection.query("SELECT * FROM users_roles INNER JOIN roles ON roles.id = users_roles.role_id WHERE user_id  = "+user_id, function (err, rows, fields) {
                     if (err) throw err;
                     let rolesNames = new Array();
                     if (rows.length > 0){
                         rows.forEach(function (row) {
                             rolesNames.push(row.name);
                         });
                         let temp = rolesNames.join(" ,");
                         connection.query("UPDATE users SET ? WHERE id = " + user_id, { "groups": temp }, function (err, rows, fields) {
                             if (err) throw err;
                         });
                     }
                 });
             }
         });
     }

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
            var user_id = req.session.user.id;
            connection.query("SELECT COUNT(*) as total FROM users WHERE id != " + user_id, function (err, rows, fields) {
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
                sql += " users.username as users_username, ";
                sql += " users.email as users_email, ";
                sql += " users.groups as users_groups, ";
                sql += " users.is_active as users_is_active, ";
                sql += " users.id as key_id, ";
                sql += " '" + action + "' as action ";

                let filter = "WHERE users.id != "+user_id;
                if (searchValue && searchValue.length > 0) {
                    filter += " AND ";
                    filter += " users.username LIKE '%" + searchValue + "%' OR ";
                    filter += " users.email LIKE '%" + searchValue + "%' OR ";
                    filter += " users.groups LIKE '%" + searchValue + "%' OR ";
                    filter += " users.is_active LIKE '%" + searchValue + "%'";
                }
                sql += " FROM users " + filter;

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
            connection.query("SELECT * FROM roles ORDER BY name ASC", function (err, result, fields) {
                if (err) throw err;
                let roles = result;
                res.render(layouts + '/form', {
                     title: pageName,
                     submitURL: "/" + routeName + "/store",
                     listURL: "/" + routeName,
                     id: null,
                     data: null,
                     roles : roles,
                     user_active: null
                 });
            });
        } else {
            res.redirect('/login');
        }
    });

    // Store
    app.post('/' + routeName + '/store', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let username = req.param('username');
            let email = req.param('email');
            let phone = req.param('phone');
            let password = req.param('password');
            let is_active = req.param('is_active') ? 1 : 0;
            let roles = req.param('roles');
            
            connection.query("SELECT * FROM users WHERE username = ? ",[username], function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0){
                    // Duplicate username
                     req.flash('notice_message', '<i class="fa fa-warning"></i>&nbsp; the username has already been taken.');
                     req.flash('notice_type', 'warning');
                     res.redirect('/' + routeName + "/create");
                }else{
                    connection.query("SELECT * FROM users WHERE email = ? ", [email], function (err, result, fields) {
                        if (err) throw err;
                        if (result.length > 0) {
                            // Duplicate email
                             req.flash('notice_message', '<i class="fa fa-warning"></i>&nbsp; the email has already been taken.');
                             req.flash('notice_type', 'warning');
                             res.redirect('/' + routeName + "/create");
                        } else {
                            let data = {
                                username : username,
                                email : email,
                                phone: phone,
                                password: md5(password),
                                is_active: is_active,
                                email_confirm: 0,
                                phone_confirm: 0,
                                created_at: req.param('created_at'),
                                updated_at: req.param('updated_at'),
                            }
                             connection.query("INSERT INTO users SET ?", data, function (err, result, fields) {
                                 if (err) throw err;
                                 let id = result.insertId;
                                 syncRoles(roles, id);
                                 req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record created successfully');
                                 req.flash('notice_type', 'success');
                                 res.redirect('/' + routeName + "/" + id);
                             });
                        }
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
            connection.query("SELECT * FROM users WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                res.render(layouts + '/details', {
                    title: pageName,
                    listURL: "/" + routeName,
                    createURL: "/" + routeName + "/create",
                    editURL: "/" + routeName + "/" + id + "/edit",
                    deleteURL: "/" + routeName + "/delete/" + id,
                    id: id,
                    data: result[0],
                    is_active_label: parseInt(result[0].is_active) === 1 ? '<span class="label label-success">Yes</span></td>' : '<span class="label label-danger">No</span></td>'
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
            connection.query("SELECT * FROM users WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                let user = result[0];
                connection.query("SELECT * FROM roles ORDER BY name ASC", function (err, result, fields) {
                    if (err) throw err;
                    let roles = result;
                    connection.query("SELECT * FROM users_roles WHERE user_id = "+id, function (err, result, fields) {
                        if (err) throw err;
                        let rolesSelected = new Array();
                        result.forEach(function(row){
                            rolesSelected.push(row.role_id);
                        });
                        res.render(layouts + '/form', {
                            title: pageName,
                            submitURL: "/" + routeName + "/" + id + "/update",
                            listURL: "/" + routeName,
                            createURL: "/" + routeName + "/create",
                            deleteURL: "/" + routeName + "/delete/" + id,
                            id: id,
                            data: user,
                            roles: roles,
                            user_active: parseInt(user.is_active) == 1 ? "Y" : null,
                            rolesSelected: rolesSelected
                        });
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
            let username = req.param('username');
            let email = req.param('email');
            let phone = req.param('phone');
            let password = req.param('password');
            let is_active = req.param('is_active') ? 1 : 0;
            let roles = req.param('roles');

            connection.query("SELECT * FROM users WHERE username = ? AND id != ? ", [username, id], function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0) {
                    // Duplicate username
                    req.flash('notice_message', '<i class="fa fa-warning"></i>&nbsp; the username has already been taken.');
                    req.flash('notice_type', 'warning');
                    res.redirect('/' + routeName + "/create");
                } else {
                    connection.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, id], function (err, result, fields) {
                        if (err) throw err;
                        if (result.length > 0) {
                            // Duplicate email
                            req.flash('notice_message', '<i class="fa fa-warning"></i>&nbsp; the email has already been taken.');
                            req.flash('notice_type', 'warning');
                            res.redirect('/' + routeName + "/create");
                        } else {
                            let data = {
                                username: username,
                                email: email,
                                phone: phone,
                                is_active: is_active,
                                updated_at: req.param('updated_at'),
                            }
                            if (password){
                                data.password = md5(password);
                            }
                            connection.query("UPDATE users SET ? WHERE id  = "+id, data, function (err, result, fields) {
                                if (err) throw err;
                                syncRoles(roles, id);
                                req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record updated successfully');
                                req.flash('notice_type', 'success');
                                res.redirect('/' + routeName + "/" + id);
                            });
                        }
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
            connection.query("DELETE FROM users WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                connection.query("DELETE FROM users_roles WHERE user_id = " + id, function (err, result, fields) {
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
            connection.query("DELETE FROM users WHERE id = " + id, function (err, result, fields) {
                if (err) throw err;
                connection.query("DELETE FROM users_roles WHERE user_id = " + id, function (err, result, fields) {
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
}
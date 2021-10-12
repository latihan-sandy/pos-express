module.exports = function(app) {

    let connection = app.get('connection');
    let md5 = app.get('md5');

    let updateProfile = function(id, req, res) {
        let formData = {
            "username": req.body.username,
            "email": req.body.email,
            "phone": req.body.phone,
        }
        let sql = "UPDATE users SET ? WHERE id = " + id;
        connection.query(sql, formData, (err, results) => {
            if (err) throw err;
            req.session.user.username = req.body.username;
            req.session.user.email = req.body.email;
            req.session.user.phone = req.body.phone;
            req.flash('notice_message', 'Your user profile has been updated.');
            req.flash('notice_type', 'success');
            res.redirect('/profiles');
        });
    }

    let updatePassword = function(id, req, res) {
        let formData = {
            "password": md5(req.body.new_password),
        }
        let sql = "UPDATE users SET ? WHERE id = " + id;
        connection.query(sql, formData, (err, results) => {
            if (err) throw err;
            req.flash('notice_message', 'Your password has been updated. Please login to continue');
            req.flash('notice_type', 'success');
            res.redirect('/logout');
        });
    }

    app.get('/profiles', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.render('pages/profiles/edit', {
                title: "My Profile"
            });
        } else {
            res.redirect('/login');
        }
    });

    app.get('/change_password', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.render('pages/profiles/password', {
                title: "Change Password"
            });
        } else {
            res.redirect('/login');
        }
    });

    app.post('/change_password/update', function(request, response) {
        if (request.session.user && request.cookies.user_sid) {
            var user_id = request.session.user.id;
            var password = md5(request.body.password);
            var new_password = request.body.new_password;
            var new_password_confirmation = request.body.new_password_confirmation;
            connection.query('SELECT * FROM users WHERE password = ? AND id = ?', [password, user_id], function(err, results, fields) {
                if (err) throw err;
                if (results.length > 0) {
                    if (new_password.length > 6 && new_password == new_password_confirmation) {
                        updatePassword(user_id, request, response);
                    } else {
                        req.flash('notice_message', 'Passwords must be at least six characters and match the confirmation.');
                        req.flash('notice_type', 'warning');
                        res.redirect('/change_password');
                    }
                } else {
                    request.flash('notice_message', 'Passwords are not Matching');
                    request.flash('notice_type', 'warning');
                    response.redirect('/change_password');
                }
            });
        } else {
            res.redirect('/login');
        }
    });

    app.post('/profiles/update', function(request, response) {
        if (request.session.user && request.cookies.user_sid) {
            var user_id = request.session.user.id;
            var username = request.body.username;
            var email = request.body.email;
            var phone = request.body.phone;
            connection.query('SELECT * FROM users WHERE username = ? AND id != ?', [username, user_id], function(err, results, fields) {
                if (err) throw err;
                //console.log(username, results.length);
                if (results.length > 0) {
                    request.flash('notice_message', 'The username <b>' + username + '</b> has already been taken.');
                    request.flash('notice_type', 'warning');
                    response.redirect('/profiles');
                } else {
                    connection.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, user_id], function(err, results, fields) {
                        if (err) throw err;
                        if (results.length > 0) {
                            request.flash('notice_message', 'The email <b>' + email + '</b> has already been taken.');
                            request.flash('notice_type', 'warning');
                            response.redirect('/profiles');
                        } else {
                            if (phone) {
                                connection.query('SELECT * FROM users WHERE phone = ? AND id != ?', [phone, user_id], function(err, results, fields) {
                                    if (err) throw err;
                                    if (results.length > 0) {
                                        request.flash('notice_message', 'The phone <b>' + phone + '</b> has already been taken.');
                                        request.flash('notice_type', 'warning');
                                        response.redirect('/profiles');
                                    } else {
                                        updateProfile(user_id, request, response);
                                    }
                                });
                            } else {
                                updateProfile(user_id, request, response);
                            }
                        }
                    });
                }
            });
        } else {
            response.redirect('/login');
        }

    });




}
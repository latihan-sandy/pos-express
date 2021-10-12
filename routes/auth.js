function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = function(app) {

    let connection = app.get('connection');
    let md5 = app.get('md5');

    app.get('/login', (req, res) => {
        res.render('pages/auth/login', {
            title: "Login"
        });
    });

    app.post('/signin', function(request, response) {
        var username = request.body.username;
        var password = md5(request.body.password);
        if (username && password) {
            connection.query('SELECT * FROM users WHERE (username = ? OR email = ? ) AND password = ?', [username, username, password], function(error, results, fields) {
                if (results.length > 0) {
                    request.session.loggedin = true;
                    request.session.user = results[0];
                    response.redirect('/');
                } else {
                    request.flash('notice_message', 'These credentials do not match our records.');
                    request.flash('notice_type', 'warning');
                    response.redirect('/login');
                }
                response.end();
            });
        } else {
            response.send('Please enter Username and Password!');
            response.end();
        }
    });

    app.get('/logout', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            req.session.loggedin = false;
            req.session.user = null;
            res.clearCookie('user_sid');
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/register', (req, res) => {
        res.render('pages/auth/register', {
            title: "Register"
        });
    });

    app.post('/signup', function(req, res) {
        var username = req.param('username');
        var email = req.param('email');
        var password = req.param('password');
        var password_confirmation = req.param('password_confirmation');
        connection.query('SELECT * FROM users WHERE username = ? ', [username], function(err, rows, fields) {
            if (rows.length > 0) {
                req.flash('notice_message', 'The username has already been taken.');
                req.flash('notice_type', 'warning');
                res.redirect('/register');
            } else {
                connection.query('SELECT * FROM users WHERE email = ? ', [email], function(err, rows, fields) {
                    if (rows.length > 0) {
                        req.flash('notice_message', 'The email has already been taken.');
                        req.flash('notice_type', 'warning');
                        res.redirect('/register');
                    } else {
                        connection.query('SELECT * FROM users WHERE username = ? OR email = ? ', [username, email], function(err, rows, fields) {
                            if (rows.length == 0) {
                                if (password.length > 6 && password === password_confirmation) {
                                    let data = {
                                        username: username,
                                        email: email,
                                        password: md5(password),
                                        email_confirm: 1,
                                        phone_confirm: 1,
                                        is_active: 1,
                                        groups: "User",
                                        created_at: formatDate(new Date().toLocaleString()),
                                        updated_at: formatDate(new Date().toLocaleString()),
                                    }
                                    let sql = "INSERT INTO users SET ?"
                                    connection.query(sql, data, (err, results) => {
                                        if (err) throw err;
                                        let user_id = results.insertId;
                                        connection.query("INSERT INTO users_roles (user_id, role_id) VALUES (" + user_id + ", (SELECT id from roles WHERE name != 'Admin' ORDER BY RAND() LIMIT 1 )) ", [], (err, results) => {
                                            if (err) throw err;
                                            req.flash('notice_message', 'Your account has been registered. You can now login.');
                                            req.flash('notice_type', 'warning');
                                            res.redirect('/login');
                                        });
                                    });
                                } else {
                                    req.flash('notice_message', 'Passwords must be at least six characters and match the confirmation.');
                                    req.flash('notice_type', 'warning');
                                    res.redirect('/register');
                                }
                            } else {
                                req.flash('notice_message', 'The username and email has already been taken.');
                                req.flash('notice_type', 'warning');
                                res.redirect('/register');
                            }
                        });
                    }
                });
            }
        });

    });



}
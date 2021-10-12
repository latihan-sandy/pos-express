    //use path module
    const path = require('path');
    //use express module
    const express = require('express');
    //use hbs view engine
    const hbs = require('express-handlebars');
    //use bodyParser middleware
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const flash = require('connect-flash');
    const fs = require('fs');
    //use mysql database
    const mysql = require('mysql');
    const md5 = require('md5');
    const moment = require('moment');
    const uuid = require('uuid');
    const session = require('express-session');
    const dateTime = require('node-datetime');

    const app = express();
    const port = 3000;

    const multer = require('multer');

    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'public/uploads/')
        },
        filename: function(req, file, cb) {
            cb(null, uuid() + path.extname(file.originalname)) //Appending extension
        }
    })

    const upload = multer({ storage: storage });

    app.use(upload.single('file'));
    app.set('upload', upload);
    app.set('fs', fs);
    app.set('dateTime', dateTime);
    app.set('moment', moment)
    global.__basedir = __dirname;


    //Create connection
    const conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pos_express'
    });
    app.set('connection', conn);
    app.set('md5', md5);
    app.set('uuid', uuid);

    //connect to database
    conn.connect((err) => {
        if (err) throw err;
        //console.log('Mysql Connected...');
    });

    //set views file
    app.set('views', path.join(__dirname, 'views'));

    app.engine('hbs', hbs({
        extname: 'hbs',
        defaultView: 'default',
        defaultLayout: 'base',
        layoutsDir: __dirname + '/views/layouts/',
        partialsDir: __dirname + '/views/partials/',
        helpers: {

            block: function(name) {
                var blocks = this._blocks,
                    content = blocks && blocks[name];

                return content ? content.join('\n') : null;
            },

            contentFor: function(name, options) {
                var blocks = this._blocks || (this._blocks = {}),
                    block = blocks[name] || (blocks[name] = []);

                block.push(options.fn(this));
            },

            nowYear: function() {
                var d = new Date();
                return d.getFullYear();
            },

            getUUID: function() {
                return uuid();
            },

            ifCond: function(v1, v2, options) {
                if (v1 === v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },

            dateFormat: require('handlebars-dateformat')
        }
    }));


    //set view engine
    app.set('view engine', 'hbs');


    // set session and auth
    app.use(session({
        key: 'user_sid',
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: {
            expires: 600000
        }
    }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(flash());

    app.use((req, res, next) => {
        if (req.cookies.user_sid && !req.session.user) {
            res.clearCookie('user_sid');
        }
        res.locals.session = req.session;
        res.locals.notice_message = req.flash('notice_message');
        res.locals.notice_type = req.flash('notice_type');
        res.locals.baseUrl = req.protocol + '://' + req.get('host');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
        //console.log(res.locals.session);
        next();
    });

    //check session
    var sessionChecker = (req, res, next) => {
        if (req.session.user && req.cookies.user_sid) {
            res.redirect('/dashboards');
        } else {
            next();
        }
    };


    //set public folder as static folder for static file
    app.use('/static', express.static(__dirname + '/public'));

    //routes apps
    app.get('/', sessionChecker, (req, res) => {
        res.redirect('/login');
    });
    // Eeach Modules
    require('./routes/auth')(app);
    require('./routes/profiles')(app);
    require('./routes/dashboards')(app);
    require('./routes/brands')(app);
    require('./routes/categories')(app);
    require('./routes/types')(app);
    require('./routes/customers')(app);
    require('./routes/suppliers')(app);
    require('./routes/products')(app);
    require('./routes/roles')(app);
    require('./routes/users')(app);
    require('./routes/purchases')(app);
    require('./routes/sales')(app);
    require('./routes/reports')(app);
    // Erro Only
    require('./routes/errors')(app);

    //server listening
    app.listen(port, () => console.log("Server listening on port " + port + "!"));
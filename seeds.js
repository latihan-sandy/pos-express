var mysql = require('mysql');
var md5 = require('md5');
var faker = require('faker');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pos_express',
    multipleStatements: true
});

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

conn.connect((err) => {
    if (err) throw err;
    // To Do Here
    let roles = ["Admin", "User", "Manager"];
    let tables = ["brands", "categories", "customers", "products", "products_categories", "roles", "suppliers", "transaction_details", "transactions", "types", "users", "users_roles"];
    tables.forEach(function(table) {
        let sql = "TRUNCATE " + table;
        conn.query(sql, (err, results) => {
            if (err) throw err;
        });
    });
    conn.query("SELECT * FROM roles", function(error, results, fields) {
        if (results.length == 0) {
            roles.forEach(function(role, i) {
                let data = {
                    name: role,
                    description: faker.lorem.paragraphs(5, ""),
                    created_at: formatDate(new Date().toLocaleString()),
                    updated_at: formatDate(new Date().toLocaleString())
                };
                let sql = "INSERT INTO roles SET ?"
                conn.query(sql, data, (err, results) => {
                    if (err) throw err;
                    let role_id = results.insertId;
                    if (role === 'Admin') {
                        userAdmin(role_id);
                    } else {
                        userNonAdmin(role_id, role);
                    }
                });
            });
            // Others
            console.log("Seed data started...");
            createBrand();
            createCategory();
            createCustomers();
            createSuppliers();
            createType();
            createProduct();
            console.log("Some data seeded....");
            console.log("Here is your admin details to login:");
            console.log("Username is : admin");
            console.log("Email is : admin@devel.com");
            console.log("Password is : 'password'");
            console.log("All done :)");
            console.log('Press any key to exit');
        };
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));

    var createBrand = function(max) {
        for (i = 1; i <= 100; i++) {
            let data = {
                name: faker.random.words(),
                description: faker.lorem.paragraphs(5, ""),
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString())
            }
            let sql = "INSERT INTO brands SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
        }
    }

    var createCategory = function(max) {
        for (i = 1; i <= 100; i++) {
            let data = {
                name: faker.random.words(),
                description: faker.lorem.paragraphs(5, ""),
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString())
            }
            let sql = "INSERT INTO categories SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
        }
    }

    var createCustomers = function(max) {
        for (i = 1; i <= 100; i++) {
            let data = {
                name: faker.random.words(),
                email: faker.internet.email().toLowerCase(),
                phone: faker.phone.phoneNumber().toLowerCase(),
                website: faker.internet.url().toLowerCase(),
                address: faker.lorem.paragraphs(5, ""),
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString())
            }
            let sql = "INSERT INTO customers SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
        }
    }

    var createSuppliers = function(max) {
        for (i = 1; i <= 100; i++) {
            let data = {
                name: faker.random.words(),
                email: faker.internet.email().toLowerCase(),
                phone: faker.phone.phoneNumber().toLowerCase(),
                website: faker.internet.url().toLowerCase(),
                address: faker.lorem.paragraphs(5, ""),
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString())
            }
            let sql = "INSERT INTO suppliers SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
        }
    }

    var createType = function(max) {
        for (i = 1; i <= 100; i++) {
            let data = {
                name: faker.random.words(),
                description: faker.lorem.paragraphs(5, ""),
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString())
            }
            let sql = "INSERT INTO types SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
        }
    }

    var createProduct = function(max) {
        for (i = 1; i <= 100; i++) {
            let price_purchase = Math.random(1000, 9999) * 1000;
            let price_profit = Math.random(1, 100) * 100;
            let price_sales = parseFloat(price_purchase) + ((parseFloat(price_purchase) * parseFloat(price_profit)) / 100);
            let data = {
                sku: faker.finance.bic(),
                name: faker.random.words(),
                stock: 0,
                price_purchase: Math.round(price_purchase),
                price_sales: Math.round(price_sales),
                price_profit: Math.round(price_profit),
                date_expired: formatDate(new Date().toLocaleString()),
                description: faker.lorem.paragraphs(5, ""),
                notes: faker.lorem.paragraphs(5, ""),
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString())
            }
            let sql = "INSERT INTO products SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
            sql = "UPDATE products SET brand_id = (SELECT id from brands ORDER BY RAND() LIMIT 1 ), type_id = (SELECT id from types ORDER BY RAND() LIMIT 1 ) , supplier_id = (SELECT id from suppliers ORDER BY RAND() LIMIT 1 )"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
            for (j = 1; j <= 5; j++) {
                sql = "INSERT INTO products_categories (product_id, category_id) VALUES ((SELECT id from products ORDER BY RAND() LIMIT 1 ), (SELECT id from categories ORDER BY RAND() LIMIT 1 ))"
                conn.query(sql, {}, (err, results) => {
                    if (err) throw err;
                });
            }
        }
    }

    var userAdmin = function(role_id) {
        let data = {
            username: "admin",
            email: "admin@devel.com",
            phone: "081293949439",
            password: md5("password"),
            email_confirm: 1,
            phone_confirm: 1,
            is_active: 1,
            groups: "Admin",
            created_at: formatDate(new Date().toLocaleString()),
            updated_at: formatDate(new Date().toLocaleString()),
        }
        let sql = "INSERT INTO users SET ?"
        conn.query(sql, data, (err, results) => {
            if (err) throw err;
            sql = "INSERT INTO users_roles SET ?"
            data = {
                user_id: results.insertId,
                role_id: role_id
            };
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
            });
        });
    }

    var userNonAdmin = function(role_id, name) {
        for (i = 1; i <= 50; i++) {
            let data = {
                username: faker.internet.userName().toLowerCase(),
                email: faker.internet.email().toLowerCase(),
                phone: faker.phone.phoneNumber().toLowerCase(),
                password: md5("password"),
                email_confirm: 1,
                phone_confirm: 1,
                is_active: 1,
                groups: name,
                created_at: formatDate(new Date().toLocaleString()),
                updated_at: formatDate(new Date().toLocaleString()),
            }
            let sql = "INSERT INTO users SET ?"
            conn.query(sql, data, (err, results) => {
                if (err) throw err;
                sql = "INSERT INTO users_roles SET ?"
                data = {
                    user_id: results.insertId,
                    role_id: role_id
                };
                conn.query(sql, data, (err, results) => {
                    if (err) throw err;
                });
            });
        }
    }

});
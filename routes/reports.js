module.exports = function (app) {

    let connection = app.get('connection');
    let pageName = "Report";
    let routeName = "reports";
    let layouts = "pages/" + routeName;
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

   // Index
   app.get('/' + routeName, (req, res) => {
       if (req.session.user && req.cookies.user_sid) {

            let dateTime = app.get('dateTime');
            let moment = app.get('moment');
            let firstDate = moment().startOf('month').format("YYYY-MM-DD");
            let lastDate = moment().endOf('month').format("YYYY-MM-DD");

           res.render(layouts + '/index', {
               title: pageName,
               createUrl: "/" + routeName + "/create",
               firstDate: firstDate,
               lastDate: lastDate
           });
       } else {
           res.redirect('/login');
       }
   });

   app.get('/' + routeName+"/details/:id", (req, res) => {
       if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            connection.query("SELECT * FROM transaction_details INNER JOIN products ON products.id = transaction_details.product_id WHERE transaction_id = " + id, function (err, result, fields) {
                 if (err) throw err;
                 return res.send(result);
             });
       } else {
           res.redirect('/login');
       }
   });

   app.get('/' + routeName + "/purchase/1/:first/:last", (req, res) => {
       if (req.session.user && req.cookies.user_sid) {

           let firstDate = req.param('first');
           let lastDate = req.param('last');
           let sql = `
                SELECT DISTINCT transactions.*, 
                suppliers.name as supplier_name,
                customers.name as customer_name,
                users.username as user_username
                FROM transactions
                LEFT JOIN suppliers ON suppliers.id = transactions.supplier_id
                LEFT JOIN customers ON customers.id = transactions.customer_id
                LEFT JOIN users ON users.id = transactions.user_id
                WHERE transactions.status = 1
                AND invoice_date >= '`+ firstDate + `' AND invoice_date <= '` + lastDate +`' AND transactions.type_of = 0
                ORDER BY transactions.invoice_date ASC
           `;
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                let data = result;
                res.render(layouts + '/purchase1', {
                    title: pageName,
                    data: data,
                    layout: false
                });
            });
       } else {
           res.redirect('/login');
       }
   });

   app.get('/' + routeName + "/purchase/2/:first/:last", (req, res) => {
       if (req.session.user && req.cookies.user_sid) {

           let firstDate = req.param('first');
           let lastDate = req.param('last');
           let sql = `
                SELECT 
                    suppliers.id as supplier_id,
                    suppliers.name as supplier_name,
                    IFNULL(SUM(qty), 0) as total_buy,
                    IFNULL(SUM(total),0) as total_purchase
                FROM 
                suppliers
                LEFT JOIN transactions ON transactions.supplier_id = suppliers.id
                LEFT JOIN transaction_details ON transactions.id = transaction_details.transaction_id
                WHERE transactions.status = 1
                AND invoice_date >= '`+ firstDate + `' AND invoice_date <= '` +  lastDate +`' AND transactions.type_of = 0
                GROUP BY suppliers.id, suppliers.name ORDER BY suppliers.name
           `;
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                let data = result;
                res.render(layouts + '/purchase2', {
                    title: pageName,
                    data: data,
                    layout: false
                });
            });
       } else {
           res.redirect('/login');
       }
   });

    app.get('/' + routeName + "/purchase/3/:first/:last", (req, res) => {
        if (req.session.user && req.cookies.user_sid) {

            let firstDate = req.param('first');
            let lastDate = req.param('last');
            let sql = `
                SELECT
                brands.name as brand_name,
                    types.name as type_name,
                    products.sku as product_sku,
                    products.name as product_name,
                    suppliers.name as supplier_name,
                    SUM(qty) as total_buy,
                    SUM(total) as total_purchase
                FROM products
                LEFT JOIN transaction_details ON transaction_details.product_id = products.id
                LEFT JOIN transactions ON transactions.id = transaction_details.transaction_id
                LEFT JOIN brands ON brands.id = products.brand_id
                LEFT JOIN types ON types.id = products.type_id
                LEFT JOIN suppliers ON suppliers.id = products.supplier_id
                WHERE transactions.status = 1
                AND invoice_date >= '`+ firstDate + `'
                AND invoice_date <= '` +  lastDate +`'
                AND transactions.type_of = 0
                GROUP BY brands.name, types.name, products.sku, products.name, suppliers.name ORDER BY brands.name, types.name, suppliers.name, products.sku, products.name
           `;
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                let data = result;
                res.render(layouts + '/purchase3', {
                    title: pageName,
                    data: data,
                    layout: false
                });
            });
        } else {
            res.redirect('/login');
        }
    });

     app.get('/' + routeName + "/sales/1/:first/:last", (req, res) => {
         if (req.session.user && req.cookies.user_sid) {

             let firstDate = req.param('first');
             let lastDate = req.param('last');
             let sql = `
                SELECT DISTINCT transactions.*, 
                suppliers.name as supplier_name,
                customers.name as customer_name,
                users.username as user_username
                FROM transactions
                LEFT JOIN suppliers ON suppliers.id = transactions.supplier_id
                LEFT JOIN customers ON customers.id = transactions.customer_id
                LEFT JOIN users ON users.id = transactions.user_id
                WHERE transactions.status = 1
                AND invoice_date >= '` + firstDate + `' AND invoice_date <= '` + lastDate + `' AND transactions.type_of = 1
                ORDER BY transactions.invoice_date ASC
           `;
             connection.query(sql, function (err, result, fields) {
                 if (err) throw err;
                 let data = result;
                 res.render(layouts + '/sales1', {
                     title: pageName,
                     data: data,
                     layout: false
                 });
             });
         } else {
             res.redirect('/login');
         }
     });

     app.get('/' + routeName + "/sales/2/:first/:last", (req, res) => {
         if (req.session.user && req.cookies.user_sid) {

             let firstDate = req.param('first');
             let lastDate = req.param('last');
             let sql = `
                SELECT 
                    customers.id as customer_id,
                    customers.name as customer_name,
                    IFNULL(SUM(qty), 0) as total_buy,
                    IFNULL(SUM(total),0) as total_sell
                FROM 
                customers
                LEFT JOIN transactions ON transactions.customer_id = customers.id
                LEFT JOIN transaction_details ON transactions.id = transaction_details.transaction_id
                WHERE transactions.status = 1
                AND invoice_date >= '` + firstDate + `' AND invoice_date <= '` + lastDate + `' AND transactions.type_of = 1
                GROUP BY customers.id, customers.name ORDER BY customers.name
           `;
             connection.query(sql, function (err, result, fields) {
                 if (err) throw err;
                 let data = result;
                 res.render(layouts + '/sales2', {
                     title: pageName,
                     data: data,
                     layout: false
                 });
             });
         } else {
             res.redirect('/login');
         }
     });

     app.get('/' + routeName + "/sales/3/:first/:last", (req, res) => {
         if (req.session.user && req.cookies.user_sid) {

             let firstDate = req.param('first');
             let lastDate = req.param('last');
             let sql = `
                SELECT
                brands.name as brand_name,
                    types.name as type_name,
                    products.sku as product_sku,
                    products.name as product_name,
                    customers.name as customer_name,
                    SUM(qty) as total_buy,
                    SUM(total) as total_purchase
                FROM products
                LEFT JOIN transaction_details ON transaction_details.product_id = products.id
                LEFT JOIN transactions ON transactions.id = transaction_details.transaction_id
                LEFT JOIN brands ON brands.id = products.brand_id
                LEFT JOIN types ON types.id = products.type_id
                LEFT JOIN customers ON customers.id = transactions.customer_id
                WHERE transactions.status = 1
                AND invoice_date >= '` + firstDate + `'
                AND invoice_date <= '` + lastDate + `'
                AND transactions.type_of = 1
                GROUP BY brands.name, types.name, products.sku, products.name, customers.name ORDER BY brands.name, types.name, customers.name, products.sku, products.name
           `;
             connection.query(sql, function (err, result, fields) {
                 if (err) throw err;
                 let data = result;
                 res.render(layouts + '/sales3', {
                     title: pageName,
                     data: data,
                     layout: false
                 });
             });
         } else {
             res.redirect('/login');
         }
     });
   

};
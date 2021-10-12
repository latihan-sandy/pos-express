module.exports = function(app) {

     let connection = app.get('connection');

    app.get('/dashboards', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.render('pages/dashboards/index', {
                title: "Hello World"
            });
        } else {
            res.redirect('/login');
        }
    });

    app.post("/dashboards/count/:table", (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let table = req.param('table');
            connection.query("SELECT COUNT(*) as total FROM " + table, function (err, rows, fields) {
                if (err) throw err
                res.send(rows);
            });
        } else {
            res.redirect('/login');
        }
    });

     app.post("/dashboards/piechart/:type", (req, res) => {
         if (req.session.user && req.cookies.user_sid) {
             let type = req.param('type');
             let today = new Date();
             let year = today.getFullYear();
             let firstDate = year+"-01-01";
             let lastDate = year + "-12-31";
             
             let sql = `
                 SELECT
                 products.name as name,
                     SUM(qty) as total
                 FROM transaction_details
                 INNER JOIN products ON products.id = transaction_details.product_id
                 INNER JOIN transactions ON transactions.id = transaction_details.transaction_id
                 WHERE transactions.status = 1
                 AND invoice_date >= '`+ firstDate + `'
                 AND invoice_date <= '` + lastDate +`'
                 AND transactions.type_of = `+type+`
                 GROUP BY products.id, products.name, qty
                 ORDER BY qty DESC
                 LIMIT 10
             `;

              connection.query(sql, function (err, rows, fields) {
                  if (err) throw err
                  res.send(rows);
              });

         } else {
             res.redirect('/login');
         }
     });

       app.post("/dashboards/barchart/:type", (req, res) => {
           if (req.session.user && req.cookies.user_sid) {
               let type = req.param('type');
               let today = new Date();
               let year = today.getFullYear();
               let sql = `
                SELECT 'Jan' month,  `+ year + ` year, 1 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = `  + year  + ` AND MONTH(created_at) = 1  AND transactions.type_of = `  + type +`) total UNION 
                SELECT 'Feb' month,  `+ year + ` year, 2 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 2   AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Mar' month,  `+ year + ` year, 3 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 3  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Apr' month,  `+ year + ` year, 4 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 4  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'May' month,  `+ year + ` year, 5 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 5  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Jun' month,  `+ year + ` year, 6 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 6  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Jul' month,  `+ year + ` year, 7 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 7  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Aug' month,  `+ year + ` year, 8 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 8  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Sep' month,  `+ year + ` year, 9 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 9  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Oct' month,  `+ year + ` year, 10 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 10  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Nov' month,  `+ year + ` year, 11 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year +` AND MONTH(created_at) = 11  AND transactions.type_of = ` + type +`) total UNION 
                SELECT 'Dec' month,  `+ year + ` year, 12 monthOrder, (SELECT IFNULL(SUM(transactions.grandtotal),0) FROM transactions WHERE YEAR(created_at) = ` + year + ` AND MONTH(created_at) = 12  AND transactions.type_of = ` + type +`) total  
             `;
             //console.log(sql);

               connection.query(sql, function (err, rows, fields) {
                   if (err) throw err
                   let response = new Array();
                   rows.forEach(function(r){
                        response.push(r.total);
                   });
                   res.send(response);
               });

           } else {
               res.redirect('/login');
           }
       });


}
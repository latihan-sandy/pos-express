module.exports = function(app) {

    let fs = app.get('fs');
    let connection = app.get('connection');
    let upload = app.get('upload');
    let pageName = "Product";
    let routeName = "products";
    let layouts = "pages/" + routeName;
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;


    let syncCategories = function(categories, product_id) {
        connection.query("DELETE FROM products_categories WHERE product_id = " + product_id, function(err, rows, fields) {
            if (err) throw err;
            if (categories && categories.length > 0) {
                categories.forEach(function(row) {
                    let data = {
                        "product_id": product_id,
                        "category_id": row
                    }
                    connection.query("INSERT INTO products_categories SET ? ", data, function(err, rows, fields) {
                        if (err) throw err;
                    });
                });
            }
        });
    }

    let deleteFile = function(id) {
        connection.query("SELECT * FROM products WHERE id = " + id, function(err, rows, fields) {
            if (err) throw err;
            let product = rows[0];
            if (product.image) {
                let path = __basedir + "/public/" + product.image;
                //console.log(path);
                try {
                    if (fs.existsSync(path)) {
                        //console.log(path);
                        fs.unlinkSync(path);
                    }
                } catch (err) {
                    console.error(err)
                }
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
            connection.query("SELECT COUNT(*) as total FROM products", function(err, rows, fields) {
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
                sql += " products.name as products_name, ";
                sql += " products.sku as products_sku, ";
                sql += " products.stock as products_stock, ";
                sql += " products.description as products_description, ";
                sql += " products.id as key_id, ";
                sql += " '" + action + "' as action ";

                let filter = "";
                if (searchValue && searchValue.length > 0) {
                    filter += " WHERE ";
                    filter += " products.name LIKE '%" + searchValue + "%' OR ";
                    filter += " products.sku LIKE '%" + searchValue + "%' OR ";
                    filter += " products.description LIKE '%" + searchValue + "%'";
                }
                sql += " FROM products " + filter;

                connection.query(sql, function(err, result, fields) {
                    if (err) throw err;
                    let totalFiltered = result.length;
                    sql += " ORDER BY " + columnName + " " + columnSortOrder + " LIMIT " + rowperpage + " OFFSET " + row;
                    connection.query(sql, function(err, result_query, fields) {
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
            connection.query("SELECT * FROM brands ORDER BY name ASC", function(err, result, fields) {
                if (err) throw err;
                let brands = result;
                connection.query("SELECT * FROM types ORDER BY name ASC", function(err, result, fields) {
                    if (err) throw err;
                    let types = result;
                    connection.query("SELECT * FROM suppliers ORDER BY name ASC", function(err, result, fields) {
                        if (err) throw err;
                        let suppliers = result;
                        connection.query("SELECT * FROM categories ORDER BY name ASC", function(err, result, fields) {
                            if (err) throw err;
                            let categories = result;
                            res.render(layouts + '/form', {
                                title: pageName,
                                submitURL: "/" + routeName + "/store",
                                listURL: "/" + routeName,
                                id: null,
                                data: null,
                                brands: brands,
                                types: types,
                                suppliers: suppliers,
                                categories: categories
                            });
                        });
                    });
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    // Store

    app.post('/' + routeName + '/store', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let categories = req.param('categories');
            let image = null;

            if (req.file && req.file.filename) {
                image = "uploads/" + req.file.filename;
            }

            let data = {
                "sku": req.param('sku'),
                "name": req.param('name'),
                "brand_id": req.param('brand_id'),
                "type_id": req.param('type_id'),
                "supplier_id": req.param('supplier_id'),
                "stock": req.param('stock'),
                "price_purchase": req.param('price_purchase'),
                "price_sales": req.param('price_sales'),
                "price_profit": req.param('price_profit'),
                "date_expired": req.param('date_expired'),
                "description": req.param('description'),
                "notes": req.param('notes'),
                "image": image,
                "created_at": req.param('created_at'),
                "updated_at": req.param('updated_at'),
            }
            connection.query("INSERT INTO products SET ?", data, function(err, result, fields) {
                if (err) throw err;
                let id = result.insertId;
                syncCategories(categories, id);
                req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record created successfully');
                req.flash('notice_type', 'success');
                res.redirect('/' + routeName + "/" + id);
            });
        } else {
            res.redirect('/login');
        }
    });

    // Details
    app.get('/' + routeName + '/:id', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let id = req.param('id');
            let sql = "SELECT DISTINCT";
            sql += " products.*,";
            sql += " brands.name as brands_name,";
            sql += " types.name as types_name,";
            sql += " suppliers.name as suppliers_name";
            sql += " FROM products";
            sql += " LEFT JOIN brands ON brands.id = products.brand_id";
            sql += " LEFT JOIN types ON types.id = products.type_id";
            sql += " LEFT JOIN suppliers ON suppliers.id = products.supplier_id WHERE products.id = " + id;
            connection.query(sql, function(err, result, fields) {
                if (err) throw err;
                let products = result[0];
                let sql2 = "SELECT * FROM categories ";
                sql2 += " INNER JOIN products_categories ON products_categories.category_id = categories.id WHERE product_id = " + id;
                connection.query(sql2, function(err, result, fields) {
                    if (err) throw err;
                    res.render(layouts + '/details', {
                        title: pageName,
                        listURL: "/" + routeName,
                        createURL: "/" + routeName + "/create",
                        editURL: "/" + routeName + "/" + id + "/edit",
                        deleteURL: "/" + routeName + "/delete/" + id,
                        id: id,
                        data: products,
                        categories: result
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
            connection.query("SELECT * FROM products WHERE id = " + id, function(err, result, fields) {
                if (err) throw err;
                let product = result[0];
                connection.query("SELECT * FROM brands ORDER BY name ASC", function(err, result, fields) {
                    if (err) throw err;
                    let brands = result;
                    connection.query("SELECT * FROM types ORDER BY name ASC", function(err, result, fields) {
                        if (err) throw err;
                        let types = result;
                        connection.query("SELECT * FROM suppliers ORDER BY name ASC", function(err, result, fields) {
                            if (err) throw err;
                            let suppliers = result;
                            connection.query("SELECT * FROM categories ORDER BY name ASC", function(err, result, fields) {
                                if (err) throw err;
                                let categories = result;
                                connection.query("SELECT * FROM products_categories WHERE product_id = " + id, function(err, result, fields) {
                                    if (err) throw err;
                                    let categoriesSelected = new Array();
                                    if (result.length > 0) {
                                        result.forEach(function(row) {
                                            categoriesSelected.push(row.category_id);
                                        });
                                    }
                                    res.render(layouts + '/form', {
                                        title: pageName,
                                        submitURL: "/" + routeName + "/" + id + "/update",
                                        listURL: "/" + routeName,
                                        createURL: "/" + routeName + "/create",
                                        deleteURL: "/" + routeName + "/delete/" + id,
                                        id: id,
                                        data: product,
                                        brands: brands,
                                        types: types,
                                        suppliers: suppliers,
                                        categories: categories,
                                        categoriesSelected: categoriesSelected.join(",")
                                    });
                                });
                            });
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
            connection.query("SELECT * FROM products WHERE id = " + id, function(err, result, fields) {
                if (err) throw err;
                let product = result[0];
                let image = product.image;

                if (req.file && req.file.filename) {
                    deleteFile(id);
                    image = "uploads/" + req.file.filename;
                }

                let categories = req.param('categories');
                let data = {
                    "sku": req.param('sku'),
                    "name": req.param('name'),
                    "brand_id": req.param('brand_id'),
                    "type_id": req.param('type_id'),
                    "supplier_id": req.param('supplier_id'),
                    "stock": req.param('stock'),
                    "price_purchase": req.param('price_purchase'),
                    "price_sales": req.param('price_sales'),
                    "price_profit": req.param('price_profit'),
                    "date_expired": req.param('date_expired'),
                    "description": req.param('description'),
                    "notes": req.param('notes'),
                    "image": image,
                    "updated_at": req.param('updated_at'),
                }
                connection.query("UPDATE products SET ? WHERE id = " + id, data, function(err, result, fields) {
                    if (err) throw err;
                    syncCategories(categories, id);
                    req.flash('notice_message', '<i class="fa fa-check"></i>&nbsp;Record updated successfully');
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
            deleteFile(id);
            connection.query("DELETE FROM products WHERE id = " + id, function(err, result, fields) {
                if (err) throw err;
                connection.query("DELETE FROM products_categories WHERE product_id = " + id, function(err, result, fields) {
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
            deleteFile(id);
            connection.query("DELETE FROM products WHERE id = " + id, function(err, result, fields) {
                if (err) throw err;
                connection.query("DELETE FROM products_categories WHERE product_id = " + id, function(err, result, fields) {
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

    app.post('/' + routeName + '/select2', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            let search = req.param('q');
            let type = req.param('type');
            let key = type === "0" ?  "price_purchase" : "price_sales";
            let where = " WHERE products.id <> 0"
            if(search){
                where += " AND name LIKE '%"+search+"%' OR sku LIKE '%"+search+"%'"
            }

            let sql = "SELECT id as id, sku as sku, name as text, stock as stock ,"+key+" as price FROM products "+where+" ORDER BY sku ASC, name ASC LIMIT 10 ";
            connection.query(sql, function(err, result, fields) {
                if (err) throw err;
                res.send(result);
            });
        }
    });
}
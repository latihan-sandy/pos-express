module.exports = function(app) {

    // 404
    app.use(function(req, res, next) {
        res.render('pages/errors/index', {
            title: "Page not found",
            code: 404,
            info1: "Who0ps! Page not found",
            info2: "This page cannot found or is missing."
        });
    });

    // 500 - Any server error
    app.use(function(err, req, res, next) {
        res.render('pages/errors/index', {
            title: "Page not found",
            code: 500,
            info1: "Internal Server Error",
            info2: "Why not try refreshing your page? or you can contact."
        });
    });


}
$(document).ready(function() {

    let dataTableColumns = [{
            name: 'products.sku',
            data: 'products_sku'
        }, {
            name: 'products.name',
            data: 'products_name'
        },
        {
            name: 'products.stock',
            data: 'products_stock'
        }, {
            name: 'products.id',
            data: 'action',
            "orderable": false
        },
    ];


    dataTableInit({
        "container": "#table-data",
        "route": "/products/datatable",
        "columns": dataTableColumns
    });

    var calcPriceSale = function() {
        let purchase = parseFloat($("#price_purchase").val());
        let profit = parseFloat($("#price_profit").val());
        let prc = parseFloat(profit / 100);
        let cost = purchase * prc;
        let priceSale = purchase + cost;
        $("#price_sales").val(priceSale || purchase);
    }

    $('#price_purchase').keyup(function() {
        calcPriceSale();
    });

    $('#price_profit').keyup(function() {
        calcPriceSale();
    });

    // $("#form-submit select").addClass("form-control");
    // $("#form-submit select").select2({
    //     theme: "bootstrap",
    // });

    if (!$("#price_purchase").val()) {
        $("#price_purchase").val(0);
    }

    if (!$("#price_sales").val()) {
        $("#price_sales").val(0);
    }

    if (!$("#price_profit").val()) {
        $("#price_profit").val(0);
    }

    if (!$("#stock").val()) {
        $("#stock").val(0);
    }

    if (!$("#date_expired").val()) {
        var dateTime = new Date();
        var nowDate = moment(dateTime).format("YYYY-MM-DD");
        $("#date_expired").val(nowDate);
    }

});
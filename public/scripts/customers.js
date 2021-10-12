$(document).ready(function() {

    let dataTableColumns = [{
            name: 'customers.name',
            data: 'customers_name'
        }, {
            name: 'customers.phone',
            data: 'customers_phone'
        }, {
            name: 'customers.email',
            data: 'customers_email'
        },
        {
            name: 'customers.website',
            data: 'customers_website'
        }, {
            name: 'customers.id',
            data: 'action',
            "orderable": false
        },
    ];


    dataTableInit({
        "container": "#table-data",
        "route": "/customers/datatable",
        "columns": dataTableColumns
    });

});
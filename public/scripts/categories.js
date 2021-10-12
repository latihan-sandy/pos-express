$(document).ready(function() {

    let dataTableColumns = [{
        name: 'categories.name',
        data: 'categories_name'
    }, {
        name: 'categories.description',
        data: 'categories_description',
        render: function(data, type, row, meta) {
            var notif = data.split(".");
            return notif[0];
        }
    }, {
        name: 'categories.id',
        data: 'action',
        "orderable": false
    }, ];


    dataTableInit({
        "container": "#table-data",
        "route": "/categories/datatable",
        "columns": dataTableColumns
    });

});
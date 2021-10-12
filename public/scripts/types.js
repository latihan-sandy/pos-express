$(document).ready(function() {

    let dataTableColumns = [{
        name: 'types.name',
        data: 'types_name'
    }, {
        name: 'types.description',
        data: 'types_description',
        render: function(data, type, row, meta) {
            var notif = data.split(".");
            return notif[0];
        }
    }, {
        name: 'types.id',
        data: 'action',
        "orderable": false
    }, ];


    dataTableInit({
        "container": "#table-data",
        "route": "/types/datatable",
        "columns": dataTableColumns
    });

});
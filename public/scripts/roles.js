$(document).ready(function() {

    let dataTableColumns = [{
        name: 'roles.name',
        data: 'roles_name'
    }, {
        name: 'roles.description',
        data: 'roles_description',
        render: function(data, type, row, meta) {
            var notif = data.split(".");
            return notif[0];
        }
    }, {
        name: 'roles.id',
        data: 'action',
        orderable: false,
        render: function(data, type, row, meta) {
            if (row.roles_name !== 'Admin') {
                return data;
            } else {
                var action = data.split("&nbsp;");
                var btn = "";
                action.forEach(function(row) {
                    let temp = $(row);
                    if (temp.hasClass("btn-show")) {
                        btn += row;
                    }
                });
                return btn;
            }
        }
    }, ];


    dataTableInit({
        "container": "#table-data",
        "route": "roles/datatable",
        "columns": dataTableColumns
    });

});
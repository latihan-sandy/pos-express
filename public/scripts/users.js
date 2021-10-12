$(document).ready(function() {

    let dataTableColumns = [{
        name: 'users.username',
        data: 'users_username'
    }, {
        name: 'users.email',
        data: 'users_email'
    }, 
    {
        name: 'users.groups',
        data: 'users_groups',
        render: function(data, type, row, meta) {
            return data ? data : "-";
        }
    }
    , {
        name: 'users.is_active',
        data: 'users_is_active',
        render: function (data, type, row, meta) {
            if (data) {
                return '<span class="label label-success">Yes</span></td>';
            } else {
                return '<span class="label label-danger">No</span></td>';
            }
        }
    }
    , {
        name: 'key_id',
        data: 'action',
        "orderable": false
    }, ];


    dataTableInit({
        "container": "#table-data",
        "route": "/users/datatable",
        "columns": dataTableColumns
    });

});
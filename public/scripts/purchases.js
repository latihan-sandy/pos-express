$(document).ready(function() {

    let dataTableColumns = [{
            name: 'transactions.invoice_date',
            data: 'transactions_invoice_date'
        }, {
            name: 'transactions.invoice_number',
            data: 'transactions_invoice_number'
        }, {
            name: 'suppliers.name',
            data: 'suppliers_name',
            render: function(data, type, row, meta) {
                return data ? data : "-";
            }
        },
        {
            name: 'transactions.grandtotal',
            data: 'transactions_grandtotal'
        },
        {
            name: 'transactions.status',
            data: 'transactions_status',
            render: function(data, type, row, meta) {
                if (parseInt(data) === 1) {
                    return '<span class="label label-success">Paid</span></td>';
                } else {
                    return '<span class="label label-danger">Unpaid</span></td>';
                }
            }
        },
        {
            name: 'transactions.id',
            data: 'action',
            orderable: false,
            render: function(data, type, row, meta) {
                var action = data.split("&nbsp;");
                var btn = "";
                action.forEach(function(act) {
                    let temp = $(act);
                    if (parseInt(row.transactions_status) === 1) {
                        if (temp.hasClass("btn-show")) {
                            btn += "&nbsp;" + act;
                        }
                    } else {
                        btn += "&nbsp;" + act;
                    }
                });
                return btn;
            }
        },
    ];


    dataTableInit({
        "container": "#table-data",
        "route": "/purchases/datatable",
        "columns": dataTableColumns
    });

    var calculate = function() {
        let subtotal = parseFloat(0);
        $(".total").each(function() {
            subtotal = parseFloat(subtotal + parseFloat($(this).val()));
        });
        let disc = parseFloat(subtotal) * parseFloat(5 / 100);
        let tax = parseFloat(subtotal) * parseFloat(10 / 100);
        let grandtotal = (parseFloat(subtotal) + parseFloat(tax)) - parseFloat(disc);
        let cash = parseFloat($("#cash").val());
        let change = parseFloat(cash) - parseFloat(grandtotal);
        $("#subtotal").val(subtotal.toFixed(2));
        $("#discount").val(disc.toFixed(2));
        $("#tax").val(tax.toFixed(2));
        $("#grandtotal").val(grandtotal.toFixed(2));
        $("#change").val(change >= 0 ? change.toFixed(2) : 0);

    }

    var myTemplate = function(data) {
        if (data.sku) {
            return data.sku + "<br>" + data.text;
        } else {
            return "Searching...";
        }
    }

    var myTemplateSelection = function(data) {
        return data.sku + " - " + data.text + "<input type='hidden' id='item-" + data.id + "' data-price='" + data.price + "'   value=''/>";
    }

    var addRow = function(id) {
        let html = "";
        let productId = "prod" + id;
        html += "<tr id='row" + id + "' data-id='" + id + "'>";
        html += "<td><select name='product_id[]' id='" + productId + "' data-id='" + id + "' class='form-control product_id' style=''></select></td>";
        html += "<td><input name='price[]' type='number' data-id='" + id + "' step='any' value='0' min='0' class='form-control price' readonly='readonly' /></td>";
        html += "<td><input name='qty[]' type='number' data-id='" + id + "' step='any' value='0' min='0' class='form-control qty' /></td>";
        html += "<td><input name='total[]' type='number' data-id='" + id + "' step='any' value='0' min='0' class='form-control total' readonly='readonly' /></td>";
        html += "<td><a href='javascript:void(0);' class='btn btn-sm btn-danger btn-delete-row'><i class='fa fa-trash'></i></a></td>";
        html += "</tr>";
        $("#table-invoice tbody").append(html);

        $("#" + productId).select2({
            theme: "bootstrap",
            ajax: {
                url: "/products/select2",
                type: "POST",
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    return {
                        q: params.term, // search term,
                        type: 0
                    };
                },
                processResults: function(data) {
                    // parse the results into the format expected by Select2.
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data
                    return {
                        results: data
                    };
                },
                cache: true,
            },
            templateResult: myTemplate,
            templateSelection: myTemplateSelection,
            escapeMarkup: function(markup) {
                return markup;
            }
        });

    }

    $("#btn-add").click(function(e) {
        e.preventDefault();
        let row = $("#table-invoice tbody tr:last").attr("data-id");
        addRow(parseInt(row) + 1);
        calculate();
        return false;
    });

    $("body").on("click", ".btn-delete-row", function(e) {
        e.preventDefault();
        $(this).parent().parent().remove();
        let row = $("#table-invoice tbody tr").length;
        if (row === 0) {
            addRow(1);
        }
        calculate();
        return false;
    });

    $("body").on("change", ".product_id", function(e) {
        e.preventDefault();
        let rowId = $(this).attr("data-id");
        let product_id = $(this).val();

        let price = parseFloat($("#item-" + product_id).attr("data-price"));
        let exists = $("body #item-" + product_id).length;
        if (parseInt(exists) > 1) {
            toastShow({
                "title": "Warning",
                "message": "The product already exists !!",
                "mode": "warning"
            });
            $(this).parent().parent().remove();
        } else {

            $(".price[data-id='" + rowId + "']").val(price);

            $(".qty[data-id='" + rowId + "']").attr("min", 1);
            $(".qty[data-id='" + rowId + "']").val(1);
            $(".total[data-id='" + rowId + "']").val(price);
        }
        calculate();
        return false;
    });

    $("body").on("keyup", ".qty", function(e) {
        e.preventDefault();
        let rowId = $(this).attr("data-id");
        let qty = parseFloat($(this).val());
        let price = parseFloat($(".price[data-id='" + rowId + "']").val());
        let total = parseFloat(qty * price) || 0;
        $(".total[data-id='" + rowId + "']").val(total.toFixed(2));
        calculate();
        return false;
    });

    $("body").on("keyup", "#cash", function(e) {
        e.preventDefault();
        calculate();
        return false;
    });

    $("#form-invoice").submit(function(e) {
        e.preventDefault();
        let supplier_id = $("#supplier_id").val();
        let grandtotal = parseFloat($("#grandtotal").val());
        if (!supplier_id) {
            toastShow({
                "title": "Warning",
                "message": "The supplier field is required !!",
                "mode": "warning"
            });
        } else if (grandtotal === 0) {
            toastShow({
                "title": "Warning",
                "message": "The products item is required !!",
                "mode": "warning"
            });
        } else {
            let form = this;
            swal({
                title: "Confirmation",
                text: "Are you sure you want to save this item ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#f8b32d",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: false
            }, function() {
                $(form).unbind('submit').submit();
            });
        }
        return false;
    });

    $("#btn-print").click(function(e) {
        e.preventDefault();
        let url = $(this).attr("data-href");
        $("#iframe-invoice").attr("src", url);
        $("#myModal").modal("show");
        return false;
    });


    addRow(1);

});
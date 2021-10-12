$(document).ready(function() {

    $("body").on("click", ".btn-report-show", function(e) {
        e.preventDefault();
        let url = $(this).attr("data-href");
        $("#iframe-report").attr("src", url);
        $("#myModal").modal("show");
        return false;
    });

    $('.date-filter').datepicker({
        autoclose: true,
        clearBtn: true,
        format: 'yyyy-mm-dd'
    }).on('changeDate', function(ev) {
        let url = $("#iframe-report").attr("src");
        let prefix = url.split('/');
        let first_date = $("#first_date").val();
        let last_date = $("#last_date").val();
        let baseUrl = $("#baseUrl").val();
        let newPrefix = new Array();
        newPrefix.push(prefix[3]);
        newPrefix.push(prefix[4]);
        newPrefix.push(prefix[5]);
        newPrefix.push(first_date);
        newPrefix.push(last_date);
        let reportUrl = newPrefix.join("/");
        //console.log(prefix, reportUrl);
        if (first_date && last_date) {
            $("#iframe-report").attr("src", baseUrl +"/" + reportUrl);
        }
    });

    $("#btn-print").click(function(e) {
        e.preventDefault();
        document.getElementById('iframe-report').contentWindow.print();
        return false;
    });

    if ($(".table-body-detail").length){
        $(".table-body-detail").each(function(){
            let elem = $(this);
            let id = $(this).attr("data-id");
            let baseUrl = $("#baseUrl").val();
            $.get(baseUrl + "/reports/details/"+id, function(result){
                elem.empty();
                result.forEach(function(row){
                    let html = "<tr>"
                    html += "<td>" + row.sku + "  " + row.name + "</td>";
                    html += "<td>" + row.price + "</td>";
                    html += "<td>" + row.qty + "</td>";
                    html += "<td>" + row.total + "</td>";
                    html += "</tr>";
                    elem.append(html);
                });
            });
        });
    }


});
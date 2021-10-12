$(document).ready(function() {

    var d = new Date();
    var n = d.getFullYear();


    var barChart = function(container, purchase, sale) {

        Highcharts.chart(container, {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Monthly Sale Vs Purchase'
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: 'Total Cost'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                name: 'Purchase',
                data: purchase
            }, {
                name: 'Sale',
                data: sale
            }]
        });
    }

    var pieChart = function(data, title, container) {

        let items = new Array();

        data.forEach(function(row) {
            items.push({
                "name": row.name,
                "y": parseInt(row.total)
            });
        });

        let year = n;

        Highcharts.chart(container, {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Product',
                colorByPoint: true,
                data: items
            }]
        });
    }

    var loadData = function() {
        headerRequest();
        $.post("/dashboards/count/products", {}, function (result) {
            $(".count-product").text(result[0].total);
        });
        $.post("/dashboards/count/brands", {}, function (result) {
             $(".count-brand").text(result[0].total);
        });
        $.post("/dashboards/count/suppliers", {}, function (result) {
            $(".count-supplier").text(result[0].total);
        });
        $.post("/dashboards/count/customers", {}, function (result) {
            $(".count-customer").text(result[0].total);
       });
       $.post("/dashboards/piechart/0", {}, function (result) {
            pieChart(result, "Purchase By Product", "pie-chart2");
       });
       $.post("/dashboards/piechart/1", {}, function (result) {
            pieChart(result, "Sale By Product", "pie-chart1");
       });
       $.post("/dashboards/barchart/0", {}, function (result) {
            let purchase = result;
             $.post("/dashboards/barchart/1", {}, function (result) {
                 let sale = result;
                 barChart("bar-chart", purchase, sale);
             });
       });
       $("#loader").addClass("hidden");
    }


    loadData();

});
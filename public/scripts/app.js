moment.locale($("html").attr("lang"));

jQuery.browser = {};
(function() {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
})();

function toggleFullscreen(elem) {
    elem = elem || document.documentElement;
    if (!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        $(".icon-resize").removeClass("glyphicon-resize-full").addClass("glyphicon-resize-small");
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        $(".icon-resize").removeClass("glyphicon-resize-small").addClass("glyphicon-resize-full");
    }
}

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

var browser = function() {
    var ua = navigator.userAgent,
        tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {
            name: 'IE',
            version: (tem[1] || '')
        };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/)
        if (tem != null) {
            return {
                name: 'Opera',
                version: tem[1]
            };
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
    }
    return {
        name: M[0],
        version: M[1]
    };
}

var jsonToString = function(data) {
    var encoded = JSON.stringify(data);
    encoded = encoded.replace(/\\"/g, '"')
        .replace(/([\{|:|,])(?:[\s]*)(")/g, "$1'")
        .replace(/(?:[\s]*)(?:")([\}|,|:])/g, "'$1")
        .replace(/([^\{|:|,])(?:')([^\}|,|:])/g, "$1\\'$2");
    return encoded;
};

var stringToJson = function(input) {
    var result = [];

    //replace leading and trailing [], if present
    input = input.replace(/^\[/, '');
    input = input.replace(/\]$/, '');

    //change the delimiter to 
    input = input.replace(/},{/g, '};;;{');

    // preserve newlines, etc - use valid JSON
    //https://stackoverflow.com/questions/14432165/uncaught-syntaxerror-unexpected-token-with-json-parse
    input = input.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    // remove non-printable and other non-valid JSON chars
    input = input.replace(/[\u0000-\u0019]+/g, "");

    input = input.split(';;;');

    input.forEach(function(element) {
        // console.log(JSON.stringify(element));

        result.push(JSON.parse(element));
    }, this);

    return result;
}

var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var arrayDistinct = function(arr) {
    let unique_array = []
    for (let i = 0; i < arr.length; i++) {
        if (unique_array.indexOf(arr[i]) == -1) {
            unique_array.push(arr[i])
        }
    }
    return unique_array
}

var timeStamp = function() {
    var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
    return Math.floor(timeStampInMs);
}

var fileSizeInfo = function(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

var numberFormat = function(number, decimals, dec_point, thousands_sep) {
    // http://kevin.vanzonneveld.net
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://getsprink.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +     bugfix by: Howard Yeend
    // +    revised by: Luke Smith (http://lucassmith.name)
    // +     bugfix by: Diogo Resende
    // +     bugfix by: Rival
    // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
    // +   improved by: davook
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Jay Klehr
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Amir Habibi (http://www.residence-mixte.com/)
    // +     bugfix by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Drew Noakes
    // *     example 1: number_format(1234.56);
    // *     returns 1: '1,235'
    // *     example 2: number_format(1234.56, 2, ',', ' ');
    // *     returns 2: '1 234,56'
    // *     example 3: number_format(1234.5678, 2, '.', '');
    // *     returns 3: '1234.57'
    // *     example 4: number_format(67, 2, ',', '.');
    // *     returns 4: '67,00'
    // *     example 5: number_format(1000);
    // *     returns 5: '1,000'
    // *     example 6: number_format(67.311, 2);
    // *     returns 6: '67.31'
    // *     example 7: number_format(1000.55, 1);
    // *     returns 7: '1,000.6'
    // *     example 8: number_format(67000, 5, ',', '.');
    // *     returns 8: '67.000,00000'
    // *     example 9: number_format(0.9, 0);
    // *     returns 9: '1'
    // *    example 10: number_format('1.20', 2);
    // *    returns 10: '1.20'
    // *    example 11: number_format('1.20', 4);
    // *    returns 11: '1.2000'
    // *    example 12: number_format('1.2000', 3);
    // *    returns 12: '1.200'
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function(n, prec) {
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}


var headerRequest = function() {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
        }
    });
}

var toastShow = function(option) {
    var title = option.title;
    var message = option.message;
    var mode = option.mode;
    if (mode == 'warning') {
        toastr.warning(message, title);
    } else if (mode == 'success') {
        toastr.success(message, title);
    } else if (mode == 'error') {
        toastr.error(message, title);
    } else if (info == 'info') {
        toastr.info(message, title);
    }
}

var slug = function(str) {
    var $slug = '';
    var trimmed = $.trim(str);
    $slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
    replace(/-+/g, '-').
    replace(/^-|-$/g, '');
    return $slug.toLowerCase();
}

var ucFirst = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var dataTableInit = function(option) {

    $(option.container).DataTable({
        'processing': true,
        'serverSide': true,
        'ajax': {
            'url': option.route,
            'type': 'POST',
            'headers': {
                'X-CSRFToken': $('meta[name="csrf-token"]').attr('content'),
            },
            "data": function(d) {
                let csrf_name = $('meta[name="csrf-param"]').attr('content');
                let csrf_value = $('meta[name="csrf-token"]').attr('content');
                let obj = JSON.parse('{ "' + csrf_name + '":"' + csrf_value + '" }');
                return $.extend({}, d, obj);
            }
        },
        'columns': option.columns,
        'rowCallback': function(row, data) {
            $(row).attr("data-id", data.key_id);
        },
        "order": [
            [option.columns.length - 1, 'desc']
        ]
    });


    $("body").on("click", ".btn-show", function(e) {
        e.preventDefault();
        let id = $(this).parent().parent().attr("data-id");
        let url = $(this).attr("data-route").replace("row_id", id);
        window.location.href = url;
        return false;
    });

    $("body").on("click", ".btn-edit", function(e) {
        e.preventDefault();
        let id = $(this).parent().parent().attr("data-id");
        let url = $(this).attr("data-route").replace("row_id", id);
        window.location.href = url;
        return false;
    });

    $("body").on("click", ".btn-delete", function(e) {
        e.preventDefault();
        let id = $(this).parent().parent().attr("data-id");
        let url = $(this).attr("data-route").replace("row_id", id);
        swal({
            title: "Delete Confirmation",
            text: "Are you sure you want to delete this item ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f8b32d",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                let csrf_name = $('meta[name="csrf-param"]').attr('content');
                let csrf_value = $('meta[name="csrf-token"]').attr('content');
                let obj = JSON.parse('{ "' + csrf_name + '":"' + csrf_value + '", "is_ajax": "y" }');
                $.ajax({
                    type: "DELETE",
                    url: url,
                    data: obj,
                    success: function(xml, textStatus, xhr) {
                        if (parseInt(xhr.status) === 200) {
                            swal.close();
                            toastShow({
                                "title": "Success Message",
                                "message": "Record deleted successfully",
                                "mode": "success"
                            });
                            $(option.container).DataTable().ajax.reload();
                        }
                    }
                })
            }
        });
        return false;
    });

}

$(document).ready(function() {

    var dateTime = new Date();
    var nowDate = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

    $('[data-toggle="tooltip"]').tooltip();

    $("#btn-delete-data").click(function(e) {
        e.preventDefault();
        let url = $(this).attr("href");
        swal({
            title: "Delete Confirmation",
            text: "Are you sure you want to delete this item ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f8b32d",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                document.getElementById("form-delete").submit();
            }
        });
        return false;
    });

    if ($(".select2").length > 0) {
        // $(".select2").removeClass("form-control").addClass("form-control");
        $(".select2").select2({
            theme: "bootstrap",
        });
    }

    if ($(".input-datepicker").length) {
        $(".input-datepicker").each(function() {
            let valDate = $(this).val();
            if (valDate) {
                $(this).val(moment(valDate).format("YYYY-MM-DD"));
            }
        });
        $(".input-datepicker").datepicker({
            autoclose: true,
            clearBtn: true,
            format: 'yyyy-mm-dd'
        });
    }



    if ($(".datetime-picker").length) {
        $('.datetime-picker').datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss'
        });
    }

    if ($(".time-picker").length) {
        $('.time-picker').datetimepicker({
            format: 'HH:mm'
        });
    }

    if ($(".file-input-image").length) {
        if ($(".file-input-image-preview").length) {
            var imageUrl = $(".file-input-image-preview").val();
            $(".file-input-image").fileinput({
                initialPreview: [imageUrl],
                initialPreviewAsData: true,
                showUpload: false,
                allowedFileExtensions: ["jpg", "png", "gif"],
                showRemove: false,
                maxFileCount: 1,
                removeLabel: '',
            });
        } else {
            $(".file-input-image").fileinput({
                showUpload: false,
                showRemove: false,
                allowedFileExtensions: ["jpg", "png", "gif"],
                maxFileCount: 1,
            });
        }
    }


    $(".modal-wide").on("show.bs.modal", function() {
        var height = $(window).height() - 200;
        $(this).find(".modal-body").css("max-height", height);
    });

    if ($(".input-slug").length && $(".output-slug").length) {
        $('.input-slug').keyup(function() {
            let input_slug = $('.input-slug').val();
            let word_slug = slug(input_slug);
            $(".output-slug").val(word_slug);
        });
    }

    if ($(".filestyle").length) {
        $(".filestyle").filestyle({
            input: false
        });
    }

    if ($("#form-submit").length) {
        $("#form-submit").submit(function(e) {
            e.preventDefault();
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
            return false;
        });
    }

    if ($(".treeview-menu").length) {
        $(".treeview-menu").each(function(row) {
            if ($(this).children("li").length == 0) {
                $(this).parent().remove();
            }
        });
    }

    if ($(".select-multiple").length) {
        $(".select-multiple").select2({
            theme: "bootstrap",
        });
    }


    if ($("#created_at").length) {
        $("#created_at").val(nowDate);
    }

    if ($("#updated_at").length) {
        $("#updated_at").val(nowDate);
    }

    $("select").each(function() {
        let selected = $(this).attr("data-selected");
        let selectContent = $(this);
        if (selected) {
            let selectedArr = selected.split(",");
            if (selectedArr.length > 0) {
                $(selectContent).val(selectedArr).change();
            }
        }
    });


    $(".sidebar-menu").removeClass("hidden");

     var url = window.location;
     $('ul.nav li').removeClass('active'); //remove active class from all li
     $('ul.nav a[href="' + url + '"]').parents('li').addClass('active'); 

});
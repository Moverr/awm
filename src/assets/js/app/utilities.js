/* ****************************************************************************
 * general                                                                    *
 **************************************************************************** */

function hideContent() {
    $('.content').hide();
}
;

function showContent($element) {
    do {
        $element.show();
        $element = $element.parent();
    } while ($element.hasClass('content'));
}
;

function addRow($rowContainer, data, object, handler, id) {
    var celltype = $rowContainer.is('thead') ? 'th' : 'td';
    var $row = $('<tr>');
    $row.data('object', object);
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            $row.append($('<' + celltype + '>').html(data[property]));
        }
    }
    $row.on('click touch', handler);
    $row.attr('data-id', id);
    $rowContainer.append($row);
    return $row;
}
;

function updateRow($row, data, object, handler, id) {
    var celltype = $row.is('th') ? 'th' : 'td';
    $row.data('object', object);
    $row.empty();
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            $row.append($('<' + celltype + '>').html(data[property]));
        }
    }
    $row.on('click touch', handler);
    $row.attr('data-id', id);

    $('#defaultTableContainer table').trigger("update", true);

    var $cells = $row.find('td');
    var oldColor = $($cells[0]).css('background-color');
    $cells.css('background-color', '#66cc00');
    $cells.animate({
        backgroundColor: oldColor
    }, 1500, function () {
        $cells.css('background-color', '');
    });
}
;

function highlightUpdatedCell($cell) {
    var oldColor = $cell.css('background-color');
    $cell.css('background-color', '#66cc00');
    $cell.animate({
        backgroundColor: oldColor
    }, 1500, function () {
        $cell.css('background-color', '');
    });
}
;

function addClassToTableColumn($table, columnNumber, clazz) {
    // arrays in the DOM tree start with index one, not zero, so always add one
    columnNumber += 1;

    $table.find('tr td:nth-child(' + columnNumber + ')').addClass(clazz);
}
;

function addClassToColumnOfTableRow($row, columnNumber, clazz) {
    $row.find('td:nth-child(' + columnNumber + ')').addClass(clazz);
}
;

function addClassToDefaultTableColumn(columnNumber, clazz) {
    $('#defaultTableContainer table').find('tr td:nth-child(' + columnNumber + ')').addClass(clazz);
}
;

function formatCurrency(amount) {
    var negative = amount < 0;
    amount = Math.abs(amount);

    amount = Math.floor(amount / 100); // don't display Cents
    var lastAmount = amount;
    var display = '';
    amount = Math.floor(amount / 1000);

    while (amount > 0) {
        display = ',' + numberToThreeDigits(lastAmount % 1000) + display;
        lastAmount = amount;
        amount = Math.floor(amount / 1000);
    }

    display = lastAmount + display;

    if (negative) {
        display = '-' + display;
    }

    return display;
}
;

function unformatCurrency(text) {
    if (!$.isNumeric(text.substr(-1))) { // the currency code
        text = text.substr(0, text.length - 4);
    }

    return text.replace(/,/g, '') + '00';
}
;

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(date) {
    var dateObject = '';
    try {
        var dateObject = new Date(parseInt(date));

        if (isNaN(dateObject.getTime())) {
            // date is not valid
            return '';
        } else {
            // date is valid
            return numberToTwoDigits(dateObject.getDate()) + " " + months[dateObject.getMonth()] + " " + dateObject.getFullYear();
        }
    } catch (err) {
        return '';
    }
}
;

function unformatDate(text) {
    var parts = text.split(' ');
    var day = parseInt(parts[0]);
    var month = months.indexOf(parts[1]);
    var year = parseInt(parts[2]);
    var date = new Date(year, month, day, 12, 0, 0);
    return date;
}
;

function formatDateNarrow(date) {
    var dateObject = new Date(date);
    return numberToTwoDigits(dateObject.getDate()) + "/" + months[dateObject.getMonth()] + "/" + dateObject.getFullYear();
}
;

function formatDateShort(date) {
    var dateObject = new Date(date);
    return numberToTwoDigits(dateObject.getDate()) + "/" + numberToTwoDigits(dateObject.getMonth() + 1) + "/" + dateObject.getFullYear();
}
;

function formatLocalDate() {
    var now = new Date(),
            tzo = -now.getTimezoneOffset(),
            dif = tzo >= 0 ? '+' : '-',
            pad = function (num) {
                var norm = Math.abs(Math.floor(num));
                return (norm < 10 ? '0' : '') + norm;
            };
    return now.getFullYear()
            + '-' + pad(now.getMonth() + 1)
            + '-' + pad(now.getDate())
            + 'T' + pad(now.getHours())
            + ':' + pad(now.getMinutes())
            + ':' + pad(now.getSeconds())
            + dif + pad(tzo / 60)
            + ':' + pad(tzo % 60);
}
;

function formatPercentage(amount) {
    return (amount / 1000).toFixed(2);
}
;

function formatPercentageShort(amount) {
    return Math.round(amount / 1000);
}
;

function unformatPercentage(text) {
    if (text.endsWith(' %')) {
        text = text.substr(0, text.length - 2);
    }

    var index = text.indexOf('.');

    if (index < 0) {
        return text + "000";
    } else {
        return text.replace(/\./g, '') + "000".substr(0, 4 - (text.length - index));
    }
}
;

function numberToTwoDigits(number) {
    return (number < 10 ? "0" : "") + number;
}
;

function numberToThreeDigits(number) {
    return (number < 100 ? "0" : "") + numberToTwoDigits(number);
}
;

function getTargetFromObject($item, object) {
    var targets = $item.data('target').split('.');
    var target = object;
    $.each(targets, function (index, item) {
        target = target[item];
    });
    return target;
}
;

function exists(obj) {
    return typeof (obj) !== "undefined" && obj !== null;
}
;

function getRowContainer(tableContainerSelector, titles) {
    var $tableContainer = $(tableContainerSelector);
    $tableContainer.empty();
    showContent($tableContainer);

    var $table = getEmptyTable(true);
    $tableContainer.append($table);

    var $rowContainer = $table.find('thead');
    addRow($rowContainer, titles);

    $rowContainer = $table.find('tbody');

    $tableContainer.append($('<p class="content" id="tableMessage"></p>'));

    return $rowContainer;
}
;

function getDefaultRowContainer(titles) {
    return getRowContainer('#defaultTableContainer', titles);
}
;

function initDefaultContent(title) {
    hideContent();
    $('h3.page-header').text(title);
    $('h3.page-header').show();
    $('h4.sub-header').hide();
}
;

function updateDefaultSortableTable() {
    $('#defaultTableContainer table').trigger('updateAll');
}
;

var MessageType = Object.freeze({
    SUCCESS: 'alert-success',
    INFO: 'alert-info',
    WARNING: 'alert-warning',
    DANGER: 'alert-danger'
});

function message(title, text, type, timeout) {
    timeout = timeout || 2000;
    $('#messagebox strong').text(title);
    $('#messagebox span').text(text);
    $("#messagebox").removeClass();
    $("#messagebox").addClass('alert ' + type);
//    $("#messagebox").fadeTo(timeout, 500).slideUp(500);
    $("#messagebox").slideDown(500).delay(timeout).slideUp(500);
}
;

function getEmptyTable(sortable) {
    var $table = $('<table class="table table-striped table-bordered">');

    if (sortable) {
        $table.addClass('tablesorter tablesorter-bootstrap');
    }

    $table.append($('<thead>'));
    $table.append($('<tbody>'));

    return $table;
}
;

function capitalize(text) {
    if (!exists(text)) {
        return null;
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
;

function tableMessage(text) {
    $('#tableMessage').text(text);
    $('#tableMessage').show();
}
;

function getDefaultTableSorter(sorting) {
    var sortList;
    if ("unsorted" !== sorting) {
        sortList = [[0, 1]]; // first column, descending order (ascending would be 0 at second parameter)
    }

    return {
//        debug           : true,
        theme: "bootstrap",
        widthFixed: false,
        headerTemplate: '{content} {icon}',
        sortReset: true, // third click on the header will reset column to default - unsorted
        sortRestart: true, // Resets the sort direction so that clicking on an unsorted column will sort in the sortInitialOrder direction.
        sortList: sortList,
        widgets: ["uitheme", "filter", "zebra"],
        widgetOptions: {
            filter_reset: ".reset",
            filter_cssFilter: "form-control"
        }
    };
}
;

function sortAssociateArray(dataArray) {
    if (Array.isArray(dataArray)) {
        return  dataArray.sort(function (a, b) {
            return a.data - b.data;
        });
    }
    return null;
};

function statusbar(text) {
    // print text, wait two seconds, fadeout text within two seconds, empty text
    var $statusbar = $('#statusbar');
    $statusbar.stop(true, true);
    $statusbar.text(text);
    setTimeout(function () {
//        var oldColor = $('#statusbar').css('color');
        var backgroundColor = $('#statusbar').css('background-color');
        $statusbar.animate({
            color: backgroundColor
        }, 2000, function () {
            $statusbar.text('');
            //$statusbar.css('color', oldColor);
            $statusbar.css('color', 'rgba(102,102,102,1.0)'); // dark grey
        });
    }, 2000);
}
;

function getSidebarSubitemSelector(parent, handler, action) {
    return 'li[data-parent="' + parent + '"][data-handler="' + handler + '"][data-action="' + action + '"] a';
}
;

function addHistory(title, url, selector, args) {
    if (doHistoryUpdate) {
        history.pushState({selector: selector}, title, url);
    } else {
        doHistoryUpdate = true;
    }
}
;

function printData() {
    tab = $('#defaultTableContainer table').get(0); // id of table
    newWin = window.open("");
    var htmlToPrint = '' +
            '<style type="text/css">' +
            'table th, table td {' +
            'border:1px solid #000;' +
            'padding;0.5em;' +
            '}' +
            '</style>';
    htmlToPrint += tab.outerHTML;
    htmlToPrint = "<h1>" + $("#hiddenPrintedTitle").val() + "</h1>" + htmlToPrint;
    newWin.document.write(htmlToPrint);
    newWin.print();
    newWin.close();
}
;

function allLetter(inputtxt)
{
    var letters = /^[A-Za-z]+$/;
    if (inputtxt.value.match(letters))
    {
        return true;
    }
    else
    {
        alert("message");
        return false;
    }
}
;


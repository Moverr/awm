/* global Storage */

var storageVersion = 9;
var tenantId = window.location.pathname.split("/")[1];
var currencyCode = localStorage['currencyCode'] || 'UNKNOWN';
var doHistoryUpdate = true;

var eventtype = Object.freeze({
    CREATE: 'create',
    UPDATE: 'update',
    DELTE: 'delete',
    UNCHANGED: 'unchanged'
});

//var tableSorter = {
//    theme           : "bootstrap",
//    widthFixed      : false,
//    headerTemplate  : '{content} {icon}',
//    sortReset       : true, // third click on the header will reset column to default - unsorted
//    sortRestart     : true, // Resets the sort direction so that clicking on an unsorted column will sort in the sortInitialOrder direction.
//    sortList        : [[0, 1]], // first column, descending order (ascending would be 0 at second parameter)
//    widgets         : ["uitheme", "filter", "zebra"],
//    widgetOptions   : {
//        filter_reset: ".reset",
//        filter_cssFilter: "form-control"
//    }
//};

var clientList = new ClientList();
var groupList = new GroupList();
var officerList = new OfficerList();
var loanList = new LoanList();
var savingsAccountList = new SavingsAccountList();
var accountList = new AccountList();
var shareList = new ShareList();

var handlers = {
    Loan: new LoanHandler(),
    SavingsAccount: new SavingsAccountHandler(),
    Client: new ClientHandler(),
    Communication: new CommunicationHandler(),
    Reporting: new ReportingHandler(),
    Accounting: new AccountingHandler(),
    Options: new Options(),
    Management: new ManagementHandler(),
    ActionRequired: new ActionRequiredHandler(),
    Dashboard: new DashboardHandler(),
    Share: new ShareHandler()
};

var host = window.location.origin;
//host = window.location.protocol + '//tpe.awamo360.com';
host = window.location.protocol + '//tpe.awamo360.com';
//host = window.location.protocol + '//localhost:2060';
var username = null;
var authentication = null;
var user = null;
var currentTable = 'none';

var tenant = {
    name: 'awamo MFI ltd.',
    manager: {
        id: 8,
        username: 'cockpituser1',
        firstname: 'Dirk',
        lastname: 'Podolak',
        fullname: 'Podolak, Dirk',
        phone1: '+49-123-4567890',
        email: 'podolak@awamo.com'
    }
};

var BIT_MASK_DAY = 1;
var BIT_MASK_WEEK = 2;
var BIT_MASK_MONTH = 4;
var BIT_MASK_YEAR = 8;

function getAuthenticationHeader() {
    return {tenantId: tenantId, authentication: authentication};
}
;

function ajax(url, type, successCallback, data, headers, failCallback, alwaysCallback) {
    if (typeof (headers) === "undefined") {
        headers = getAuthenticationHeader();
    }

    if (typeof (failCallback) === "undefined") {
        failCallback = function (e) {
            console.log('fail');
            console.log(e);
        };
    }

    $.ajax({
        url: host + url,
        type: type,
        data: data,
        headers: headers,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    })
            .done(successCallback)
            .fail(failCallback)
            .always(alwaysCallback);
}
;

/* initialization */
function initApp() {
    window.onpopstate = function (e) {
        if (e.state !== null) {
            doHistoryUpdate = false;
            $(e.state.selector).click();
        }
    };

    String.prototype.capitalizeFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }

    // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
    if (!Array.prototype.includes) {
        Array.prototype.includes = function (searchElement /*, fromIndex*/) {
            'use strict';
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {
                    k = 0;
                }
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }

    // by myself ;-)
    if (!Array.prototype.remove) {
        Array.prototype.remove = function (element) {
            var index = this.indexOf(element);
            if (index >= 0) {
                return this.splice(index, 1);
            }
            return false;
        };
    }

    // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    if (!Array.prototype.isArray) {
        Array.prototype.isArray = function (vArg) {
            return Object.prototype.toString.call(vArg) === "[object Array]";
        };
    }

    // http://stackoverflow.com/questions/3762589/fastest-javascript-summation
    if (!Array.prototype.sum) {
        Array.prototype.sum = function () {
            for (var total = 0, l = this.length; l--; total += this[l])
                ;
            return total;
        };
    }

    // http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            var escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return target.replace(new RegExp(escapedSearch, 'g'), replacement);
        };
    }





    // add parser through the tablesorter addParser method
    $.tablesorter.addParser({
        // set a unique id
        id: 'awamoDateSorter',
        is: function (s, table, cell, $cell) {
            // return false so this parser is not auto detected
            return false;
        },
        format: function (s, table, cell, cellIndex) {
            if (s.trim().length === 0) {
                return -Number.MAX_VALUE;
            }

            return unformatDate(s).getTime();
        },
        // set type, either numeric or text
        type: 'numeric'
    });
    $.tablesorter.addParser({
        // set a unique id
        id: 'awamoPercentageSorter',
        is: function (s, table, cell, $cell) {
            // return false so this parser is not auto detected
            return false;
        },
        format: function (s, table, cell, cellIndex) {
            return unformatPercentage(s) / 1000;
        },
        // set type, either numeric or text
        type: 'numeric'
    });
    $.tablesorter.addParser({
        // set a unique id
        id: 'awamoCurrencySorter',
        is: function (s, table, cell, $cell) {
            // return false so this parser is not auto detected
            return false;
        },
        format: function (s, table, cell, cellIndex) {
            return unformatCurrency(s) / 100;
        },
        // set type, either numeric or text
        type: 'numeric'
    });
    $.tablesorter.addParser({
        // set a unique id
        id: 'awamoLoanHealthSorter',
        is: function (s, table, cell, $cell) {
            // return false so this parser is not auto detected
            return false;
        },
        format: function (s, table, cell, cellIndex) {
            return s.toUpperCase()
                    .replace(/PAR_0/, 6)
                    .replace(/PAR_3/, 5)
                    .replace(/PAR_30/, 4)
                    .replace(/PAR_60/, 3)
                    .replace(/PAR_90/, 2)
                    .replace(/DEFAULTED/, 1)
                    .replace(/WRITTEN_OFF/, 0);
        },
        // set type, either numeric or text
        type: 'numeric'
    });
}
;

function initLocalStorage() {
    if (typeof (Storage) !== "undefined") {
        var storedStorageVersion = localStorage.getItem('storageVersion');
        if (!exists(storedStorageVersion) || storedStorageVersion < storageVersion) {
            localStorage.clear(); // TODO: if you can manage a good update, do it!
            localStorage.setItem('storageVersion', storageVersion);
        }
    } else {
        // Sorry! No Web Storage support..
    }
}
;

function initLogin() {
    // init and start login
    $('#loginForm').submit(handlers['Communication'].loginFormSubmitHandler);
    $('.forgotPasswordLink a').on('click touch', function () {
        $('#actionValue').val('forgotPassword');
        $('#loginRow input').removeAttr('required');
        $('#forgotPasswordRow input').attr('required', 'required');
        $('#loginRow').hide();
        $('#forgotPasswordRow').show();
        $('.message').hide();
    });

    $('.backToLoginLink a').on('click touch', function () {
        $('#actionValue').val('login');
        $('#loginRow input').attr('required', 'required');
        $('#forgotPasswordRow input').removeAttr('required');
        $('#loginRow').show();
        $('#forgotPasswordRow').hide();
        $('.message').hide();
    });

    statusbar('waiting for user login');
    //window.location.hash = "#login";
}
;

$(document).ready(function () {
    initApp();
    initLocalStorage();
    initLogin();

    // start with login
    $('#login').show();
});

/* global handlers, parseFloat, loanList, clientList, savingsAccountList, google, currencyCode, tenantId */

var currentChangedFil = "ALL";
var transactionsFromDate = "0";
var transactionsToDate = "999999999999999";

var ReportingHandler = function () {
    ReportingHandler.self = this;
    loanList.addDataModelChangedEventListenerCallback(ReportingHandler.prototype.dataModelChanged);
    savingsAccountList.addDataModelChangedEventListenerCallback(ReportingHandler.prototype.dataModelChanged);
    $('#TransactionsAccountReportTypeForm select').on('input', ReportingHandler.prototype.genericTransactionReportSelectHandler);



    // see here: http://www.flotcharts.org/flot/examples/series-pie/index.html
    // and here: https://github.com/krzysu/flot.tooltip
    ReportingHandler.self.pieChartConfig = {
        series: {
            pie: {
                radius: 0.7,
                innerRadius: 0.3,
                show: true,
                stroke: {
                    color: "rgba(255,255,255,1.0)",
                    width: 0
                },
                highlight: {
                    opacity: 0.25
                },
                offset: {
                    top: 0,
                    left: 0
                },
                label: {
                    show: true,
                    radius: 3 / 4,
                    formatter: function (label, series) {
                        return '<div style="border:1px solid grey;font-size:8pt;text-align:center;padding:5px;color:white;">' +
                                label + ' : ' +
                                Math.round(series.percent) +
                                '%</div>';
                    },
                    background: {
                        opacity: 0.5,
                        color: '#000'
                    }
                },
                combine: {
                    color: '#999',
                    threshold: 0.05
                }
            }
        },
        legend: {
            show: false
        },
        grid: {
            hoverable: true,
            clickable: true
        },
        tooltip: {
            show: true,
            content: "%p.0%, %s, n=%n", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    };

    this.commandStack = [];
    this.argumentStack = [];
};

function drawChart(dataArray, div_id) {

    var arrayLength = dataArray.length;

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');

    dataArray = dataArray.sort(function (a, b) {
        return a.data - b.data;
    });

    for (var x = 0; x < arrayLength; x++) {
        console.log(dataArray[x]);
        data.addRow(['' + dataArray[x].label, dataArray[x].data]);

    }

    var options = {
        tooltip: {
            isHtml: true
        },
        pieHole: 0.4,
        legend: {position: 'bottom', alignment: 'start'},
        colors: ['#006600', '#66cc00', '#666666', '#999999', '#cccccc']

    };


    var chart = new google.visualization.PieChart(document.getElementById("panel-body-" + div_id));
    chart.draw(data, options);
}

google.charts.load('current', {'packages': ['corechart']});
ReportingHandler.prototype.drawGoogleChart = function (dataArray, data_div) {
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(drawChart(dataArray, data_div));

};




ReportingHandler.TRANSACTION_TITLES = {
    transactionDate: 'Date',
    accountType: 'Account type',
    amount: 'Amount',
    transactionType: 'Transaction type',
    balance: 'Balance'
};

ReportingHandler.KPI_TITLES = {
    kpi: 'Indicator',
    value: 'Value'
};

ReportingHandler.MAX_TRANSACTION_AGE = 2592000000; // 30d * 24h * 60m * 60s * 1000ms

/* external */
ReportingHandler.prototype.overview = function () {
    addHistory('Reporting overview', '#reportingOverview', '#reporting a');
    initDefaultContent('Reporting');
    currentTable = 'reporting';

    var $rowContainer = getDefaultRowContainer({type: 'Items available'});
    var latestTransactions = [];
    var savingsAccounts = savingsAccountList.getEntities();
    var savingsAccountsNumber = savingsAccounts.length;
    for (var i = 0; i < savingsAccountsNumber; i++) {
        var savingsAccount = savingsAccounts[i];
        var transactions = savingsAccount.transactionList;
        if (exists(transactions)) {
            var transactionsNumber = transactions.length;
            for (var j = 0; j < transactionsNumber; j++) {
                if (Date.now() - transactions[j].transactionDate < ReportingHandler.MAX_TRANSACTION_AGE) {
                    latestTransactions.push(transactions[j]);
                }
            }
        }
    }
    var loans = loanList.getEntities();
    var loansNumber = loans.length;
    for (var i = 0; i < loansNumber; i++) {
        var loan = loans[i];
        var transactions = loan.transactionList;
        if (exists(transactions)) {
            var transactionsNumber = transactions.length;
            for (var j = 0; j < transactionsNumber; j++) {
                if (Date.now() - transactions[j].transactionDate < ReportingHandler.MAX_TRANSACTION_AGE) {
                    latestTransactions.push(transactions[j]);
                }
            }
        }
    }

    addRow($rowContainer, {type: 'Portfolio analysis'/*, number: 4*/}, 'Reporting', ReportingHandler.self.rowClickHandler, 'getPortfolio');

    // [CO-#75]: remove this if block (but not the inner line of code) when "key performance indicators" have been done
    if ("SHOWROOM" === tenantId.toUpperCase()) {
        addRow($rowContainer, {type: 'Key performance indicators'/*, number: 2*/}, 'Reporting', ReportingHandler.self.rowClickHandler, 'keyPerformanceIndicators');
    }

    addRow($rowContainer, {type: 'Clients'/*, number: 1*/}, 'Client', ReportingHandler.self.rowClickHandler, 'getAll');
    addRow($rowContainer, {type: 'Loans'/*, number: 7*/}, 'Loan', ReportingHandler.self.rowClickHandler, 'firstGenericLoanReports');
    addRow($rowContainer, {type: 'Savings accounts'/*, number: 1*/}, 'SavingsAccount', ReportingHandler.self.rowClickHandler, 'getAll');
    addRow($rowContainer, {type: 'Transactions'/*, number: 1*/}, 'Reporting', ReportingHandler.self.rowClickHandler, 'getTransactions');
};

ReportingHandler.prototype.getTransactions = function () {
    hideContent();
    addHistory('Reporting transactions', '#reportingTransactions', getSidebarSubitemSelector('reporting', 'Reporting', 'getTransactions'));
    initDefaultContent('');
    currentTable = 'transactions';
    //$('#SavingAccountReportType').hide();
    //$('#SavingsAccountReportTypeForm').hide();
    $('#TransactionsAccountReportType').show();
    $('#TransactionsAccountReportTypeForm').show();
    document.getElementById("TransactionsAccountReportType").selectedIndex = "0";
    currentChangedFil = 'ALL';

    $.datepicker._clearDate($("#tToDatePicker"));
    $.datepicker._clearDate($("#tFromDatePicker"));
    transactionsFromDate = "0";
    transactionsToDate = "999999999999999";

    ReportingHandler.prototype.showTransactions();
};

ReportingHandler.prototype.showTransactions = function () {

    var $rowContainer = getDefaultRowContainer(ReportingHandler.TRANSACTION_TITLES);
    var $table = $rowContainer.parent();
    var latestTransactions = [];
    var savingsAccounts = savingsAccountList.getEntities();
    var savingsAccountsNumber = savingsAccounts.length;
    for (var i = 0; i < savingsAccountsNumber; i++) {
        var savingsAccount = savingsAccounts[i];
        var transactions = savingsAccount.transactionList;
        if (exists(transactions)) {
            var transactionsNumber = transactions.length;
            for (var j = 0; j < transactionsNumber; j++) {
                if (Date.now() - transactions[j].transactionDate < ReportingHandler.MAX_TRANSACTION_AGE) {
                    if (currentChangedFil === 'ALL') {
                        if (transactions[j]['transactionDate'] < transactionsToDate && transactions[j]['transactionDate'] > transactionsFromDate) {
                            latestTransactions.push(transactions[j]);
                        }
                    } else {
                        if (currentChangedFil === transactions[j]['transactionType'])
                            if (transactions[j]['transactionDate'] < transactionsToDate && transactions[j]['transactionDate'] > transactionsFromDate) {
                                latestTransactions.push(transactions[j]);
                            }
                    }
                }
            }
        }
    }

    var loans = loanList.getEntities();
    var loansNumber = loans.length;
    for (var i = 0; i < loansNumber; i++) {
        var loan = loans[i];
        var transactions = loan.transactionList;
        if (exists(transactions)) {
            var transactionsNumber = transactions.length;
            for (var j = 0; j < transactionsNumber; j++) {
                if (Date.now() - transactions[j].transactionDate < ReportingHandler.MAX_TRANSACTION_AGE) {
                    if (currentChangedFil === 'ALL') {
                        if (transactions[j]['transactionDate'] < transactionsToDate && transactions[j]['transactionDate'] > transactionsFromDate) {
                            latestTransactions.push(transactions[j]);
                        }
                    } else {
                        if (currentChangedFil === transactions[j]['transactionType'])
                            if (transactions[j]['transactionDate'] < transactionsToDate && transactions[j]['transactionDate'] > transactionsFromDate) {
                                latestTransactions.push(transactions[j]);
                            }
                    }
                }
            }
        }
    }

    var latestTransactionsNumber = latestTransactions.length;
    for (var i = 0; i < latestTransactionsNumber; i++) {
        var transaction = latestTransactions[i];
        var formattedRowData = ReportingHandler.prototype.getTransactionRowData(transaction);
        addRow($rowContainer, formattedRowData, transaction);
    }

    $('#tableTotal').text(latestTransactionsNumber);
    showContent($('#tableTotalSum'));

    var tableSorter = getDefaultTableSorter();
    tableSorter.headers = {
        0: {sorter: 'awamoDateSorter'},
        2: {sorter: 'awamoCurrencySorter'},
        4: {sorter: 'awamoCurrencySorter'}
    };
    $table.tablesorter(tableSorter);
    var els = document.getElementById("defaultTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }

    addClassToTableColumn($table, 0, 'currency');
    addClassToTableColumn($table, 2, 'currency');
    addClassToTableColumn($table, 4, 'currency');

    var tables = $('#defaultTableContainer').tableExport();
    tables.tableExport.update({
        formats: ["xls", "xlsx"],
        fileName: "Transactions",
        headings: true
    });

    $("#hiddenPrintedTitle").val("Transactions Report");

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();


};

ReportingHandler.prototype.getTransactionRowData = function (transaction) {
    var rowdata = {};

    for (var key in ReportingHandler.TRANSACTION_TITLES) {
        var formattedValue = transaction[key];

        switch (key) {
            case 'accountType':
                if (exists(transaction.accountId)) {
                    formattedValue = 'savings account';
                } else if (exists(transaction.loanId)) {
                    formattedValue = 'loan account';
                } else {
                    formattedValue = 'unknown';
                }
                break;
            case 'transactionDate':
                formattedValue = formatDate(formattedValue);
                break;
            case 'amount':
            case 'balance':
                formattedValue = exists(formattedValue) ? formatCurrency(formattedValue) + ' ' + currencyCode : '---';
                break;
            default:
                break;
        }

        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

ReportingHandler.prototype.rowClickHandler = function () {
    var action = $(this).data('id');
    var handler = $(this).data('object');
    $('li[data-parent~="reporting"][data-handler="' + handler + '"][data-action~="' + action + '"] a').click();
};

ReportingHandler.prototype.getPortfolio = function () {
    addHistory('Reporting portfolio', '#reportingPortfolio', getSidebarSubitemSelector('reporting', 'Reporting', 'getPortfolio'));
    initDefaultContent('Portfolio');
    var $portfolio = $('#portfolioArea');
    showContent($portfolio);

    ReportingHandler.self.createLoansByHealthChart();
    ReportingHandler.self.createLoansByAgeChart();
    ReportingHandler.self.createLoansBySexChart();
    ReportingHandler.self.createLoansBySectorChart();
};

ReportingHandler.prototype.createLoansByHealthChart = function () {
    var loanNumberByHealth = loanList.getEntities().reduce(function (accumulator, loan) {
        accumulator[loan.health] ? accumulator[loan.health]++ : accumulator[loan.health] = 1;
        return accumulator;
    }, {});

    var dataArray = [];
    $.each(loanNumberByHealth, function (label, data) {
        dataArray.push({label: label, data: data});
    });

    ReportingHandler.prototype.loansByHealthChart = ReportingHandler.prototype.drawGoogleChart(dataArray, "loansByHealth");
    // ReportingHandler.prototype.loansByHealthChart = $.plot($("#portfolio-loansByHealth .chart"), dataArray, ReportingHandler.self.pieChartConfig);
};

ReportingHandler.prototype.createLoansByAgeChart = function () {
    var labels = {
        sector0: '< 26',
        sector1: '26 - 35',
        sector2: '36 - 45',
        sector3: '46 - 55',
        sector4: '> 55'
    };
    var loanNumberByAge = {
        sector0: 0, // <26
        sector1: 0, // 26-35
        sector2: 0, // 36-45
        sector3: 0, // 46-55
        sector4: 0  // >55
    };
    var loans = loanList.getEntities();
    var len = loans.length;

    for (var i = 0; i < len; i++) {
        var loan = loans[i];

        if (loan.loanType === 'INDIVIDUAL') {
            if (loan.client !== null) { // should never happen
                if (loan.client.age < 26) {
                    loanNumberByAge.sector0 += 1;
                } else if (loan.client.age < 36) {
                    loanNumberByAge.sector1 += 1;
                } else if (loan.client.age < 46) {
                    loanNumberByAge.sector2 += 1;
                } else if (loan.client.age < 56) {
                    loanNumberByAge.sector3 += 1;
                } else {
                    loanNumberByAge.sector4 += 1;
                }
            }
        } else if (loan.loanType === 'GROUP') {
            // TODO
        }
    }

    var dataArray = [{label: 'none', data: 0}];
    $.each(loanNumberByAge, function (label, data) {
        dataArray.push({label: labels[label], data: data});
    });

    ReportingHandler.prototype.loansByHealthChart = ReportingHandler.prototype.drawGoogleChart(dataArray, "loansByAge");
    // ReportingHandler.self.loansByAgeChart = $.plot($("#portfolio-loansByAge .chart"), dataArray, ReportingHandler.self.pieChartConfig);
};

ReportingHandler.prototype.createLoansBySexChart = function () {
    var loanNumberBySex = {
        male: 0,
        female: 0
    };
    var loans = loanList.getEntities();
    var len = loans.length;

    for (var i = 0; i < len; i++) {
        var loan = loans[i];
        if (loan.loanType === 'INDIVIDUAL') {
            if (loan.client !== null) { // should never happen
                if (loan.client.gender === 'MALE') {
                    loanNumberBySex.male += 1;
                } else {
                    loanNumberBySex.female += 1;
                }
            }
        }
    }

    var dataArray = [{label: 'none', data: 0}];
    $.each(loanNumberBySex, function (label, data) {
        dataArray.push({label: label, data: data});
    });
    ReportingHandler.prototype.loansByHealthChart = ReportingHandler.prototype.drawGoogleChart(dataArray, "loansBySex");
    //ReportingHandler.self.loansByAgeChart = $.plot($("#portfolio-loansBySex .chart"), dataArray, ReportingHandler.self.pieChartConfig);
};

ReportingHandler.prototype.createLoansBySectorChart = function () {
    var loanNumberBySector = loanList.getEntities().reduce(function (accumulator, loan) {
        if (typeof (loan.loanClients) !== "undefined" &&
                loan.loanClients !== null &&
                loan.loanClients.length > 0) {
            var loanClient = loan.loanClients[0];

            if (typeof (loanClient.clientEmployments) !== "undefined" &&
                    loanClient.clientEmployments !== null &&
                    loanClient.clientEmployments.length > 0) {
                var clientEmployment = loanClient.clientEmployments[0];
                if (clientEmployment !== null) {
                    var sector = null;
                    if (clientEmployment.selfEmploymentType === 'FARMER') {
                        sector = 'FARMER';
                    } else {
                        sector = clientEmployment.businessSector;
                    }

                    accumulator[sector] ? accumulator[sector]++ : accumulator[sector] = 1;
                }
            }
        }

        return accumulator;
    }, {});

    var dataArray = [];
    $.each(loanNumberBySector, function (label, data) {
        dataArray.push({label: label, data: data});
    });
    ReportingHandler.prototype.loansByHealthChart = ReportingHandler.prototype.drawGoogleChart(dataArray, "loansBySector");
    //ReportingHandler.prototype.loansBySectorChart = $.plot($("#portfolio-loansBySector .chart"), dataArray, ReportingHandler.self.pieChartConfig);
};

ReportingHandler.prototype.dataModelChanged = function (object) {
    var $chart = $("#portfolio-loansByHealth .chart");
    if ($chart.height() > 0 && $chart.width() > 0) {
        ReportingHandler.self.createLoansByHealthChart();
        ReportingHandler.self.createLoansByAgeChart();
        ReportingHandler.self.createLoansBySexChart();
        ReportingHandler.self.createLoansBySectorChart();
    }
};

ReportingHandler.prototype.labelFormatter = function (label, series) {
    return '<div style="font-size:12px; text-align:center; padding:4px; color: #333333; background-color: ' + series.color + '; border: solid 1px #000000">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
};

ReportingHandler.prototype.getClientMap = function () {
    addHistory('Geo Information', '#geoInformation', '#getClientMap a');
    initDefaultContent('Geo information');
    showContent($('#geoInformationArea'));
    currentTable = null;
    var allClients = clientList.getEntities();

    var myOptions = {
        center: new google.maps.LatLng(8.7832, 34.5085),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: true,
        mapTypeControl: false,
        panControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        scaleControl: false,
        streetViewControl: false,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }

    };

    var map = new google.maps.Map(document.getElementById("geoInformationMap"), myOptions);

    var bounds = new google.maps.LatLngBounds();
    var count = 0;

    allClients.forEach(function (client) {
        if (exists(client.location)) {
            if (client.location.latitude !== 0 && client.location.longitude !== 0) {
                var cLatLng = {lat: client.location.latitude, lng: client.location.longitude};

                bounds.extend(new google.maps.LatLng(client.location.latitude, client.location.longitude));
                count = count + 1;
                new google.maps.Marker({
                    position: cLatLng,
                    map: map

                });
            }
        }
    });

    if (count > 0) {
        map.fitBounds(bounds);
    }
};

ReportingHandler.prototype.keyPerformanceIndicators = function () {
    addHistory('Key Performance Indicators', '#keyPerformanceIndicators', getSidebarSubitemSelector('reporting', 'Reporting', 'keyPerformanceIndicators'));
    initDefaultContent('Key Performance Indicators');
    ReportingHandler.self.stack(ReportingHandler.prototype.keyPerformanceIndicators);

    var $rowContainer = getDefaultRowContainer(ReportingHandler.KPI_TITLES);
    var $table = $rowContainer.parent();
    var data = [
        {kpi: 'Return on assets', value: 10},
        {kpi: 'Return on equity', value: 12}
    ];

    data.forEach(function (row) {
        addRow($rowContainer, ReportingHandler.prototype.getKPIRowData(row));
    });

    $table.tablesorter(getDefaultTableSorter());

    addClassToDefaultTableColumn(3, 'currency');
};

ReportingHandler.prototype.getKPIRowData = function (account) {
    var rowdata = {};

    for (var key in ReportingHandler.KPI_TITLES) {
        var formattedValue = account[key];

        switch (key) {
            case 'code':
                if (account.glCode % 1000 === 0) {
                    formattedValue = '<b>' + account.glCode + '</b';
                } else if (account.glCode % 100 === 0) {
                    formattedValue = '&emsp;&emsp;' + account.glCode;
                } else {
                    formattedValue = '&emsp;&emsp;&emsp;&emsp;' + account.glCode;
                }
                break;
            case 'name':
                if (account.glCode % 1000 === 0) {
                    formattedValue = '<b>' + account.name + '</b';
                } else if (account.glCode % 100 === 0) {
                    formattedValue = '&emsp;&emsp;' + account.name;
                } else {
                    formattedValue = '&emsp;&emsp;&emsp;&emsp;' + account.name;
                }
                break;
            case 'balance':
                formattedValue = formatCurrency(this._sumOfJournal(account)) + ' ' + currencyCode;
                break;
            default:
                break;
        }

        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

ReportingHandler.prototype.stack = function (command, arguments) {
    ReportingHandler.self.commandStack.push(command);
    ReportingHandler.self.argumentStack.push(arguments); // TODO: don't know if this works if it is undefined ...
};

ReportingHandler.prototype.back = function () {
    ReportingHandler.self.commandStack.pop()(ReportingHandler.self.argumentStack.pop());
};

//AccountingHandler.prototype.singleObjectActionHandler = function (event) {
//    event.preventDefault();
//    hideContent();
//
//    switch ($(this).data('action')) {
//        case 'back':
//            AccountingHandler.self.back();
//            break;
//        default:
//            // noop
//            break;
//    }
//};
ReportingHandler.prototype.genericTransactionReportSelectHandler = function () {
    switch ($(this).val()) {
        case 'ALL':
            currentChangedFil = 'ALL';
            break;
        case 'DEPOSIT':
            currentChangedFil = 'DEPOSIT';
            break;
        case 'WITHDRAWAL':
            currentChangedFil = 'WITHDRAWAL';
            break;
        case 'DISBURSEMENT':
            currentChangedFil = 'DISBURSEMENT';
            break;
        case 'REPAYMENT':
            currentChangedFil = 'REPAYMENT';
            break;
        default:
            break;
    }
    ReportingHandler.prototype.showTransactions();
};

'use strict';

/* global savingsAccountList, tableSorter, currencyCode */

var currentChangedFil = "ALL";

// <editor-fold defaultstate="collapsed" desc=" init ">
var SavingsAccountHandler = function () {
    SavingsAccountHandler.self = this;
    savingsAccountList.addDataModelChangedEventListenerCallback(SavingsAccountHandler.prototype.dataModelChanged);
    savingsAccountList.addEntityChangedEventListenerCallback(SavingsAccountHandler.prototype.entityChanged);
    $('#SavingsAccountReportTypeForm select').on('input', SavingsAccountHandler.prototype.genericSavingAccountReportSelectHandler);
    SavingsAccountHandler.self.goBackHandler = null;
};

SavingsAccountHandler.ROOT_PATH = '/savingsaccount/v1d/';

SavingsAccountHandler.APPLICATION_TITLES = {
    clientName: 'Name',
    accountNo: 'Account',
    status: 'Status',
    interestRate: 'Interest rate p.a.',
    balance: 'Balance'
};
SavingsAccountHandler.ALL_ACCOUNTS_TITLES = {
    clientName: 'Name',
    accountNo: 'Account',
    status: 'Status',
    interestRate: 'Interest rate p.a.',
    balance: 'Balance'
};
SavingsAccountHandler.TRANSACTION_TITLES = {
    transactionDate: 'Date',
    amount: 'Amount',
    transactionType: 'Type',
    balance: 'Balance'
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" public methods ">
SavingsAccountHandler.prototype.getApplications = function () {
    addHistory('Savings Account Applications', '#savingsAccountApplications', getSidebarSubitemSelector('actionRequired', 'SavingsAccount', 'getApplications'));
    currentTable = 'savingsAccountApplications';
    SavingsAccountHandler.self.previousPage = SavingsAccountHandler.self.getApplications;
    SavingsAccountHandler.self.displaySavingsAccountApplications();
};

SavingsAccountHandler.prototype.getAll = function () {
    addHistory('All Savings Accounts', '#savingsAccounts', getSidebarSubitemSelector('reporting', 'SavingsAccount', 'getAll'));
    currentTable = 'allSavingsAccounts';
    SavingsAccountHandler.self.previousPage = SavingsAccountHandler.self.getAll;
    SavingsAccountHandler.self.displayAllSavingsAccounts();
};

SavingsAccountHandler.prototype.outputAccount = function (object) {
    var $row = null;

    // update GUI
    if ('savingsAccountApplications' === currentTable) {
        if (object.status === 'SUBMITTED') {
            $row = SavingsAccountHandler.self.addToTable(object);
        } else {
            // noop
        }
    } else if ('allSavingsAccounts' === currentTable) {
        $row = SavingsAccountHandler.self.addToTable(object);
    } else {
        // noop
    }

    return $row;
};

SavingsAccountHandler.prototype.entityChanged = function (object) {

    if (currentChangedFil === 'ALL')
    {
        SavingsAccountHandler.self.outputAccount(object);
    } else {
        if (object.status.valueOf() === currentChangedFil)
            SavingsAccountHandler.self.outputAccount(object);
    }
};

SavingsAccountHandler.prototype.dataModelChanged = function () {
    // noop
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" private methods ">
SavingsAccountHandler.prototype.addToTable = function (data) {
    var $row = null;
    if (
            'savingsAccountApplications' === currentTable ||
            'allSavingsAccounts' === currentTable) {

        var titles = SavingsAccountHandler.ALL_ACCOUNTS_TITLES;
        if ('savingsAccountApplications' === currentTable) {
            titles = SavingsAccountHandler.APPLICATION_TITLES;
        }

        var $tableContainer = $('#defaultTableContainer');

        if ($tableContainer.is(":visible")) {
            var $table = $tableContainer.find('table');
            var $rowContainer = $table.find('tbody');
            var $row = $rowContainer.find('[data-id="' + data.accountId + '"]');
            var oldData = $row.data('object');
            var formattedRowData = SavingsAccountHandler.prototype.getRowData(titles, data);

            if (!exists(oldData)) {
                addRow(
                        $rowContainer,
                        formattedRowData,
                        data,
                        SavingsAccountHandler.self.rowClickHandler,
                        data.accountId
                        );
            } else {
                var $cells = $row.find('td');
                var len = $cells.length;

                for (var i = 0; i < len; i++) {
                    var $cell = $($cells[i]);
                    var newValue = formattedRowData[Object.keys(SavingsAccountHandler.ALL_ACCOUNTS_TITLES)[i]];
                    if ($cell.html() !== newValue) {
                        $cell.html(newValue);
                        highlightUpdatedCell($cell);
                    }
                }
            }
        }
    }
};

SavingsAccountHandler.prototype.displaySavingsAccountApplications = function () {
    SavingsAccountHandler.prototype.currentSavingsAccount = null;
    initDefaultContent('Savings account applications');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', SavingsAccountHandler.self.synchronizeNow);
    $('#syncNow').show();
    
    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();

    SavingsAccountHandler.self.removeTableFilterClasses();
    SavingsAccountHandler.self.displayInTable(SavingsAccountHandler.APPLICATION_TITLES, savingsAccountList.getListByStatus('SUBMITTED'));
    $('#defaultTableContainer').addClass('allSavingsAccountsTable');
};

SavingsAccountHandler.prototype.displayAllSavingsAccounts = function () {
    SavingsAccountHandler.prototype.currentSavingsAccount = null;
    initDefaultContent('');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', SavingsAccountHandler.self.synchronizeNow);
    $('#syncNow').show();
    
    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();
    
    $('#SavingAccountReportType').show();
    $('#SavingsAccountReportTypeForm').show();
    document.getElementById("SavingAccountReportType").selectedIndex = "0";

    SavingsAccountHandler.self.removeTableFilterClasses();

    SavingsAccountHandler.self.displayInTable(SavingsAccountHandler.ALL_ACCOUNTS_TITLES, savingsAccountList.getEntities());

    $('#defaultTableContainer').addClass('allSavingsAccountsTable');

};

SavingsAccountHandler.prototype.removeTableFilterClasses = function () {
    $('#defaultTableContainer').removeClass('allSavingsAccountsTable');
};

SavingsAccountHandler.prototype.displayInTable = function (titles, dataList) {
    var $tableContainer = $('#defaultTableContainer');
    $tableContainer.empty();

    var $table = getEmptyTable(true);
    $tableContainer.append($table);

    var $rowContainer = $table.find('thead');
    addRow($rowContainer, titles);

    $rowContainer = $table.find('tbody');
    for (var i = 0; i < dataList.length; i++) {
        addRow(
                $rowContainer,
                SavingsAccountHandler.prototype.getRowData(titles, dataList[i]),
                dataList[i],
                SavingsAccountHandler.self.rowClickHandler,
                dataList[i].accountId
                );
//        var $row = addRow($rowContainer, SavingsAccountHandler.prototype._getRowData(titles, dataList[i]), dataList[i], SavingsAccountHandler.self.rowClickHandler, dataList[i].accountId);
//        
//        // images are lazy-loaded
//        (function (awamoId, $row) {
//            var $img = $row.find('img').first();
//            clientList.get(awamoId, function (client) {
//                if (client !== null) {
//                    $img.attr('src', client.thumbnail);
//                }
//            });
//        })(dataList[i].awamoId, $row);
    }

    var tableSorter = getDefaultTableSorter();
    // TODO: this depends on the titles ...
    tableSorter.headers = {
        3: {sorter: 'awamoPercentageSorter'},
        4: {sorter: 'awamoCurrencySorter'}
    };
    $table.tablesorter(tableSorter);
    var els = document.getElementById("defaultTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }

    addClassToTableColumn($table, 3, 'percentage');
    addClassToTableColumn($table, 4, 'currency');

    $('#tableTotal').text(dataList.length);
    showContent($('#tableTotalSum'));
    showContent($('#emailLoanReportDiv'));
    showContent($tableContainer);
    $tableContainer.show();

    $('#sendsavingaccountEmailReportBotton').off('click touch');
    $('#sendsavingaccountEmailReportBotton').on('click touch', SavingsAccountHandler.self.sendEmailLoanReportRequest);
    $('#sendsavingaccountEmailReportBotton').show();
    var tables = $('#defaultTableContainer').tableExport();
    
    tables.tableExport.update({
        formats : ["xls", "xlsx"],
        fileName: "SavingsAccounts",
        headings: true
    });
    
    $( "#hiddenPrintedTitle" ).val("Savingaccounts Report");

};

SavingsAccountHandler.prototype.rowClickHandler = function (event, previousPage) {
    if (exists(previousPage)) {
        SavingsAccountHandler.self.previousPage = previousPage;
    }

    $('#singleActions a').off('click touch');
    $('#singleActions a').on('click touch', SavingsAccountHandler.prototype.singleObjectActionHandler);

    $('#approveNo').off('click touch');
    $('#approveNo').on('click touch', SavingsAccountHandler.prototype.backToDisplayOneSavingsAccount);
    $('#rejectNo').off('click touch');
    $('#rejectNo').on('click touch', SavingsAccountHandler.prototype.backToDisplayOneSavingsAccount);
    $('#closeNo').off('click touch');
    $('#closeNo').on('click touch', SavingsAccountHandler.prototype.backToDisplayOneSavingsAccount);
    $('#approveYes').off('click touch');
    $('#approveYes').on('click touch', SavingsAccountHandler.prototype.approveApplication);
    $('#rejectYes').off('click touch');
    $('#rejectYes').on('click touch', SavingsAccountHandler.prototype.rejectApplication);
    $('#closeYes').off('click touch');
    $('#closeYes').on('click touch', SavingsAccountHandler.prototype.closeApplication);

    SavingsAccountHandler.self.displayOneSavingsAccount($(event.currentTarget).data('object'));
};

SavingsAccountHandler.prototype.getRowData = function (titles, savingsAccount) {
    var rowdata = {};

    for (var key in titles) {
        var formattedValue = savingsAccount[key];

        switch (key) {
            case 'clientImage':
                formattedValue = '<img src="images/personPlaceholderNoText.png" alt="client" height="32" />';

                if ('GROUP' === savingsAccount.savingsAccountType) {
                    formattedValue = '<img src="images/groupPlaceholder.png" alt="client" height="32" />';
                } else if ('INDIVIDUAL' === savingsAccount.savingsAccountType) {
                    formattedValue = '<img src="images/personPlaceholderNoText.png" alt="client" height="32" />';
                }
                break;
            case 'interestRate':
                formattedValue = formatPercentage(formattedValue) + ' %';
                break;
            case 'balance':
                formattedValue = formatCurrency(formattedValue) + ' ' + currencyCode;
                break;
            default:
                break;
        }

        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

SavingsAccountHandler.prototype.displayOneSavingsAccount = function (savingsAccount) {
    // check parameter
    if (!exists(savingsAccount)) {
        return;
    }

    // store current savings account
    SavingsAccountHandler.self.savingsAccount = savingsAccount;

    initDefaultContent('Savings account');

    var formattedData = SavingsAccountHandler.self.getRowData(SavingsAccountHandler.ALL_ACCOUNTS_TITLES, savingsAccount);

    $('#savingsAccountNumber').val(formattedData.accountNo);
    $('#savingsAccountName').val(formattedData.clientName);
    $('#savingsAccountStatus').val(formattedData.status);
    $('#savingsAccountInterest').val(formattedData.interestRate);

    $('#savingsAccount .balance .value').text(formattedData.balance);

    // actions
    SavingsAccountHandler.self.adjustSingleActionsByStatus(savingsAccount.status);
    SavingsAccountHandler.self.displayTransactionsData(savingsAccount.transactionList);

    // show necessary content
    showContent($('#singleActions'));
    showContent($('#savingsAccount'));
};

SavingsAccountHandler.prototype.displayTransactionsData = function (transactionList) {
    var $tableContainer = $('#savingsAccountTransactionsTableContainer');
    $tableContainer.empty();

    var $table = getEmptyTable(true);
    $tableContainer.append($table);

    var $rowContainer = $table.find('thead');
    addRow($rowContainer, SavingsAccountHandler.TRANSACTION_TITLES);

    $rowContainer = $table.find('tbody');

    if (!exists(transactionList)) {
        return;
    }

    var len = transactionList.length;
    for (var i = 0; i < len; i++) {
        var transaction = transactionList[i];
        var formattedRowData = SavingsAccountHandler.prototype.getTransactionRowData(transaction);
        addRow($rowContainer, formattedRowData, transaction);
    }

    // transactions sorter
    var tableSorter = getDefaultTableSorter();
    // TODO: this depends on the titles ...
    tableSorter.headers = {
        0: {sorter: 'awamoDateSorter'},
        1: {sorter: 'awamoCurrencySorter'},
        3: {sorter: 'awamoCurrencySorter'}
    };
    $table.tablesorter(tableSorter);

    addClassToTableColumn($table, 1, 'currency');
    addClassToTableColumn($table, 3, 'currency');

    showContent($table);
};

SavingsAccountHandler.prototype.getTransactionRowData = function (savingsAccount) {
    var rowdata = {};

    for (var key in SavingsAccountHandler.TRANSACTION_TITLES) {
        var formattedValue = savingsAccount[key];

        switch (key) {
            case 'transactionDate':
                formattedValue = formatDate(formattedValue);
                break;
            case 'amount':
            case 'balance':
                formattedValue = formatCurrency(formattedValue) + ' ' + currencyCode;
                break;
            default:
                break;
        }

        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

SavingsAccountHandler.prototype.singleObjectActionHandler = function (event) {
    event.preventDefault();
    hideContent();

    switch ($(this).data('action')) {
        case 'back':
            SavingsAccountHandler.self.previousPage();
            break;
        case 'approve':
            $('#approveApplication .panel-body .approvalObject').text('savings account');
            showContent($('#approveApplication'));
            break;
        case 'reject':
            $('#rejectApplication .panel-body .rejectionObject').text('savings account');
            $('#rejectionNote').val('');
            showContent($('#rejectApplication'));
            break;
        case 'close':
            $('#closeApplication .panel-body .closeObject').text('savings account');
            showContent($('#closeApplication'));
            break;
        default:
            // noop
            break;
    }
};

SavingsAccountHandler.prototype.adjustSingleActionsByStatus = function (status) {
    $('#singleActions a[data-action]').hide();
    $('#singleActions a[data-action="back"]').show();

    switch (status) {
        case 'SUBMITTED':
            $('#singleActions a[data-action="approve"]').show();
            $('#singleActions a[data-action="reject"]').show();
            break;
        case 'REJECTED':
            break;
        case 'ACTIVE':
            $('#singleActions a[data-action="close"]').show();
            break;
        case 'CLOSED':
            break;
        default:
            break;
    }
};

SavingsAccountHandler.prototype.backToDisplayOneSavingsAccount = function () {
    SavingsAccountHandler.self.displayOneSavingsAccount(SavingsAccountHandler.self.savingsAccount);
};

SavingsAccountHandler.prototype.approveApplication = function () {
    SavingsAccountHandler.self.savingsAccount.status = 'ACTIVE';
    ajax(
            SavingsAccountHandler.ROOT_PATH + SavingsAccountHandler.self.savingsAccount.accountId + '/approve',
            'POST',
            SavingsAccountHandler.prototype.approveApplicationSuccessful);
};

SavingsAccountHandler.prototype.approveApplicationSuccessful = function () {
    SavingsAccountHandler.self.savingsAccount.status = 'ACTIVE';
    savingsAccountList.put(savingsAccountList, SavingsAccountHandler.self.savingsAccount);
    SavingsAccountHandler.self.previousPage();
};

SavingsAccountHandler.prototype.rejectApplication = function () {
    SavingsAccountHandler.self.savingsAccount.status = 'REJECTED';
    ajax(
            SavingsAccountHandler.ROOT_PATH + SavingsAccountHandler.self.savingsAccount.accountId + '/reject',
            'POST',
            SavingsAccountHandler.prototype.rejectApplicationSuccessful,
            '{"note":"' + $('#rejectionNote').val() + '"}');
};

SavingsAccountHandler.prototype.rejectApplicationSuccessful = function () {
    SavingsAccountHandler.self.savingsAccount.status = 'REJECTED';
    savingsAccountList.put(savingsAccountList, SavingsAccountHandler.self.savingsAccount);
    SavingsAccountHandler.self.previousPage();
};

SavingsAccountHandler.prototype.closeApplication = function () {
    SavingsAccountHandler.self.savingsAccount.status = 'CLOSED';
    ajax(
            SavingsAccountHandler.ROOT_PATH + SavingsAccountHandler.self.savingsAccount.accountId + '/close',
            'POST',
            SavingsAccountHandler.prototype.closeApplicationSuccessful,
            '{"note":"' + $('#closeNote').val() + '"}');
};

SavingsAccountHandler.prototype.closeApplicationSuccessful = function () {
    SavingsAccountHandler.self.savingsAccount.status = 'CLOSED';
    savingsAccountList.put(savingsAccountList, SavingsAccountHandler.self.savingsAccount);
    SavingsAccountHandler.self.previousPage();
};

SavingsAccountHandler.prototype.loadSavingsAccounts = function () {
    savingsAccountList.reload();
};

SavingsAccountHandler.prototype.synchronizeNow = function () {
    savingsAccountList.reload();
};
// </editor-fold>

SavingsAccountHandler.prototype.sendEmailLoanReportRequest = function () {
    // not using default ajax call here because user handling is done against a different endpoint
    var headers = {
        tenantId: tenantId
    };

    var uri = '/tenant/v1d/mis/reportEmail';
    var body = '{"startTime":"' + '0' +
            '","endTime":"' + '0' +
            '","reportEmailEntity":"' + "SAVINGS_ACCOUNTS" +
            '","reportEmailType":"' + "ALL" +
            '","email":"' + $('#emailReportC').val() +
            '"}';
    ajax(uri, 'POST', SavingsAccountHandler.prototype.emailReportResponseHandler, body, headers, SavingsAccountHandler.prototype.emailReportFailedResponseHandler);

};

SavingsAccountHandler.prototype.emailReportResponseHandler = function (response) {
    message('Success',
            'Message Sent Successfully',
            MessageType.SUCCESS);
};

SavingsAccountHandler.prototype.emailReportFailedResponseHandler = function (response) {
    message('Error', response.responseJSON.message, MessageType.WARNING);
};

SavingsAccountHandler.prototype.genericSavingAccountReportSelectHandler = function () {
    switch ($(this).val()) {
        case 'ALL':
            currentChangedFil = 'ALL';
            SavingsAccountHandler.self.displayInTable(SavingsAccountHandler.ALL_ACCOUNTS_TITLES, savingsAccountList.getEntities());
            break;
        case 'ACTIVE':
            currentChangedFil = 'ACTIVE';
            SavingsAccountHandler.self.displayInTable(SavingsAccountHandler.ALL_ACCOUNTS_TITLES, savingsAccountList.getListByStatus('ACTIVE'));
            break;
        case 'CLOSED':
            currentChangedFil = 'CLOSED';
            SavingsAccountHandler.self.displayInTable(SavingsAccountHandler.ALL_ACCOUNTS_TITLES, savingsAccountList.getListByStatus('CLOSED'));
            break;
        case 'SUBMITTED':
            currentChangedFil = 'SUBMITTED';
            SavingsAccountHandler.self.displayInTable(SavingsAccountHandler.ALL_ACCOUNTS_TITLES, savingsAccountList.getListByStatus('SUBMITTED'));
            break;
        default:
            break;
    }
};
'use strict';

/* global clientList, savingsAccountList, handlers, currencyCode, Options */

var ClientHandler = function () {
    ClientHandler.self = this;
    clientList.addEntityChangedEventListenerCallback(ClientHandler.prototype.entityChanged);

    $('#singleClientActions a').on('click touch', ClientHandler.self._singleClientActionHandler);
};

ClientHandler.ALL_CLIENTS_TITLES = {
    // client image
    //awamoId: 'awamo ID',
    fullname: 'Name',
    gender: 'Sex',
    birthdate: 'Birth date',
    submitDate: 'Registration',
    phone1: 'Phone',
    account: 'Balance',
    loan: 'Loan'
};

ClientHandler.ACCOUNTS_TITLES = {
    accountNo: 'Account',
    type: 'Type',
    status: 'Status',
    interestRate: 'Interest rate p.a.',
    balance: 'Balance'
};

// <editor-fold defaultstate="collapsed" desc=" public methods ">
ClientHandler.prototype.getAll = function () {
    addHistory('All clients', '#clients', getSidebarSubitemSelector('reporting', 'Client', 'getAll'));
    currentTable = 'allClients';
    ClientHandler.self.previousPage = ClientHandler.self.getAll;
    ClientHandler.self.displayClients();
};

ClientHandler.prototype.loadClients = function () {
    clientList.reload();
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" private methods ">
ClientHandler.prototype.displayClients = function () {
    ClientHandler.self.currentClient = null;

    initDefaultContent('All clients');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', ClientHandler.self.synchronizeNow);
    $('#syncNow').show();

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();


    $('#sendclientEmailReportBotton').off('click touch');
    $('#sendclientEmailReportBotton').on('click touch', ClientHandler.self.sendEmailLoanReportRequest);
    $('#sendclientEmailReportBotton').show();

    var dataList = clientList.getEntities();
    var $rowContainer = getDefaultRowContainer(ClientHandler.ALL_CLIENTS_TITLES);
    var $table = $rowContainer.parent();

    for (var i = 0; i < dataList.length; i++) {
        var rowdata = {};

        for (var key in ClientHandler.ALL_CLIENTS_TITLES) {
            var formattedValue = dataList[i][key];
            if ('birthdate' === key || 'submitDate' === key) {
                formattedValue = formatDate(formattedValue);
            }
            if ('account' === key) {
                var savingsAccounts = savingsAccountList.getByClient(dataList[i]['awamoId']);
                var len = savingsAccounts.length;

                if (len > 0) {
                    var sum = 0;
                    for (var j = 0; j < len; j++) {
                        var savingsAccount = savingsAccounts[j];
                        sum = sum + savingsAccount['balance'];

                    }
                    formattedValue = currencyCode + " " + formatCurrency(sum);
                } else {
                    formattedValue = currencyCode + " " + 0;
                }
            }
            if ('loan' === key) {
                var loans = loanList.getByClient(dataList[i]['awamoId']);
                var len = loans.length;

                if (len > 0) {
                    var sum = 0;
                    for (var j = 0; j < len; j++) {
                        var loan = loans[j];
                        if (loan.status === "ACTIVE") {
                            sum = sum + loan['principal'];
                        }
                    }
                    formattedValue = currencyCode + " " + formatCurrency(sum);
                } else {
                    formattedValue = currencyCode + " " + 0;
                }
            }
            if (formattedValue === ' ') {
                formattedValue = 'n.a.';
            }
            rowdata[key] = formattedValue;
        }

        addRow($rowContainer, rowdata, dataList[i], ClientHandler.self.rowClickHandler, dataList[i].accountId);
    }

    var tableSorter = getDefaultTableSorter();
    tableSorter.headers = {
        3: {sorter: 'awamoDateSorter'},
        4: {sorter: 'awamoDateSorter'}
    };
    $table.tablesorter(tableSorter);

    var els = document.getElementById("defaultTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }

    $('#tableTotal').text(dataList.length);
    showContent($('#tableTotalSum'));
    showContent($('#emailLoanReportDiv'));

    var tables = $('#defaultTableContainer').tableExport();
    tables.tableExport.update({
        formats: ["xls", "xlsx"],
        fileName: "Clients",
        headings: true
    });

    $("#hiddenPrintedTitle").val("Clients Report");
};

ClientHandler.prototype.rowClickHandler = function () {
    ClientHandler.self.displayOneClient($(this).data('object'));
};

ClientHandler.prototype.displayOneClient = function (client) {
    // check parameter
    if (!exists(client)) {
        return;
    }

    // store current client
    ClientHandler.self.client = client;

    initDefaultContent('Client');
    ClientHandler.self.displayClientData(client);
    ClientHandler.self.displayAccountsData(client);

    // show necessary content
    showContent($('#accountsTableContainer'));
    showContent($('#client'));
};

ClientHandler.prototype.displayClientData = function (client) {
    // client
    document.getElementById("clientImageID").src = "images/personPlaceholderNoText.png";
    $('#client .panel-heading').text(client.fullname);
    $('#clientAwamoId').val(client.awamoId);
    $('#clientFirstName').val(client.firstname);
    $('#clientMiddleName').val(client.middlename);
    $('#clientLastName').val(client.lastname);
    $('#clientBirthdate').val(formatDate(client.birthdate) + ' (' + client.age + ' years)');
    $('#clientNationality').val(client.nationality);
    $('#clientSubmitdate').val(formatDate(client.submitDate));

    $.ajax({
        url: host + '/client/v1d/find?' +
                'awamoId=' + client.awamoId + '&' +
                'deviceId=cockpit&' +
                'datatype=PHOTOGRAPHY',
        type: 'GET',
        headers: getAuthenticationHeader(),
        xhrFields: {
            responseType: 'arraybuffer'
        }
    })
            .done(function (e) {
                var blob = new Blob([e], {type: 'image/jpg'});
                var fr = new FileReader();
                fr.onload = function (e) {
                    document.getElementById("clientImageID").src = e.target.result;
                };
                fr.readAsDataURL(blob);
            })
            .fail(function (e) {
                document.getElementById("clientImageID").src = "images/personPlaceholderNoText.png";
                console.log('fail');
                console.log(e);
            });

    $('#clientIdDocumentType').val(client.iddocumenttype);
    $('#clientIdDocument').val(client.iddocument);
    $('#clientPhone1').val(client.phone1);
    $('#clientPhone2').val(client.phone2);
    $('#clientGender').val(client.gender);
    $('#clientLocation').val(client.site);
};

ClientHandler.prototype.displayAccountsData = function (client) {
    var $rowContainer = getRowContainer('#accountsTableContainer', ClientHandler.ACCOUNTS_TITLES);
    var $table = $rowContainer.parent();
    var savingsAccounts = savingsAccountList.getByClient(client.awamoId);
    var len = savingsAccounts.length;

    for (var i = 0; i < len; i++) {
        var savingsAccount = savingsAccounts[i];
        var formattedRowData = ClientHandler.prototype._getAccountsRowData(savingsAccount);
        addRow($rowContainer, formattedRowData, savingsAccount, ClientHandler.self._accountsRowClickHandler, savingsAccount.accountId);
    }

    var tableSorter = getDefaultTableSorter();
    tableSorter.headers = {
        3: {sorter: 'awamoPercentageSorter'},
        4: {sorter: 'awamoCurrencySorter'}
    };
    $table.tablesorter(tableSorter);

    addClassToTableColumn($table, 3, 'percentage');
    addClassToTableColumn($table, 4, 'currency');
};

ClientHandler.prototype._getAccountsRowData = function (savingsAccount) {
    var rowdata = {};

    for (var key in ClientHandler.ACCOUNTS_TITLES) {
        var formattedValue = savingsAccount[key];

        switch (key) {
            case 'type':
                formattedValue = 'savings account';
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

ClientHandler.prototype._accountsRowClickHandler = function () {
    var savingsAccount = $(this).data('object');
    var savingsAccountHandler = handlers['SavingsAccount'];
    var event = {currentTarget: {}};
    $(event.currentTarget).data('object', savingsAccount);
    savingsAccountHandler.rowClickHandler(event, function () {
        ClientHandler.self.displayOneClient(ClientHandler.self.client);
    });
};

ClientHandler.prototype._singleClientActionHandler = function (event) {
    event.preventDefault();
    hideContent();

    switch ($(this).data('action')) {
        case 'back':
            ClientHandler.self.previousPage();
            break;
        default:
            // noop
            break;
    }
};

ClientHandler.prototype.outputClient = function (client) {
    var $row = null;
    // update badges
    var clientNumber = clientList.getTotalCount();

    // update GUI
    if ('allClients' === currentTable) {
        //$row = ClientHandler.self.addToTable(client);
    } else {
        // noop
    }

    return $row;
};

ClientHandler.prototype.entityChanged = function (client) {
    ClientHandler.self.outputClient(client);
};

ClientHandler.prototype.synchronizeNow = function () {
    clientList.reload();
};

ClientHandler.prototype.sendEmailLoanReportRequest = function () {
    // not using default ajax call here because user handling is done against a different endpoint
    var headers = {
        tenantId: tenantId
    };

    var uri = '/tenant/v1d/mis/reportEmail';
    var body = '{"startTime":"' + '0' +
            '","endTime":"' + '0' +
            '","reportEmailEntity":"' + "CLIENT" +
            '","reportEmailType":"' + "ALL" +
            '","email":"' + $('#emailReportC').val() +
            '"}';
    ajax(uri, 'POST', ClientHandler.prototype.emailReportResponseHandler, body, headers, ClientHandler.prototype.emailReportFailedResponseHandler);

};

ClientHandler.prototype.emailReportResponseHandler = function (response) {
    message('Success',
            'Message Sent Successfully',
            MessageType.SUCCESS);
};

ClientHandler.prototype.emailReportFailedResponseHandler = function (response) {
    message('Error', response.responseJSON.message, MessageType.WARNING);
};

//client loan application list
ClientHandler.prototype.getAllClientsForLoanApplication = function () {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    addHistory('All clients', '#clients', getSidebarSubitemSelector('reporting', 'Client', 'getAll'));
    currentTable = 'allClientsLoanApplication';
    ClientHandler.self.previousPage = ClientHandler.self.getAll;
    ClientHandler.self.displayClientsForLoanApplication();
};

ClientHandler.prototype.displayClientsForLoanApplication = function () {
    ClientHandler.self.currentClient = null;

    initDefaultContent('Select a client to start creating a loan application');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', ClientHandler.self.synchronizeNow);
    $('#syncNow').show();



    var dataList = clientList.getEntities();
    var $rowContainer = getDefaultRowContainer(ClientHandler.ALL_CLIENTS_TITLES);
    var $table = $rowContainer.parent();

    for (var i = 0; i < dataList.length; i++) {
        var rowdata = {};

        for (var key in ClientHandler.ALL_CLIENTS_TITLES) {
            var formattedValue = dataList[i][key];
            if ('birthdate' === key || 'submitDate' === key) {
                formattedValue = formatDate(formattedValue);
            }
            if ('account' === key) {
                var savingsAccounts = savingsAccountList.getByClient(dataList[i]['awamoId']);
                var len = savingsAccounts.length;

                if (len > 0) {
                    var sum = 0;
                    for (var j = 0; j < len; j++) {
                        var savingsAccount = savingsAccounts[j];
                        sum = sum + savingsAccount['balance'];

                    }
                    formattedValue = currencyCode + " " + formatCurrency(sum);
                } else {
                    formattedValue = currencyCode + " " + 0;
                }
            }
            if ('loan' === key) {
                var loans = loanList.getByClient(dataList[i]['awamoId']);
                var len = loans.length;

                if (len > 0) {
                    var sum = 0;
                    for (var j = 0; j < len; j++) {
                        var loan = loans[j];
                        if (loan.status === "ACTIVE") {
                            sum = sum + loan['principal'];
                        }
                    }
                    formattedValue = currencyCode + " " + formatCurrency(sum);
                } else {
                    formattedValue = currencyCode + " " + 0;
                }
            }
            if (formattedValue === ' ') {
                formattedValue = 'n.a.';
            }
            rowdata[key] = formattedValue;
        }

        addRow($rowContainer, rowdata, dataList[i], ClientHandler.self.rowClickHandlerClientsForLoanApplication, dataList[i].accountId);
    }

    var tableSorter = getDefaultTableSorter();
    tableSorter.headers = {
        3: {sorter: 'awamoDateSorter'},
        4: {sorter: 'awamoDateSorter'}
    };
    $table.tablesorter(tableSorter);

    var els = document.getElementById("defaultTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }

    $('#tableTotal').text(dataList.length);
    showContent($('#tableTotalSum'));
    showContent($('#emailLoanReportDiv'));


    $("#hiddenPrintedTitle").val("Select a client to start creating a loan application");
};

ClientHandler.prototype.rowClickHandlerClientsForLoanApplication = function () {
    Options.prototype.createLoanApplication($(this).data('object'));
};
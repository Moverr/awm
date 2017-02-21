'use strict';

/* global printData,authorization, tenantId, currentTable, handlers, Storage, authentication, loanList, clientList, groupList, officerList, savingsAccountList, eventtype, currencyCode, Options */

// <editor-fold defaultstate="collapsed" desc=" init ">

var fromRepaymentDateLimit = "0";
var toRepaymentDateLimit = "999999999999999";

var fromLoanEndDateDateLimit = "0";
var toLoanEndDateDateLimit = "999999999999999";


var LOAN_STATUS = Object.freeze({
    REGISTERING: 'new loan application',
    VERIFIED: 'did client verification',
    SUBMITTED: 'submitted and pending approval',
    REJECTED: 'closed - rejected',
    WITHDRAWN: 'closed - withdrawn',
    APPROVED: 'approved',
    CONTRACT_SIGNED: 'contract is signed by client',
    AWAITING_DISBURSEMENT: 'loan is allwed to be disbursed',
    ACTIVE: 'active',
    CLOSED: 'closed - obligations met',
    CANCELED: 'closed - written off',
    OVERPAID: 'overpaid'
});

var LoanHandler = function () {
    LoanHandler.self = this;
    loanList.addDataModelChangedEventListenerCallback(LoanHandler.prototype.dataModelChanged);
    loanList.addEntityChangedEventListenerCallback(LoanHandler.prototype.loanEntityChanged);
    clientList.addEntityChangedEventListenerCallback(LoanHandler.prototype.clientEntityChanged);

    $('#loanApplicationForm input').on('input', LoanHandler.prototype.dataChangedHandler);
    $('#loanApplicationForm select').on('input', LoanHandler.prototype.dataChangedHandler);
    $('#loanReportType').on('input', LoanHandler.prototype.genericLoanReportSelectHandler);
    $('#loanReportTypePortfolio').on('input', LoanHandler.prototype.genericLoanReportProfileSelectHandler);

    $('#repaymentSchedule-tab').on('hide.bs.tab', function (e) {
        $('#singleActions a[data-action="print"]').hide();
    });

    $('#repaymentSchedule-tab').on('show.bs.tab', function (e) {
        $('#singleActions a[data-action="print"]').show();
    });
};

LoanHandler.ROOT_PATH = '/loan/v1d/';

LoanHandler.TRANSACTION_TITLES = {
    transactionDate: 'Date',
    amount: 'Amount',
    transactionType: 'Type',
    balance: 'Balance'
};

LoanHandler.APPLICATIONS_TITLES = {
    loanId: 'ID',
    ownerName: 'Name',
    principal: 'Principal',
    interestRate: 'Interest rate p.a.',
    disbursementDate: 'Disbursement'
};

LoanHandler.ALL_TITLES = {
    loanId: 'ID',
//    clientImage: 'Img',
    ownerName: 'Name',
    principal: 'Principal',
    interestRate: 'Interest rate p.a.',
    disbursementDate: 'Disbursement',
    status: 'Status',
    lastModified: 'Modified'
};

LoanHandler.REPAYMENT_SCHEDULE_TITLES = {
    dueDate: 'Due date',
    due: 'Amount',
    amortization: 'Amortization part',
    interest: 'Interest part',
    balance: 'New balance'
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" public methods ">
LoanHandler.prototype.getApplications = function () {
    addHistory('Loan applications', '#loanApplications', getSidebarSubitemSelector('actionRequired', 'Loan', 'getApplications'));
    currentTable = 'loanApplications';
    LoanHandler.self.previousPage = LoanHandler.self.getApplications;
    LoanHandler.self.displayApplications();
};

LoanHandler.prototype.getSingngContracts = function () {
    addHistory('Loan applications', '#loanApproved', getSidebarSubitemSelector('actionRequired', 'Loan', 'getSingngContracts'));
    currentTable = 'loanSingngContracts';
    LoanHandler.self.previousPage = LoanHandler.self.getSingngContracts;
    LoanHandler.self.displayApproved();
};

LoanHandler.prototype.getAllowedDisbursements = function () {
    addHistory('Disburse Loan', '#loanDisburse', getSidebarSubitemSelector('actionRequired', 'Loan', 'getAllowedDisbursements'));
    currentTable = 'loanAllowedDisbursements';
    LoanHandler.self.previousPage = LoanHandler.self.getAllowedDisbursements;
    LoanHandler.self.displayAllowedDisbursements();
};

LoanHandler.prototype.getDisbursements = function () {
    addHistory('Loan disbursements', '#loanDisbursements', getSidebarSubitemSelector('actionRequired', 'Loan', 'getDisbursements'));
    currentTable = 'loanDisbursements';
    LoanHandler.self.previousPage = LoanHandler.self.getDisbursements;
    LoanHandler.self.displayDisbursements();
};

//LoanHandler.prototype.getAll = function () {
//    currentTable = 'allLoans';
//    LoanHandler.self.previousPage = LoanHandler.self.getAll;
//    LoanHandler.self.displayLoans();
//};
//
//LoanHandler.prototype.getRejected = function () {
//    currentTable = 'rejectedLoans';
//    LoanHandler.self.previousPage = LoanHandler.self.getRejected;
//    LoanHandler.self.displayRejectedLoans();
//};
//
//LoanHandler.prototype.reportOutstandingBalance = function () {
//    currentTable = 'reportOutstandingBalance';
//    LoanHandler.self.previousPage = LoanHandler.self.reportOutstandingBalance;
//    LoanHandler.self.displayReportOutstandingBalance();
//};

LoanHandler.prototype.firstGenericLoanReports = function (list) {

    addHistory('Loan reports', '#loanReports', getSidebarSubitemSelector('reporting', 'Loan', 'genericLoanReports'));

    if ("ALL" === list | !exists(list) || !Array.isArray(list)) {
        list = loanList.getEntities();
    }
    $('#loanReportType').val('ALL');
    currentTable = 'genericLoanReports';
    LoanHandler.self.previousPage = LoanHandler.self.genericLoanReports;
    LoanHandler.self.displayGenericLoanReports(list);
};


LoanHandler.prototype.genericLoanReports = function (list) {
    addHistory('Loan reports', '#loanReports', getSidebarSubitemSelector('reporting', 'Loan', 'genericLoanReports'));

    if ("ALL" === list | !exists(list) || !Array.isArray(list)) {
        list = loanList.getEntities();
    }
//$('#loanReportType').val('ALL');
    currentTable = 'genericLoanReports';
    LoanHandler.self.previousPage = LoanHandler.self.genericLoanReports;
    LoanHandler.self.displayGenericLoanReports(list);
};

//LoanHandler.prototype.loadLoans = function () {
//    loanList.reload();
//};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" private methods ">
LoanHandler.prototype.outputLoan = function (loan) {
    var $row = null;

    if ('loanApplications' === currentTable) {
        if (loan.status === 'SUBMITTED') {
            $row = LoanHandler.self.addToTable(loan);
        } else {
            // noop
        }
    } else if ('loanDisbursements' === currentTable) {
        if (loan.status === 'CONTRACT_SIGNED') {
            $row = LoanHandler.self.addToTable(loan);
        } else {
            // noop
        }
    } else if ('rejectedLoans' === currentTable) {
        if (loan.status === 'REJECTED') {
            $row = LoanHandler.self.addToTable(loan);
        } else {
            // noop
        }
    } else if ('allLoans' === currentTable) {
        $row = LoanHandler.self.addToTable(loan);
    } else {
        // noop
    }

    return $row;
};

LoanHandler.prototype.displayApplications = function () {
    LoanHandler.prototype.currentLoan = null;
    initDefaultContent('Loan applications');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    LoanHandler.self.removeTableFilterClassesLoans();
    LoanHandler.self.displayInTable(LoanHandler.APPLICATIONS_TITLES, loanList.getSubmittedLoanList());
};


LoanHandler.prototype.displayApproved = function () {
    LoanHandler.prototype.currentLoan = null;
    initDefaultContent('Loan with unsigned contracts');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    LoanHandler.self.removeTableFilterClassesLoans();
    LoanHandler.self.displayInTable(LoanHandler.APPLICATIONS_TITLES, loanList.getApprovedLoanList());
};

LoanHandler.prototype.displayDisbursements = function () {
    LoanHandler.prototype.currentLoan = null;
    initDefaultContent('Loan disbursements');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();

    LoanHandler.self.removeTableFilterClassesLoans();
    LoanHandler.self.displayInTable(LoanHandler.APPLICATIONS_TITLES, loanList.getContractSignedLoanList());
};

LoanHandler.prototype.displayAllowedDisbursements = function () {
    LoanHandler.prototype.currentLoan = null;
    initDefaultContent('Loans awaiting disbursement');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();

    LoanHandler.self.removeTableFilterClassesLoans();
    LoanHandler.self.displayInTable(LoanHandler.APPLICATIONS_TITLES, loanList.getDisburesmentAllowedList());
};

LoanHandler.prototype.displayLoans = function () {
    LoanHandler.prototype.currentLoan = null;
    initDefaultContent('All loans');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();

    LoanHandler.self.removeTableFilterClassesLoans();
    LoanHandler.self.displayInTable(LoanHandler.ALL_TITLES, loanList.getEntities());

    $('#defaultTableContainer').addClass('allLoansTable');
};

LoanHandler.prototype.displayRejectedLoans = function () {
    LoanHandler.prototype.currentLoan = null;
    initDefaultContent('Rejected loans');

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();

    LoanHandler.self.removeTableFilterClassesLoans();
    LoanHandler.self.displayInTable(LoanHandler.APPLICATIONS_TITLES, loanList.getRejectedLoanList());
};

LoanHandler.prototype.displayGenericLoanReports = function (list) {
    var len = list.length;

    LoanHandler.prototype.currentLoan = null;
    hideContent();

    $('#tableTotal').text(len);

    $('h3.page-header').hide();
    $('h4.sub-header').hide();
    $('#loanReportType').show();

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', LoanHandler.self.synchronizeNow);
    $('#syncNow').show();

    $('#printNow').off('click touch');
    $('#printNow').on('click touch', printData);
    $('#printNow').show();

    $('#sendLoanEmailReportBotton').off('click touch');
    $('#sendLoanEmailReportBotton').on('click touch', LoanHandler.self.sendEmailLoanReportRequest);
    $('#sendLoanEmailReportBotton').show();

    // use &nbsp; instead of space to avoid line wrap in column header
    var titles = {
        //awamoId: 'Awamo&nbsp;ID',
        ownerName: 'Name',
        principal: 'Principal&nbsp;balance',
        repaidPrincipal: 'Paid',
        //gender: 'Gender',
        //currency: 'Currency',

        //accountNo: 'loan&nbsp;account',
        disbursedAmount: 'Disbursed&nbsp;amount',
        disbursementDate: 'Disbursed&nbsp;in',
        //officer: 'Officer',
        //product: 'Loan&nbsp;product',
        //branch: 'Branch',

        interest: 'Expected&nbsp;interest',
        //principalArrears: 'Principal&nbsp;arrears',
        //interestArrears: 'Interest&nbsp;arrears',
        status: 'Status',
        //phone: 'Telephone',
        health: 'Health',
        reason: 'Reason',
        expectedEnd: 'Expected&nbsp;end',
        //closedOn: 'Closed&nbsp;on'
        endDate: 'Actual&nbsp;end'
    };

    LoanHandler.self.removeTableFilterClassesLoans();

    var convert = function (loan) {
        // when loans are in status ACTIVE, all of them have
        // - either client or group
        // - transaction list containing a disbursement
        // - repayment schedule containing interests
        // when in status CLOSED, it is given that
        // - there is one final transaction of type REPAYMENT that
        // - sets the balance to zero

        var gender = exists(loan.client) ? loan.client.gender : '--&nbsp;group&nbsp;--';
        var disbursementDate = '';

        if (exists(loan.transactionList)) {
            var filteredTransactionList = loan.transactionList.filter(function (transaction) {
                return transaction.transactionType === 'DISBURSEMENT';
            });
            if (filteredTransactionList.length > 0) {
                disbursementDate = filteredTransactionList[0].transactionDate;
            }
        }

        var interest = exists(loan.repaymentSchedule) ? loan.repaymentSchedule.rows.map(function (row) {
            return row.interest;
        }).sum() : 0;
        var phone = exists(loan.client) ? loan.client.phone1 : '--&nbsp;group&nbsp;--';
        var closedOn = '--&nbsp;open&nbsp;--';

        if (loan.status === 'CLOSED') {
            closedOn =
                    formatDate(
                            loan
                            .transactionList
                            .filter(function (transaction) {
                                return transaction.transactionType === 'REPAYMENT' && transaction.balance === 0;
                            })[0]
                            .transactionDate);
        } else if (loan.status === 'REJECTED') {
            closedOn = formatDate(loan.lastModified);
        }
        var endDate = LoanHandler.prototype.getEndDate(loan);
        if (endDate !== '---') {
            endDate = formatDate(LoanHandler.prototype.getEndDate(loan));
        }

        return {
            //awamoId: loan.awamoId,
            ownerName: exists(loan.ownerName) ? loan.ownerName.replaceAll(' ', '&nbsp;') : '',
            principal: currencyCode + " " + formatCurrency(loan.principal).replaceAll(' ', '&nbsp;'),
            repaidPrincipal: currencyCode + " " + formatCurrency(LoanHandler.prototype.getTotalRepayments(loan)).replaceAll(' ', '&nbsp;'),
            //gender: gender,
            //currency: currencyCode,

            //accountNo: loan.loanId,
            disbursedAmount: currencyCode + " " + formatCurrency(loan.principal).replaceAll(' ', '&nbsp;'),
            disbursementDate: formatDate(disbursementDate).replaceAll(' ', '&nbsp;'),
            //officer: exists(loan.officer) ? loan.officer.fullname.replaceAll(' ', '&nbsp;') : '',
            //product: 'tbd',
            //branch: 'tbd',

            interest: formatCurrency(interest).replaceAll(' ', '&nbsp;'),
            //principalArrears: 'tbd',
            //interestArrears: 'tbd',
            status: loan.status,
            //phone: exists(phone) ? phone.replaceAll(' ', '&nbsp;') : '',
            health: loan.health,
            reason: loan.reason,
            expectedEnd: formatDate(LoanHandler.prototype.getExpectedEndDate(loan)),
            //closedOn: closedOn
            endDate: endDate
        };
    };

    var $rowContainer = getDefaultRowContainer(titles);
    var $table = $rowContainer.parent();

    for (var i = 0; i < len; i++) {
        addRow($rowContainer, convert(list[i]), list[i], LoanHandler.self.rowClickHandler, list[i].mainId);
    }

    var tableSorter = getDefaultTableSorter();
    tableSorter.headers = {
        4: {sorter: 'awamoDateSorter'},
        6: {sorter: 'awamoCurrencySorter'},
        10: {sorter: 'awamoCurrencySorter'},
        11: {sorter: 'awamoCurrencySorter'},
        16: {sorter: 'awamoLoanHealthSorter'},
        17: {sorter: 'awamoDateSorter'}
    };
    $table.tablesorter(tableSorter);
    var els = document.getElementById("defaultTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }

    addClassToTableColumn($table, 6, 'currency');
    addClassToTableColumn($table, 10, 'currency');
    addClassToTableColumn($table, 11, 'currency');

    showContent($('#loanReportTypeForm'));
    showContent($('#tableTotalSum'));
    showContent($('#emailLoanReportDiv'));

    var tables = $('#defaultTableContainer').tableExport();
    tables.tableExport.update({
        formats: ["xls", "xlsx"],
        fileName: "Loans",
        headings: true
    });

    $("#hiddenPrintedTitle").val("Loans Report");
};

LoanHandler.prototype.getTransactionsRowData = function (transaction) {
    var rowdata = {};

    for (var key in LoanHandler.TRANSACTION_TITLES) {
        var formattedValue = transaction[key];

        switch (key) {
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

LoanHandler.prototype.genericLoanReportSelectHandler = function () {
    $('#ClearDatesPd').click();
    $('#ClearDatesEd').click();
    switch ($(this).val()) {
        case 'ALL':
            LoanHandler.self.genericLoanReports(loanList.getEntities());
            break;
        case 'REJECTED':
            LoanHandler.self.genericLoanReports(loanList.getListByStatus('REJECTED'));
            break;
        case 'OUTSTANDING_BALANCE':
            LoanHandler.self.genericLoanReports(loanList.getListByStatus('ACTIVE'));
            break;
        case 'PORTFOLIO':
            LoanHandler.self.genericLoanReports(loanList);
            $('#loanReportTypePortfolio').val('ALL');
            $('#loanReportTypePortfolio').show();
            break;
        case 'ARREARS':
            LoanHandler.self.genericLoanReports([]);
            break;
        case 'PORTFOLIO_AT_RISK':
            LoanHandler.self.genericLoanReports(loanList.getListByStatus('ACTIVE').filter(function (loan) {
                return loan.health !== 'PAR_0';
            }));
            break;
        case 'PREPAID':
            LoanHandler.self.genericLoanReports(loanList.getListByStatus('ACTIVE').filter(function (loan) {
                return LoanHandler.prototype.isPrePaid(loan) && !LoanHandler.prototype.fullyRepaid(loan);
            }));
            break;
        case 'FullyRepaid':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return LoanHandler.prototype.fullyRepaid(loan);
            }));
            $('#datesSelectorLoanEndDate').show();
            break;
        case 'REPAYMENTDUE':
            LoanHandler.self.genericLoanReports(loanList.getListByStatus('ACTIVE').filter(function (loan) {
                return LoanHandler.prototype.hasPayment(loan);
            }));
            $('#datesSelectorPaymentDue').show();
            break;
        case 'OVERPAID':
            LoanHandler.self.genericLoanReports(loanList.getListByStatus('OVERPAID'));
            break;
        default:
            break;
    }
};

LoanHandler.prototype.genericLoanReportProfileSelectHandler = function () {
    switch ($(this).val()) {
        case 'ALL':
            LoanHandler.self.genericLoanReports(loanList.getEntities());
            $('#loanReportTypePortfolio').show();
            break;
        case 'PAR_0':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return loan.health === 'PAR_0';
            }));
            $('#loanReportTypePortfolio').show();
            break;
        case 'PAR_3':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return loan.health === 'PAR_3';
            }));
            $('#loanReportTypePortfolio').show();
            break;
        case 'PAR_30':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return loan.health === 'PAR_30';
            }));
            $('#loanReportTypePortfolio').show();
            break;
        case 'PAR_60':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return loan.health === 'PAR_60';
            }));
            $('#loanReportTypePortfolio').show();
            break;
        case 'PAR_90':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return loan.health === 'PAR_90';
            }));
            $('#loanReportTypePortfolio').show();
            break;
        case 'DEFAULTED':
            LoanHandler.self.genericLoanReports(loanList.getEntities().filter(function (loan) {
                return loan.health === 'DEFAULTED';
            }));
            $('#loanReportTypePortfolio').show();
            break;
        default:
            break;
    }
};

LoanHandler.prototype.removeTableFilterClassesLoans = function () {
    $('#defaultTableContainer').removeClass('allLoansTable');
};

LoanHandler.prototype.displayInTable = function (titles, dataList) {
    var $rowContainer = getDefaultRowContainer(titles);
    var $table = $rowContainer.parent();

    for (var i = 0; i < dataList.length; i++) {
// without image use this
        addRow(
                $rowContainer,
                LoanHandler.prototype.getRowData(titles, dataList[i]),
                dataList[i],
                LoanHandler.self.rowClickHandler,
                dataList[i].loanId);
// with images use this
//        var $row = addRow($rowContainer, LoanHandler.prototype.getRowData(titles, dataList[i]), dataList[i], LoanHandler.self.rowClickHandler, dataList[i].loanId);
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
        4: {sorter: 'awamoDateSorter'}
    };
    $table.tablesorter(tableSorter);
    var els = document.getElementById("defaultTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }

    $('#tableTotal').text(dataList.length);
    showContent($('#tableTotalSum'));
};

LoanHandler.prototype.addToTable = function (data) {
    var $row = null;
    if (
            'loanApplications' === currentTable ||
            'loanDisbursements' === currentTable ||
            'allLoans' === currentTable ||
            'rejectedLoans' === currentTable) {

        var titles = LoanHandler.APPLICATIONS_TITLES;
        if ('allLoans' === currentTable) {
            titles = LoanHandler.ALL_TITLES;
        }

        var $tableContainer = $('#defaultTableContainer');

        if ($tableContainer.is(":visible")) {
            var $table = $tableContainer.find('table');
            var $rowContainer = $table.find('tbody');
            var $row = $rowContainer.find('[data-id="' + data.loanId + '"]');
            var oldData = $row.data('object');
            var formattedRowData = LoanHandler.prototype.getRowData(titles, data);

            if (!exists(oldData)) {
                addRow($rowContainer, formattedRowData, data, LoanHandler.self.rowClickHandler, data.loanId);
            } else {
                var $cells = $row.find('td');
                var len = $cells.length;

                for (var i = 0; i < len; i++) {
                    var $cell = $($cells[i]);
                    var newValue = formattedRowData[Object.keys(titles)[i]];
                    if ($cell.html() !== newValue) {
                        $cell.html(newValue);
                        highlightUpdatedCell($cell);
                    }
                }
            }
        }
    }
};

LoanHandler.prototype.getRowData = function (titles, loan) {
    var rowdata = {};

    for (var key in titles) {
        var formattedValue = loan[key];

        switch (key) {
            case 'clientImage':
                formattedValue = '<img src="images/personPlaceholderNoText.png" alt="client" height="32" />';

                if (loan.loanType === 'GROUP') {
                    formattedValue = '<img src="images/groupPlaceholder.png" alt="client" height="32" />';
                } else if (loan.loanType === 'INDIVIDUAL') {
                    formattedValue = '<img src="images/personPlaceholderNoText.png" alt="client" height="32" />';
                }
                break;
            case 'submitDate':
            case 'disbursementDate':
            case 'lastModified':
                formattedValue = formatDate(formattedValue);
                break;
            case 'principal':
                formattedValue = formatCurrency(formattedValue) + ' ' + currencyCode;
                break;
            case 'interestRate':
                formattedValue = formatPercentage(formattedValue) + ' %';
                break;
            default:
                break;
        }

        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" display a single loan (individual and group) ">
// main loan display method
LoanHandler.prototype.displayOneLoan = function (loan) {
    //addHistory('Dashboard overview', '#dashboardOverview', '#dashboard');

    // check parameter
    if (typeof (loan.loanClients) === "undefined" || loan.loanClients === null || loan.loanClients.length === 0) {
        return;
    }

    // store current loan
    LoanHandler.self.loan = loan;

    // page headers
    initDefaultContent(''); // gets set during "adjustments"

    $('#syncNow').off('click touch');
    $('#syncNow').on('click touch', function () {
        loanList.loadOne(loan.loanId, LoanHandler.self.displayOneLoan);
    });
    $('#syncNow').show();

    // loan
    LoanHandler.self.displayLoanDataOfLoan(loan);

    // client(s)
    LoanHandler.prototype.displayClientsOfLoan(loan);

    // loan type
    if (loan.loanType === 'INDIVIDUAL') {
        LoanHandler.self.adjustForIndividualLoan(loan);
    } else if (loan.loanType === 'GROUP') {
        LoanHandler.self.adjustForGroupLoan(loan);
    } else {
        // TODO: error? JLG? else?
    }

    // repayment schedule
    LoanHandler.prototype.displayRepaymentScheduleOfLoan(loan);

    // transactions
    LoanHandler.prototype.displayTransactionsOfLoan(loan);

    // actions
    LoanHandler.self.adjustSingleActionsByStatus(loan.status);

    // editability
    LoanHandler.self.disableFieldsOfSingleLoan(loan.loanType === 'GROUP' || loan.status !== 'SUBMITTED');

    // show necessary content
    showContent($('#singleActions'));
    showContent($('#loan'));
};

// loan related data
LoanHandler.prototype.displayLoanDataOfLoan = function (loan) {
    $('#principal').val(formatCurrency(loan.principal));
    $('#principal').prev('.input-group-addon').text(currencyCode);
    $('#reason').val(loan.reason);
    $('#disbursementDate').val(formatDate(loan.disbursementDate));
    $('#amortization').val(loan.amortizationType);
    $('#status').val(loan.status);
    $('#submitDate').val(formatDate(loan.submitDate));
    $('#duration').val(loan.duration);
    $('#repayments').val(loan.repayments);
    $('#interestRate').val(formatPercentage(loan.interestRate));
    $('#repayments').val(loan.numberOfRepayments);
    $('#interestType').val(loan.interestType);
    $('#amortization').val(loan.amortizationType);
    $('#interestCalculationPeriodType').val(loan.interestCalculationPeriodType);
    $('#officerComment').text(loan.officerComment);

    if (loan.status === 'REJECTED') {
        $('#rejectNoteGroup').show();
        $('#rejectNote').text(loan.rejectNote);
    } else {
        $('#rejectNoteGroup').hide();
        $('#rejectNote').text('');
    }

    if (loan.loanType === 'GROUP') {
        $('#groupName').val(loan.ownerName);
        $('#responsibleLO').val(loan.officer.fullname);
    } else {
        $('#groupName').val('');
        $('#responsibleLO').val('');
    }

    $('.transactionPaymentField').hide();
    if (exists(loan.transactionList)) {
        var len = loan.transactionList.length;

        for (var i = 0; i < len; i++) {
            var transaction = loan.transactionList[i];
            console.log(transaction);
            if (transaction.transactionType === "DISBURSEMENT") {

                $('#transactionPaymentPaymentType').val(transaction.transactionPayment.paymentType);

                if (transaction.transactionPayment.paymentType === "CHEQUE") {
                    $('#transactionPaymentChequeNumber').val(transaction.transactionPayment.chequeNumber);
                    $('#transactionPaymentChequeNumber').parent().parent().show();
                } else if (transaction.transactionPayment.paymentType === "MOBILE_MONEY") {
                    $('#transactionPaymentAccountName').val(transaction.transactionPayment.accountName);
                    $('#transactionPaymentAccountName').parent().parent().show();
                    $('#transactionPaymentPhoneNumber').val(transaction.transactionPayment.phoneNumber);
                    $('#transactionPaymentPhoneNumber').parent().parent().show();
                } else if (transaction.transactionPayment.paymentType === "BANK_TRANSFER") {
                    $('#transactionPaymentAccountName').val(transaction.transactionPayment.accountName);
                    $('#transactionPaymentAccountName').parent().parent().show();
                    $('#transactionPaymentAccountNumber').val(transaction.transactionPayment.accountNumber);
                    $('#transactionPaymentAccountNumber').parent().parent().show();
                    $('#transactionPaymentBankBranch').val(transaction.transactionPayment.bankBranch);
                    $('#transactionPaymentBankBranch').parent().parent().show();
                    $('#transactionPaymentBankName').val(transaction.transactionPayment.bankName);
                    $('#transactionPaymentBankName').parent().parent().show();
                } else if (transaction.transactionPayment.paymentType === "CASH") {
                    // nothing to show
                }

                break;
            }
        }

    }
};

// all clients of a loan
LoanHandler.prototype.displayClientsOfLoan = function (loan) {
    $('#loanTabContentList .generatedClientTab').remove();
    var len = loan.loanClients.length;
    for (var i = 0; i < len; i++) {
        var $template = LoanHandler.self.displayClientOfLoan($('#clientTabContentTemplate').html(), loan, i);
        $template.insertAfter($('#loanTabContent'));
    }
};

// single client of a loan
LoanHandler.prototype.displayClientOfLoan = function (template, loan, counter) {


    var $template = $(template.replace(/###counter###/g, counter));
    var loanClient = loan.loanClients[counter];
    document.getElementById("loanClientImageID").src = "images/personPlaceholderNoText.png";

    $.ajax({
        url: host + '/client/v1d/find?' +
                'awamoId=' + loanClient.awamoId + '&' +
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
                    document.getElementById("loanClientImageID").src = e.target.result;
                };
                fr.readAsDataURL(blob);
            })
            .fail(function (e) {
                document.getElementById("loanClientImageID").src = "images/personPlaceholderNoText.png";
                console.log('fail');
                console.log(e);
            });





    var $clientnameField = $template.find('#clientName' + counter);

    $clientnameField.val('loading client ...');
    clientList.get(loanClient.awamoId, function (client) {
        if (client === null) {
            $clientnameField.val('client name not found');
        } else {
            $clientnameField.val(client.fullname);
        }
    });

    $template.find('#numberOfChildren' + counter).val(loanClient.numberOfChildren);
    $template.find('#numberOfChildrenInHousehold' + counter).val(loanClient.numberOfChildrenInHouseHold);
    $template.find('#maritalStatus' + counter).val(loanClient.maritalStatus);
    $template.find('#livingArea' + counter).val(loanClient.livingArea);
    $template.find('#homeProvince' + counter).val(loanClient.address.province);
    $template.find('#homeCity' + counter).val(loanClient.address.city);
    $template.find('#homeStreet' + counter).val(loanClient.address.street);








    if (loanClient.clientEmployments === null) {
        $template.find('#employmentPanel' + counter + ' p.message').show();
        $template.find('#employmentPanel' + counter + ' div.form-group').hide();
        $template.find('#selfEmploymentPanel' + counter + ' p.message').show();
        $template.find('#selfEmploymentPanel' + counter + ' div.form-group').hide();
    } else {
        var clientEmployments = loanClient.clientEmployments;

        if (clientEmployments.length === 1) {
            if (clientEmployments[0].employmentType === 'SELF_EMPLOYED') {
                $template.find('#employmentPanel' + counter + ' p.message').show();
                $template.find('#employmentPanel' + counter + ' div.form-group').hide();
                $template.find('#selfEmploymentPanel' + counter + ' p.message').hide();
                $template.find('#selfEmploymentPanel' + counter + ' div.form-group').show();
            } else if (clientEmployments[0].employmentType === 'EMPLOYED') {
                $template.find('#employmentPanel' + counter + ' p.message').hide();
                $template.find('#employmentPanel' + counter + ' div.form-group').show();
                $template.find('#selfEmploymentPanel' + counter + ' p.message').show();
                $template.find('#selfEmploymentPanel' + counter + ' div.form-group').hide();
            } else {
                $template.find('#employmentPanel' + counter + ' p.message').show();
                $template.find('#employmentPanel' + counter + ' div.form-group').hide();
                $template.find('#selfEmploymentPanel' + counter + ' p.message').show();
                $template.find('#selfEmploymentPanel' + counter + ' div.form-group').hide();
            }
        } else if (clientEmployments.length === 2) {
            if (clientEmployments[0].employmentType === 'SELF_EMPLOYED' ||
                    clientEmployments[1].employmentType === 'SELF_EMPLOYED') {
                $template.find('#selfEmploymentPanel' + counter + ' p.message').hide();
                $template.find('#selfEmploymentPanel' + counter + ' div.form-group').show();
            } else {
                $template.find('#selfEmploymentPanel' + counter + ' p.message').show();
                $template.find('#selfEmploymentPanel' + counter + ' div.form-group').hide();
            }
            if (clientEmployments[0].employmentType === 'EMPLOYED' ||
                    clientEmployments[1].employmentType === 'EMPLOYED') {
                $template.find('#employmentPanel' + counter + ' p.message').hide();
                $template.find('#employmentPanel' + counter + ' div.form-group').show();
            } else {
                $template.find('#employmentPanel' + counter + ' p.message').show();
                $template.find('#employmentPanel' + counter + ' div.form-group').hide();
            }
        } else {
            $template.find('#employmentPanel' + counter + ' p.message').show();
            $template.find('#employmentPanel' + counter + ' div.form-group').hide();
            $template.find('#selfEmploymentPanel' + counter + ' p.message').show();
            $template.find('#selfEmploymentPanel' + counter + ' div.form-group').hide();
        }

        if (clientEmployments[0].employmentType === 'EMPLOYED') {
            $template.find('#employmentStartDate' + counter).val(formatDate(clientEmployments[0].startDate));
            $template.find('#employmentMonthlyIncome' + counter).val(formatCurrency(clientEmployments[0].monthlyIncome) + ' ' + currencyCode);
            $template.find('#employmentFormallyRegistered' + counter).val(clientEmployments[0].formallyRegistered ? 'yes' : 'no');
            $template.find('#employmentNumberOfEmployees' + counter).val(clientEmployments[0].numberOfEmployees);
            $template.find('#employmentSector' + counter).val(clientEmployments[0].businessSector);
            $template.find('#employmentProvince' + counter).val(clientEmployments[0].address.province);
            $template.find('#employmentCity' + counter).val(clientEmployments[0].address.city);
            $template.find('#employmentStreet' + counter).val(clientEmployments[0].address.street);
        }

        if (clientEmployments[0].employmentType === 'SELF_EMPLOYED') {
            $template.find('#selfEmploymentType' + counter).val(clientEmployments[0].selfEmploymentType);
            $template.find('#selfEmploymentStartDate' + counter).val(formatDate(clientEmployments[0].startDate));
            $template.find('#selfEmploymentMonthlyIncome' + counter).val(formatCurrency(clientEmployments[0].monthlyIncome) + ' ' + currencyCode);
            $template.find('#selfEmploymentFormallyRegistered' + counter).val(clientEmployments[0].formallyRegistered ? 'yes' : 'no');
            $template.find('#selfEmploymentNumberOfEmployees' + counter).val(clientEmployments[0].numberOfEmployees);

            if (clientEmployments[0].sector === 'BUSINESS_SECTOR') {
                $template.find('#selfEmploymentBusinessSector' + counter).val(clientEmployments[0].businessSector);
                $template.find('#farmer' + counter).hide();
                $template.find('#non-farmer' + counter).show();
            } else if (clientEmployments[0].sector === 'AGRICULTURAL_SECTOR') {
                $template.find('#selfEmploymentAgriculturalSector' + counter).val(clientEmployments[0].agriculturalSector);
                $template.find('#farmer' + counter).show();
                $template.find('#non-farmer' + counter).hide();
            }

            $template.find('#selfEmploymentProvince' + counter).val(clientEmployments[0].address.province);
            $template.find('#selfEmploymentCity' + counter).val(clientEmployments[0].address.city);
            $template.find('#selfEmploymentStreet' + counter).val(clientEmployments[0].address.street);
        }

        if (clientEmployments.length > 1) {
            if (clientEmployments[1].employmentType === 'EMPLOYED') {
                $template.find('#employmentStartDate' + counter).val(formatDate(clientEmployments[1].startDate));
                $template.find('#employmentMonthlyIncome' + counter).val(formatCurrency(clientEmployments[1].monthlyIncome) + ' ' + currencyCode);
                $template.find('#employmentFormallyRegistered' + counter).val(clientEmployments[0].formallyRegistered ? 'yes' : 'no');
                $template.find('#employmentNumberOfEmployees' + counter).val(clientEmployments[1].numberOfEmployees);
                $template.find('#employmentSector' + counter).val(clientEmployments[1].businessSector);
                $template.find('#employmentProvince' + counter).val(clientEmployments[1].address.province);
                $template.find('#employmentCity' + counter).val(clientEmployments[1].address.city);
                $template.find('#employmentStreet' + counter).val(clientEmployments[1].address.street);
            }

            if (clientEmployments[1].employmentType === 'SELF_EMPLOYED') {
                $template.find('#selfEmploymentType' + counter).val(clientEmployments[1].selfEmploymentType);
                $template.find('#selfEmploymentStartDate' + counter).val(formatDate(clientEmployments[1].startDate));
                $template.find('#selfEmploymentMonthlyIncome' + counter).val(formatCurrency(clientEmployments[1].monthlyIncome) + ' ' + currencyCode);
                $template.find('#selfEmploymentFormallyRegistered' + counter).val(clientEmployments[0].formallyRegistered ? 'yes' : 'no');
                $template.find('#selfEmploymentNumberOfEmployees' + counter).val(clientEmployments[1].numberOfEmployees);

                if (clientEmployments[1].sector === 'BUSINESS_SECTOR') {
                    $template.find('#selfEmploymentBusinessSector' + counter).val(clientEmployments[1].businessSector);
                    $template.find('#farmer' + counter).hide();
                    $template.find('#non-farmer' + counter).show();
                } else if (clientEmployments[1].sector === 'AGRICULTURAL_SECTOR') {
                    $template.find('#selfEmploymentBusinessSector' + counter).val(clientEmployments[1].businessSector);
                    $template.find('#farmer' + counter).show();
                    $template.find('#non-farmer' + counter).hide();
                }

                $template.find('#selfEmploymentProvince' + counter).val(clientEmployments[1].address.province);
                $template.find('#selfEmploymentCity' + counter).val(clientEmployments[1].address.city);
                $template.find('#selfEmploymentStreet' + counter).val(clientEmployments[1].address.street);
            }
        }
    }

    return $template;
};

// repayment schedule
LoanHandler.prototype.getRepaymentScheduleRowData = function (repaymentScheduleRow) {
    var rowdata = {};

    for (var key in LoanHandler.REPAYMENT_SCHEDULE_TITLES) {
        var formattedValue = repaymentScheduleRow[key];

        if (parseInt(formattedValue) < 0) {
            formattedValue = '';
        } else {
            switch (key) {
                case 'dueDate':
                    formattedValue = formatDate(formattedValue);
                    break;
                case 'due':
                case 'amortization':
                case 'interest':
                case 'balance':
                    formattedValue = formatCurrency(formattedValue) + ' ' + currencyCode;
                    break;
                default:
                    break;
            }
        }

        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};



LoanHandler.prototype.displayRepaymentScheduleOfLoan = function (loan) {
    var $rowContainer = getRowContainer('#repaymentScheduleTableContainer', LoanHandler.REPAYMENT_SCHEDULE_TITLES);
    var $table = $rowContainer.parent();

    if (!exists(loan) || !exists(loan.repaymentSchedule) || !exists(loan.repaymentSchedule.rows)) {
        console.log('no repaymentSchedule found on this loan');
        console.log(loan);
        console.log('---------------------------');
        return;
    }

    var rows = loan.repaymentSchedule.rows;
    var len = rows.length;
    for (var i = 0; i < len; i++) {
        addRow($rowContainer, LoanHandler.prototype.getRepaymentScheduleRowData(rows[i]));
    }

    var tableSorter = getDefaultTableSorter();
    // TODO: this depends on the titles ...
    tableSorter.headers = {
        0: {sorter: 'awamoDateSorter'},
        1: {sorter: 'awamoCurrencySorter'},
        2: {sorter: 'awamoCurrencySorter'},
        3: {sorter: 'awamoCurrencySorter'},
        4: {sorter: 'awamoCurrencySorter'}
    };
    tableSorter.sortList = [[4, 1]];
    $table.tablesorter(tableSorter);
};

// adjust GUI for individual loan (e.g. show collaterals)
LoanHandler.prototype.adjustForIndividualLoan = function (loan) {
    $('h3.page-header').text("Individual loan #" + loan.loanId);
    $('#client-tab').show();
    $('#group-tab').hide();
    $('#creditCollaterals-tab').show();
    $('#guarantor-tab').show();
    $('#guarantor-tab').show();

    $('#groupName').parent().parent().hide();
    $('#responsibleLO').parent().parent().hide();

    if (loan.creditCollaterals !== null && loan.creditCollaterals.length > 0) {
        var creditCollateral = loan.creditCollaterals[0];
        $('#creditCollateralType').val(creditCollateral.type);
        $('#creditCollateralDescription').val(creditCollateral.description);
        $('#creditCollateralValue').val(formatCurrency(creditCollateral.value) + ' ' + currencyCode);

        // images are lazy-loaded if not found locally
        var img = $('#collateralPanel .imageframe img')[0];
        if (typeof (Storage) !== "undefined") {


            (function (loanId, img) {
                $.ajax({
                    url: host + loanList.rootPath + loanId + '/download?datatype=COLLATERAL_IMG_1',
                    type: 'GET',
                    headers: getAuthenticationHeader(),
                    xhrFields: {
                        responseType: 'arraybuffer'
                    }
                })
                        .done(function (e) {
                            var blob = new Blob([e], {type: "image/jpg"});
                            var fr = new FileReader();
                            fr.onload = function (e) {
                                img.src = e.target.result;

                            };
                            fr.readAsDataURL(blob);
                        })
                        .fail(function (e) {
                            console.log('fail');
                            console.log(e);
                        })
                        .always(function (e) {
//                      console.log('always');
//                      console.log(e);
                        });
            })(loan.loanId, img);

        }
    } else {
        // noop, show that there are no collaterals
    }

    if (!exists(loan.loanClients[0].guarantor)) {
        $('#guarantorPanel0 p.message').show();
        $('#guarantorPanel0 div.form-group').hide();
    } else {
        $('#guarantorPanel0 p.message').hide();
        $('#guarantorPanel0 div.form-group').show();
        $('#guarantorName0').val(loan.loanClients[0].guarantor.guarantorName);
        $('#guarantorValue0').val(formatCurrency(loan.loanClients[0].guarantor.guarantorValue) + ' ' + currencyCode);
    }

    if ($('#client-tab').parent().hasClass('active') || $('#group-tab').parent().hasClass('active')) {
        $('#client-tab').tab('show');
        $('#client0').addClass('active in');
    }
};

// adjust GUI for group loan (e.g. hide collaterals)
LoanHandler.prototype.adjustForGroupLoan = function (loan) {
    $('h3.page-header').text("Group loan #" + loan.loanId);
    $('#client-tab').hide();
    $('#group-tab').show();
    $('#creditCollaterals-tab').hide();
    $('#guarantor-tab').hide();
    $('#groupName').parent().parent().show();
    $('#responsibleLO').parent().parent().show();
    $('#group-tab-contents').empty();
    var len = loan.loanClients.length;

    for (var i = 0; i < len; i++) {
        var groupLoanClientTabItem = $('#groupLoanClientTabItem').html().replace(/###counter###/g, i);
        $('#group-tab-contents').append($(groupLoanClientTabItem));

        (function (index) {
            clientList.get(loan.loanClients[index].awamoId, function (client) {
                $('#client' + index + '-tab').text(client.fullname);
            });
        })(i);
    }

    if ($('#client-tab').parent().hasClass('active') || $('#group-tab').parent().hasClass('active')) {
        $('#client0-tab').tab('show');
    }

    if ($('#creditCollaterals-tab').parent().hasClass('active') || $('#guarantor-tab').parent().hasClass('active')) {
        $('#loan-tab').tab('show');
    }
};

// adjust GUI by loan status
LoanHandler.prototype.disableFieldsOfSingleLoan = function (disabledState) {
    $('#principal').prop('disabled', disabledState);
    $('#duration').prop('disabled', disabledState);
    $('#amortization').prop('disabled', disabledState);
    $('#repayments').prop('disabled', disabledState);
    $('#interestRate').prop('disabled', disabledState);
    $('#interestType').prop('disabled', disabledState);
    $('#interestCalculationPeriodType').prop('disabled', disabledState);
    $('#paymentType').prop('disabled', disabledState);
};

LoanHandler.prototype.adjustSingleActionsByStatus = function (status) {
    // TODO: can I use LoanStatus.SUBMITTED somehow?

    $('#singleActions a[data-action]').hide();
    $('#singleActions a[data-action="back"]').show();

    if ($('#repaymentSchedule-tab').parent().hasClass('active')) {
        $('#singleActions a[data-action="print"]').show();
    } else {
        $('#singleActions a[data-action="print"]').hide();
    }

    switch (status) {
        case 'SUBMITTED':
            $('#singleActions a[data-action="approve"]').show();
            $('#singleActions a[data-action="reject"]').show();
            break;
        case 'REJECTED':
            break;
        case 'APPROVED':
            $('#singleActions a[data-action="confirmContractSigned"]').show();
            break;
        case 'CONTRACT_SIGNED':
            $('#singleActions a[data-action="allowDisbursement"]').show();
            break;
        case 'AWAITING_DISBURSEMENT':
            $('#singleActions a[data-action="disburse"]').show();
            break;
        case 'WITHDRAWN':
            break;
        case 'ACTIVE':
            break;
        case 'CLOSED':
            break;
        case 'CANCELED':
            break;
        case 'OVERPAID':
            break;
        default:
            break;
    }
};

// transactions
LoanHandler.prototype.displayTransactionsOfLoan = function (loan) {
    var $rowContainer = getRowContainer('#loanTransactionsTableContainer', LoanHandler.TRANSACTION_TITLES);
    var $table = $rowContainer.parent();
    var $tableContainer = $('#loanTransactionsTableContainer');
    $tableContainer.empty();

    var $table = getEmptyTable(true);
    $tableContainer.append($table);

    var $rowContainer = $table.find('thead');
    addRow($rowContainer, LoanHandler.TRANSACTION_TITLES);

    $rowContainer = $table.find('tbody');

    if (!exists(loan.transactionList)) {
        return;
    }

    var len = loan.transactionList.length;

    for (var i = 0; i < len; i++) {
        var transaction = loan.transactionList[i];
        var formattedRowData = LoanHandler.prototype.getTransactionsRowData(transaction);
        //addRow($rowContainer, formattedRowData, transaction, LoanHandler.self._transactionsRowClickHandler, transaction.transactionId);
        addRow($rowContainer, formattedRowData);
    }

    var tableSorter = getDefaultTableSorter();
    // TODO: this depends on the titles ...
    tableSorter.headers = {
        0: {sorter: 'awamoDateSorter'},
        1: {sorter: 'awamoCurrencySorter'},
        3: {sorter: 'awamoCurrencySorter'}
    };
    $table.tablesorter(tableSorter);

    showContent($tableContainer);
};

LoanHandler.prototype.getTransactionsRowData = function (transaction) {
    var rowdata = {};

    for (var key in LoanHandler.TRANSACTION_TITLES) {
        var formattedValue = transaction[key];

        switch (key) {
            case 'transactionDate':
                formattedValue = formatDate(formattedValue);
                break;
            case 'amount':
                formattedValue = formatCurrency(formattedValue) + ' ' + currencyCode;
                break;
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
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" event handling ">
LoanHandler.prototype.rowClickHandler = function (event) {
    $('#singleActions a').off('click touch');
    $('#singleActions a').on('click touch', LoanHandler.prototype.singleObjectActionHandler);

    $('#approveNo').off('click touch');
    $('#approveNo').on('click touch', LoanHandler.prototype.backToDisplayOneLoan);
    $('#rejectNo').off('click touch');
    $('#rejectNo').on('click touch', LoanHandler.prototype.backToDisplayOneLoan);

    $('#allowDisbursementNo').on('click touch', LoanHandler.prototype.backToDisplayOneLoan);
    $('#confirmContractSignedNo').on('click touch', LoanHandler.prototype.backToDisplayOneLoan);

    $('#approveYes').off('click touch');
    $('#approveYes').on('click touch', LoanHandler.prototype.approveApplication);
    $('#rejectYes').off('click touch');
    $('#rejectYes').on('click touch', LoanHandler.prototype.rejectApplication);

    $('#allowDisbursementYes').on('click touch', LoanHandler.prototype.allowDisbursement);
    $('#confirmContractSignedYes').on('click touch', LoanHandler.prototype.confirmContractSigned);

    LoanHandler.self.displayOneLoan($(this).data('object'));
};

LoanHandler.prototype.singleObjectActionHandler = function () {
    var action = $(this).data('action');
    if (action !== 'print') {
        hideContent();
    }

    switch (action) {
        case 'back':
            LoanHandler.self.previousPage();
            break;
        case 'resetChanges':
            $('#singleActions a[data-action="approveWithChanges"]').hide();
            $('#singleActions a[data-action="resetChanges"]').hide();
            $('#singleActions a[data-action="approve"]').show();
            LoanHandler.self.displayOneLoan(LoanHandler.self.loan);
            break;
        case 'approveWithChanges':
            LoanHandler.self.approveApplicationWithChanges();
            break;
        case 'approve':
            $('#approveApplication .panel-body .approvalObject').text('loan');
            showContent($('#approveApplication'));
            break;
        case 'reject':
            $('#rejectApplication .panel-body .rejectionObject').text('loan');
            $('#rejectionNote').val('');
            showContent($('#rejectApplication'));
            break;
        case 'allowDisbursement':
            $('#allowDisbursementLoanAmount').text(formatCurrency(LoanHandler.self.loan.principal) + ' ' + currencyCode);
            $('#allowDisbursementMandatorySavings').text('0 ' + currencyCode);
            $('#allowDisbursementOtherFees').text('0 ' + currencyCode);
            $('#allowDisbursementDisbursementAmount').text(formatCurrency(LoanHandler.self.loan.principal) + ' ' + currencyCode);
            showContent($('#allowDisbursement'));
            break;
        case 'confirmContractSigned':
            showContent($('#confirmContractSigned'));
            break;
        case 'disburse':
            Options.prototype.initLoanDisbursementPage();
            
            break;
        case 'close':
            // not used in loans
            break;
        case 'print':
            LoanHandler.self.printRepaymentSchedule(LoanHandler.self.loan);
            break;
        default:
            // noop
            break;
    }
};

LoanHandler.prototype.approveApplication = function () {
    LoanHandler.self.loan.status = 'APPROVED';
    ajax(LoanHandler.ROOT_PATH + LoanHandler.self.loan.loanId + '/approve', 'POST', LoanHandler.prototype.approveApplicationSuccessful);
    LoanHandler.self.previousPage();
};

LoanHandler.prototype.approveApplicationSuccessful = function () {
    LoanHandler.self.loan.status = 'APPROVED';
    loanList.put(loanList, LoanHandler.self.loan);
};

LoanHandler.prototype.approveApplicationWithChanges = function () {
    var changedLoan = {
        "loanId": LoanHandler.self.loan.loanId,
        "principal": unformatCurrency($('#principal').val()),
        "duration": $('#duration').val(),
        "amortizationType": $('#amortization').val(),
        "numberOfRepayments": $('#repayments').val(),
        "interestRate": unformatPercentage($('#interestRate').val()),
        "interestType": $('#interestType').val(),
        "interestCalculationPeriodType": $('#interestCalculationPeriodType').val()
    };
    ajax(LoanHandler.ROOT_PATH + 'modifyOnApproval', 'PUT',
            function () {
                LoanHandler.prototype.approveApplicationWithChangesSuccessful(changedLoan);
            },
            JSON.stringify(changedLoan));
    LoanHandler.self.previousPage();
};

LoanHandler.prototype.approveApplicationWithChangesSuccessful = function (changedLoan) {
    LoanHandler.self.loan.status = 'APPROVED_WITH_MODIFICATIONS';
    LoanHandler.self.loan.principal = changedLoan.principal;
    LoanHandler.self.loan.duration = changedLoan.duration;
    LoanHandler.self.loan.amortizationType = changedLoan.amortizationType;
    LoanHandler.self.loan.numberOfRepayments = changedLoan.numberOfRepayments;
    LoanHandler.self.loan.interestRate = changedLoan.interestRate;
    LoanHandler.self.loan.interestType = changedLoan.interestType;
    LoanHandler.self.loan.interestCalculationPeriodType = changedLoan.interestCalculationPeriodType;
    loanList.put(loanList, LoanHandler.self.loan);
};

LoanHandler.prototype.rejectApplication = function () {
    var uri = LoanHandler.ROOT_PATH + LoanHandler.self.loan.loanId + '/reject';
    var body = '{"note":"' + $('#rejectionNote').val() + '"}';
    ajax(uri, 'POST', LoanHandler.prototype.rejectApplicationSuccessful, body);
    LoanHandler.self.previousPage();
};

LoanHandler.prototype.rejectApplicationSuccessful = function () {
    LoanHandler.self.loan.status = 'REJECTED';
    loanList.put(loanList, LoanHandler.self.loan);
};

LoanHandler.prototype.confirmContractSigned = function () {
    var uri = LoanHandler.ROOT_PATH + LoanHandler.self.loan.loanId + '/confirmContractSigned';
    ajax(uri, 'POST', LoanHandler.prototype.confirmContractSignedSuccessful);
    LoanHandler.self.previousPage();
};

LoanHandler.prototype.confirmContractSignedSuccessful = function () {
    LoanHandler.self.loan.status = 'CONTRACT_SIGNED';
    loanList.put(loanList, LoanHandler.self.loan);
};

LoanHandler.prototype.allowDisbursement = function () {
    var uri = LoanHandler.ROOT_PATH + LoanHandler.self.loan.loanId + '/allowDisbursement';
    ajax(uri, 'POST', LoanHandler.prototype.allowDisbursementSuccessful);
    LoanHandler.self.previousPage();
};

LoanHandler.prototype.allowDisbursementSuccessful = function () {
    LoanHandler.self.loan.status = 'AWAITING_DISBURSEMENT';
    loanList.put(loanList, LoanHandler.self.loan);
};

LoanHandler.prototype.backToDisplayOneLoan = function () {
    LoanHandler.self.displayOneLoan(LoanHandler.self.loan);
};

LoanHandler.prototype.dataChangedHandler = function () {
    $('#singleActions a[data-action="approveWithChanges"]').show();
    $('#singleActions a[data-action="resetChanges"]').show();
    $('#singleActions a[data-action="approve"]').hide();
};

LoanHandler.prototype.dataModelChanged = function () {
    // noop
};

LoanHandler.prototype.loanEntityChanged = function (object, type) {
    switch (type) {
        case eventtype.CREATE:
        case eventtype.UPDATE:
            LoanHandler.self.outputLoan(object);
            break;
        case eventtype.DELETE:
            // TODO
            console.log('not yet implemented: loan entity [' + object.mainId + '] deleted');
            break;
        default:
            break;
    }
};

LoanHandler.prototype.clientEntityChanged = function (object, type) {
    switch (type) {
        case eventtype.CREATE:
            // TODO
            console.log('not yet implemented: client entity created');
            break;
        case eventtype.UPDATE:
            console.log('not yet implemented: client entity updated');
            // TODO
            break;
        case eventtype.DELETE:
            console.log('not yet implemented: client entity [' + object.mainId + '] deleted');
            // TODO
            break;
        default:
            break;
    }
};

LoanHandler.prototype.notifyClientListChanged = function (client) {
    // TODO, update table column 2 (image), when it has been loaded lazily
};

LoanHandler.prototype.printRepaymentSchedule = function (loan) {
// TODO: needs more work when spanning over more than one page

    var date = formatLocalDate(new Date());
    var header = '\n\
    <p style="text-align: right; width: 100%;">awamo360 Cockpit - ' + date + '</p>\n\
';

    var loanDetails = '<br>\n\<br>\n\
        <table>\n\
            <thead>\n\
                <tr>\n\
                    <th colspan="5" style="text-align: left;">\n\
                        Loan #' + loan.loanId + '\n\
                    </th>\n\
                </tr>\n\
            </thead>\n\
            <tbody>\n\
                <tr>\n\
                    <td>Client name</td>\n\
                    <td style="width: 616px; text-align: left;">' + loan.ownerName + '</td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Status</td>\n\
                    <td style="width: 616px; text-align: left;">' + loan.status + '</td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Interest rate p.a.</td>\n\
                    <td style="width: 616px; text-align: left;">' + formatPercentage(loan.interestRate) + ' %</td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Principal</td>\n\
                    <td style="width: 616px; text-align: left;">' + formatCurrency(loan.principal) + ' ' + currencyCode + '</td>\n\
                </tr>\n\
            </tbody>\n\
        </table>\n\
';
    var repaymentSchedule = $('#repaymentScheduleTableContainer').html();
    var $repaymentSchedule = $(repaymentSchedule).clone();
    $repaymentSchedule.find("tr:nth-child(2)").remove();
    $repaymentSchedule.find("td:nth-child(2)").css('font-weight', 'bold');

    var $lastCells = $repaymentSchedule.find("td:last-child");
    $.each($lastCells, function (cell) {
        var $cell = $($lastCells[cell]);
        var lastCellValue = $cell.text();
        if (!lastCellValue.startsWith('0')) {
            $cell.text('-' + lastCellValue);
        }
    });

    $repaymentSchedule.find('thead').prepend($('<tr>\n<th colspan="5" style="text-align: left;">Loan repayment schedule</th>\n</tr>\n'));
    repaymentSchedule = '<br><br><table>' + $repaymentSchedule.html() + '</table>\n';

    var myWindow = window.open("", "print repayment schedule", "width=800,height=1200", true);

    var css = '\n\
div {\n\
    width: 100%;\n\
    height: 95%;\n\
    margin-top: 20px;\n\
}\n\
\n\
table {\n\
    display: blocK;\n\
    margin-left: auto;\n\
    margin-right: auto;\n\
    border-collapse: collapse;\n\
    width: 770px;\n\
}\n\
\n\
table, th, td {\n\
    border: 1px solid black;\n\
    padding-left: 10px;\n\
    padding-right: 10px;\n\
    text-align: right;\n\
}\n\
\n\
td {\n\
    width: 154px;\n\
}\n\
\n\
button {\n\
    background-color: #ffc266;\n\
    border-color: #ffc266;\n\
    color: #333333;\n\
    outline: none;\n\
    outline-color: transparent;\n\
    text-decoration: none;\n\
    line-height: 20px;\n\
    padding: 15px 10px;\n\
    font-size: 14px;\n\
    font-weight: 400;\n\
    text-align: center;\n\
    border: 1px solid transparent;\n\
    border-radius: 4px;\n\
}\n\
\n\
button:hover {\n\
    background-color: #ff9900;\n\
    border-color: #ff9900;\n\
}\n\
\n\
@media print {\n\
    button {\n\
        display: none;\n\
    }\n\
}\n\
';
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    var printButton = '<br>\n<br>\n<button onClick="window.print();">Print repayment schedule</button>\n';
    var html = '<div class="content">' + header + loanDetails + repaymentSchedule + printButton + '</div>';

    myWindow.document.head.appendChild(style);
    $(myWindow.document.body).html(html);
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" other ">
LoanHandler.prototype.loanStatusFilter = function (status) {
    return function (loan) {
        return loan.status === status;
    };
};

LoanHandler.prototype.synchronizeNow = function () {
    loanList.reload();
};

LoanHandler.prototype.sendEmailLoanReportRequest = function () {
    // not using default ajax call here because user handling is done against a different endpoint
    var headers = {
        tenantId: tenantId
    };

    var uri = '/tenant/v1d/mis/reportEmail';
    var body = '{"startTime":"' + '0' +
            '","endTime":"' + '0' +
            '","reportEmailEntity":"' + "LOAN" +
            '","reportEmailType":"' + "ALL" +
            '","email":"' + $('#emailReportC').val() +
            '"}';
    ajax(uri, 'POST', LoanHandler.prototype.emailReportResponseHandler, body, headers, LoanHandler.prototype.emailReportFailedResponseHandler);

};

LoanHandler.prototype.emailReportResponseHandler = function (response) {
    message('Success',
            'Message Sent Successfully',
            MessageType.SUCCESS);
};

LoanHandler.prototype.emailReportFailedResponseHandler = function (response) {
    message('Error', response.responseJSON.message, MessageType.WARNING);
};


// </editor-fold>

function refreshDialer() {
    //alert("In function");
    var container = document.getElementById("loanClientImageID");
    var content = container.innerHTML;
    //alert(content);
    container.innerHTML = content;
}

LoanHandler.prototype.isPrePaid = function (loan) {

    if (!exists(loan) || !exists(loan.repaymentSchedule) || !exists(loan.repaymentSchedule.rows)) {
        console.log('no repaymentSchedule found on this loan');
        console.log(loan);
        console.log('---------------------------');
        return;
    }
    if (!exists(loan.transactionList)) {
        return;
    }
    //get current balance
    var lentransactionList = loan.transactionList.length;
    if (loan.transactionList.length > 0) {
        var transaction = loan.transactionList[0];
        var currentBalance = transaction['balance'];
    } else {
        false;
    }
    for (var i = 0; i < lentransactionList; i++) {
        var transaction = loan.transactionList[i];
        if (currentBalance > transaction['balance']) {
            var currentBalance = transaction['balance'];
        }
    }
    //get required balance
    var currentDate = new Date().getTime();
    var requiredBalance = loan.principal;
    var rows = loan.repaymentSchedule.rows;
    var len = rows.length;
    for (var i = 0; i < len; i++) {
        if (rows[i]['dueDate'] < currentDate) {
            if (rows[i]['balance'] < requiredBalance) {
                requiredBalance = rows[i]['balance'];
            }
        }
    }
    //decide
    if (currentBalance < requiredBalance) {
        return true;
    } else {
        return false;
    }
};

LoanHandler.prototype.fullyRepaid = function (loan) {

    if (!exists(loan.transactionList)) {
        return;
    }
    //get current balance
    for (var i = 0; i < loan.transactionList.length; i++) {
        var transaction = loan.transactionList[i];
        if (transaction['balance'] <= 0) {
            if (transaction['transactionDate'] < toLoanEndDateDateLimit && transaction['transactionDate'] > fromLoanEndDateDateLimit) {
                return true;
            }
        }
    }
    return false;
};

LoanHandler.prototype.getTotalRepayments = function (loan) {

    if (!exists(loan.transactionList)) {
        return 0;
    }
    //get current balance
    var total = 0;
    for (var i = 0; i < loan.transactionList.length; i++) {
        var transaction = loan.transactionList[i];
        if (transaction['transactionType'] === 'REPAYMENT') {
            total = total + transaction['amount'];
        }
    }
    return total;
};

LoanHandler.prototype.getExpectedEndDate = function (loan) {

    if (!exists(loan) || !exists(loan.repaymentSchedule) || !exists(loan.repaymentSchedule.rows)) {
        console.log('no repaymentSchedule found on this loan');
        console.log(loan);
        console.log('---------------------------');
        return;
    }

    var rows = loan.repaymentSchedule.rows;
    var len = rows.length;
    for (var i = 0; i < len; i++) {
        if (rows[i]['balance'] === 0) {
            return rows[i]['dueDate'];
        }
    }
};

LoanHandler.prototype.hasPayment = function (loan) {

    if (!exists(loan) || !exists(loan.repaymentSchedule) || !exists(loan.repaymentSchedule.rows)) {
        console.log('no repaymentSchedule found on this loan');
        console.log(loan);
        console.log('---------------------------');
        return;
    }

    var rows = loan.repaymentSchedule.rows;
    var len = rows.length;
    for (var i = 0; i < len; i++) {
        if (rows[i]['dueDate'] < toRepaymentDateLimit && rows[i]['dueDate'] > fromRepaymentDateLimit) {
            return true;
        }
    }
    return false;
};

LoanHandler.prototype.getEndDate = function (loan) {

    if (!exists(loan.transactionList)) {
        return;
    }
    //get current balance
    for (var i = 0; i < loan.transactionList.length; i++) {
        var transaction = loan.transactionList[i];
        if (transaction['balance'] <= 0) {

            return transaction['transactionDate'];

        }
    }
    return '---';
};


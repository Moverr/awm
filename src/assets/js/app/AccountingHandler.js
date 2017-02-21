/* global accountList, MessageType, tableSorter, currencyCode */

var AccountingHandler = function() {
    AccountingHandler.self = this;
    
    $('#singleActions a').off('click touch');
    $('#singleActions a').on('click touch', AccountingHandler.prototype.singleObjectActionHandler);
    
    this.commandStack = [];
    this.argumentStack = [];
};

// ------------------------------------------------------------------
// move this to the AbstractHandler (which does not yet exist)
AccountingHandler.prototype.stack = function(command, arguments) {
    AccountingHandler.self.commandStack.push(command);
    AccountingHandler.self.argumentStack.push(arguments); // TODO: don't know if this works if it is undefined ...
};

AccountingHandler.prototype.back = function() {
    AccountingHandler.self.commandStack.pop()(AccountingHandler.self.argumentStack.pop());
};
// ------------------------------------------------------------------

AccountingHandler.GL_TYPES = {
    balanceSheet: ['ASSETS','LIABILITIES','EQUITY'],
    incomeStatement: ['INCOME', 'EXPENSE']
};

AccountingHandler.JOURNAL_TITLES = {
    glAccountType: 'Type',
    accountName: 'Name',
    creditValue: 'Credit',
    debitValue: 'Debit',
    entityType: 'Entity',
    transactionDate: 'Date'
};

AccountingHandler.REPORT_SUM_TITLES = {
    type: 'Type',
    name: 'Name',
    balance: 'Balance'
};

AccountingHandler.CHART_OF_ACCOUNTS_TITLES = {
    code: 'GL Code',
    name: 'Name',
    balance: 'Balance'
};

AccountingHandler.HEADER_ACCOUNTS = [
    { glCode: '1000', name: 'Assets' },
    { glCode: '2000', name: 'Liabilities' },
    { glCode: '3000', name: 'Equity' },
    { glCode: '4000', name: 'Revenues' },
    { glCode: '5000', name: 'Expenses' }
];

AccountingHandler.BALANCE_SHEET_TITLES = {
    name: 'Name',
    balance: 'Balance'
};

AccountingHandler.BALANCE_SHEET_EXPAND_GL_CODES = [
    '1300', '1600', '3200', '3300',
    '4100', '5100', '5200', '5400'
];

/* external */
AccountingHandler.prototype.overview = function() {
    addHistory('Accounting overview', '#accountingOverview', '#accounting');
    initDefaultContent('Accounting');
    currentTable = 'accounting';
    var $rowContainer = getDefaultRowContainer({ type: 'Items available' });

    addRow($rowContainer, { type: 'Chart of accounts'/*, number: 1*/ }, 'Accounting', AccountingHandler.self.overviewRowClickHandler, 'chartOfAccounts');
    addRow($rowContainer, { type: 'New account entry'/*, number: 1*/ }, 'Accounting', AccountingHandler.self.overviewRowClickHandler, 'create');
    addRow($rowContainer, { type: 'Balance sheet'/*, number: 1*/ }, 'Accounting', AccountingHandler.self.overviewRowClickHandler, 'balanceSheet');
    addRow($rowContainer, { type: 'Income statement'/*, number: 1*/ }, 'Accounting', AccountingHandler.self.overviewRowClickHandler, 'incomeStatement');
    addRow($rowContainer, { type: 'General ledger account'/*, number: 1*/ }, 'Accounting', AccountingHandler.self.overviewRowClickHandler, 'generalLedgerAccount');
};

AccountingHandler.prototype.overviewRowClickHandler = function() {
    var action = $(this).data('id');
    var handler = $(this).data('object');
    $('li[data-parent~="accounting"][data-handler="' + handler + '"][data-action~="' + action + '"] a').click();
};

AccountingHandler.prototype.create = function() {
    addHistory('create accounting entry', '#createAccountingEntry', getSidebarSubitemSelector('accounting', 'Accounting', 'create'));
    initDefaultContent('Accounting');
    var $debit = $('div[data-type="debit"] select');
    var $credit = $('div[data-type="credit"] select');
    accountList
        .getEntities()
        .filter(function(account) {
            return parseInt(account.glCode) % 100 !== 0;
        })
        .forEach(function(account) {
            $debit.append($('<option value="' + account.accountId + '">' + account.name + ' (' + account.glCode + ')' +'</option>'));
            $credit.append($('<option value="' + account.accountId + '">' + account.name + ' (' + account.glCode + ')' +'</option>'));
        });
    
    $('#glAccountPanel div[data-type="debit"] button').on('click touch', AccountingHandler.prototype.createAccountBlockHandler);
    $('#glAccountPanel div[data-type="credit"] button').on('click touch', AccountingHandler.prototype.createAccountBlockHandler);
    $('#glAccountApplicationForm').on('submit', AccountingHandler.prototype.submitHandler);

    $('#glAccountTransactionDatePicker').datetimepicker({
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 1,
        pickerPosition: 'bottom-center',
        keyboardNavigation: 0
    });
    $('#glAccountTransactionDatePicker').datetimepicker('setValue'); // show "today" in input field
    
    showContent($('#glAccountTransaction'));
};

AccountingHandler.prototype.rowClickHandler = function() {
    var glAccount = $(this).data('object');
    
    // hide all content
    hideContent();
    
    // header
    $('.navbar-content').show();
    $('h3.page-header').text('GL Account "' + glAccount.name + '"');
    $('h3.page-header').show();
    $('h4.sub-header').hide();

    // fill table
    AccountingHandler.self.displayJournal(glAccount.journal);
    
    // actions
    $('#singleActions a[data-action]').hide();
    $('#singleActions a[data-action="back"]').show();

    // show necessary content
    showContent($('#singleActions'));
    showContent($('#glAccount'));
};

AccountingHandler.prototype.adjustSingleActionsByStatus = function (status) {
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

AccountingHandler.prototype.singleObjectActionHandler = function (event) {
    event.preventDefault();
    hideContent();

    switch ($(this).data('action')) {
        case 'back':
            AccountingHandler.self.back();
            break;
        default:
            // noop
            break;
    }
};

AccountingHandler.prototype.displayJournal = function (journal) {
    var $rowContainer = getRowContainer('#glAccountJournalTableContainer', AccountingHandler.JOURNAL_TITLES);
    var $table= $rowContainer.parent();
    
    if (!exists(journal)) {
        return;
    }

    var len = journal.length;
    for (var i = 0; i < len; i++) {
        var journalEntry = journal[i];
        var formattedRowData = AccountingHandler.prototype.getJournalEntryData(journalEntry);
        addRow($rowContainer, formattedRowData, journalEntry);
    }
    
    addClassToTableColumn($table, 2, 'currency');
    addClassToTableColumn($table, 3, 'currency');
    
    var tableSorter = getDefaultTableSorter();
    var els = document.getElementById("glAccountJournalTableContainer").getElementsByTagName("table");
    for (var i = 0; i < els.length; i++) {
        els[i].style.textAlign = "right";
    }
    // TODO: this depends on the titles ...
    tableSorter.headers = {
        2: { sorter: 'awamoCurrencySorter' },
        3: { sorter: 'awamoCurrencySorter' },
        5: { sorter: 'awamoDateSorter' }
    };
    $table.tablesorter(tableSorter);
};

AccountingHandler.prototype.getJournalEntryData = function (journalEntry) {
    var rowdata = {};
    var account = accountList.getById(journalEntry['accountId']);

    for (var key in AccountingHandler.JOURNAL_TITLES) {
        var formattedValue = journalEntry[key];
        
        switch (key) {
            case 'glAccountType':
                formattedValue = account.type;
                break;
            case 'accountName':
                formattedValue = account.name;
                break;
            case 'creditValue':
                if (journalEntry['entryType'] === 'CREDIT') {
                    formattedValue = formatCurrency(journalEntry['value']) + ' ' + currencyCode;
                } else {
                    formattedValue = '';
                }
                break;
            case 'debitValue':
                if (journalEntry['entryType'] === 'DEBIT') {
                    formattedValue = formatCurrency(journalEntry['value']) + ' ' + currencyCode;
                } else {
                    formattedValue = '';
                }
                break;
            case 'transactionDate':
                formattedValue = formatDate(formattedValue);
                break;
            default:
                break;
        }
        
        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

AccountingHandler.prototype.createAccountBlockHandler = function () {
    var $buttonBlock = $(this).parent().parent();
    
    if ($buttonBlock.find('span').hasClass('glyphicon-plus')) {
        var $block = $buttonBlock.clone();

        $buttonBlock.find('span').removeClass('glyphicon-plus').addClass('glyphicon-minus');

        $block.find('label').text('');
        $block.find('select')[0].selectedIndex = 0; 
        $block.find('input').val('');
        $block.find('button').on('click touch', AccountingHandler.prototype.createAccountBlockHandler);

        $buttonBlock.after($block);
    } else if ($buttonBlock.find('span').hasClass('glyphicon-minus')) {
        $buttonBlock.remove();
    }
};

AccountingHandler.prototype.submitHandler = function(event) {
    event.preventDefault();
    
    var $debits = $('div[data-type="debit"]');
    var $credits = $('div[data-type="credit"]');
    
    var debits = [];
    var credits = [];
    
    $debits.each(function() {
        debits.push({
            glAccountId: parseInt($(this).find('select').val()),
            amount: parseFloat($(this).find('input').val()) * 100
        });
    });
    $credits.each(function() {
        credits.push({
            glAccountId: parseInt($(this).find('select').val()),
            amount: parseFloat($(this).find('input').val()) * 100
        });
    });
    
    var accountingTransaction = {
        transactionDate: new Date($('#transactionDate').val()).getTime(),
        comments: $('#accountingComment').text(),
        debits: debits,
        credits: credits
    };
    
    ajax(accountList.rootPath + 'journal', 'POST', function(idContainer) {
        // update account with new journal entries
        ajax(accountList.rootPath + 'transactions/?transactionId=' + idContainer.id, 'GET', accountList.addJournalEntries);
        
        // clean up form
        console.log($('#glAccountPanel').find('.row'));
        $('#glAccountPanel .row').each(function() {
            $(this)
                .find('.form-group')
                .not(':first')
                .remove();
        });
        $('#glAccountPanel .row .form-group').find('select,input').val('');
        
        // go back to overview
        $('li.subitem[data-handler="Accounting"][data-action="chartOfAccounts"] a').click();
    }, JSON.stringify(accountingTransaction), undefined, function(response) {
        message('Error', response.responseJSON.message, MessageType.WARNING);
    });
};

AccountingHandler.prototype._sumOfJournal = function(account) {
    if (!exists(account.journal)) {
        return 0;
    }
    
    return account.journal.reduce(function(sum, journalEntry) {
        if (journalEntry.entryType === 'CREDIT') {
            return sum + journalEntry.value;
        } else if (journalEntry.entryType === 'DEBIT') {
            return sum - journalEntry.value;
        } else {
            return sum;
        }
    }, 0);
};

AccountingHandler.prototype.chartOfAccounts = function() {
    addHistory('chart of accounts', '#chartOfAccounts', getSidebarSubitemSelector('accounting', 'Accounting', 'chartOfAccounts'));
    initDefaultContent('Chart of accounts');
    AccountingHandler.self.stack(AccountingHandler.prototype.chartOfAccounts);
    var $rowContainer = getDefaultRowContainer(AccountingHandler.CHART_OF_ACCOUNTS_TITLES);
    
    accountList
        .getEntities()
        .concat(AccountingHandler.HEADER_ACCOUNTS)
        .sort(function(one, other) { return one.glCode - other.glCode; })
        .forEach(function(account){
            addRow(
                $rowContainer,
                AccountingHandler.prototype.getChartOfAccountsSheetRowData(account),
                account,
                AccountingHandler.self.rowClickHandler,
                account.accountId);
        });

    addClassToDefaultTableColumn(3, 'currency');
    showContent($('#glAccount'));
};

AccountingHandler.prototype.getChartOfAccountsSheetRowData = function(account) {
    var rowdata = {};

    for (var key in AccountingHandler.CHART_OF_ACCOUNTS_TITLES) {
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

AccountingHandler.prototype.balanceSheet = function() {
    addHistory('balance sheet', '#balanceSheet', getSidebarSubitemSelector('accounting', 'Accounting', 'balanceSheet'));
    initDefaultContent('Balance sheet');
    AccountingHandler.self.stack(AccountingHandler.prototype.balanceSheet);
    var balanceSheet = accountList.getBalanceSheet();
    var $tableContainer = $('#balanceSheetTableContainer');
    $tableContainer.empty();
    var len = AccountingHandler.GL_TYPES.balanceSheet.length;
    var $table;
    var $rowContainer;
    var $row;
    var totalBalance;
    
    for (var i = 0; i < len; i++) {
        $table = getEmptyTable(false);
        $rowContainer = $table.find('thead');
        addRow($rowContainer, [AccountingHandler.GL_TYPES.balanceSheet[i], 'Balance']);
        $rowContainer = $table.find('tbody');
        var subRoot = balanceSheet.root.children[i];
        totalBalance = 0;
        
        subRoot.children.forEach(function(child) {
            totalBalance += child.balance();
            AccountingHandler.self.addRowForNode(child, $rowContainer, 0);
        });
        
        $row = addRow($rowContainer, { name: 'Total ' + capitalize(AccountingHandler.GL_TYPES.balanceSheet[i]), balance: formatCurrency(totalBalance) + ' ' + currencyCode });
        $row.addClass('total');

        addClassToTableColumn($table, 1, 'currency');
        $tableContainer.append($table);
    }
    
    totalBalance =
        balanceSheet.root.getChildByGLCode('2000').balance() +
        balanceSheet.root.getChildByGLCode('3000').balance();
    
    $row = addRow($rowContainer, { name: 'Total Liabilities + Equity', balance: formatCurrency(totalBalance) + ' ' + currencyCode });
    $row.addClass('total');
    addClassToTableColumn($table, 1, 'currency');
    
    showContent($tableContainer);
};

AccountingHandler.prototype.addRowForNode = function(node, $rowContainer, indent) {
    addRow(
        $rowContainer,
        AccountingHandler.self.getAccountingRowData(node, indent),
        node.account,
        AccountingHandler.self.rowClickHandler,
        node.account.accountId);
    
    if (AccountingHandler.BALANCE_SHEET_EXPAND_GL_CODES.includes(node.account.glCode)) {
        node.children.forEach(function(child) {
            AccountingHandler.self.addRowForNode(child, $rowContainer, indent + 1);
        });
    }
};

AccountingHandler.prototype.incomeStatement = function() {
    addHistory('income statement', '#incomeStatement', getSidebarSubitemSelector('accounting', 'Accounting', 'incomeStatement'));
    initDefaultContent('Income statement');
    AccountingHandler.self.stack(AccountingHandler.prototype.incomeStatement);
    var balanceSheet = accountList.getBalanceSheet();
    var $tableContainer = $('#balanceSheetTableContainer');
    $tableContainer.empty();
    
    var $table = getEmptyTable(false);
    var $rowContainer;
    var $row;
    var totalBalance;
    var subRoot;
    
    $rowContainer = $table.find('thead');
    addRow($rowContainer, ['Income Statement', '']);
    $rowContainer = $table.find('tbody');
    
    var netFinancialIncome = 0;
    
    /* ********************************************************************** */
    
    subRoot = balanceSheet.root.getChildByGLCode('4000');
    $row = addRow($rowContainer, ['Financial Revenue', '']);
    totalBalance = 0;
    subRoot.children.forEach(function (child) {
        if (child.account.glCode < "4500") {
            totalBalance += child.balance();
            AccountingHandler.self.addRowForNode(child, $rowContainer, 1);
        }
    });
    $row.find('td:last-child').html(formatCurrency(totalBalance) + ' ' + currencyCode);
    $row.addClass('incomeStatementMainRow');
    netFinancialIncome += totalBalance;
    
    /* ********************************************************************** */
    
    subRoot = balanceSheet.root.getChildByGLCode('5000');
    $row = addRow($rowContainer, ['Financial Expense', '']);
    totalBalance = 0;
    subRoot.children.forEach(function (child) {
        if (child.account.glCode < "5200") {
            totalBalance += child.balance();
            AccountingHandler.self.addRowForNode(child, $rowContainer, 1);
        }
    });
    $row.find('td:last-child').html(formatCurrency(totalBalance) + ' ' + currencyCode);
    $row.addClass('incomeStatementMainRow');
    netFinancialIncome -= totalBalance;
    
    /* ********************************************************************** */
    
    var netOperatingIncome = netFinancialIncome;
    
    $row = addRow($rowContainer, ['Net Financial Income', formatCurrency(netFinancialIncome) + ' ' + currencyCode]);
    totalBalance = 0;
    subRoot.children.forEach(function (child) {
        if (child.account.glCode > "5199" && child.account.glCode < "5300") {
            totalBalance += child.balance();
            AccountingHandler.self.addRowForNode(child, $rowContainer, 1);
        }
    });
    $row.addClass('incomeStatementMainRow');
    
    netOperatingIncome -= totalBalance;
    
    /* ********************************************************************** */

    $row = addRow($rowContainer, ['OPERATING EXPENSES', '']);
    totalBalance = 0;
    subRoot.children.forEach(function (child) {
        if (child.account.glCode > "5299" && child.account.glCode < "5600") {
            totalBalance += child.balance();
            AccountingHandler.self.addRowForNode(child, $rowContainer, 1);
        }
    });
    $row.find('td:last-child').html(formatCurrency(totalBalance) + ' ' + currencyCode);
    $row.addClass('incomeStatementMainRow');
    netOperatingIncome -= totalBalance;
    
    /* ********************************************************************** */
    
    $row = addRow($rowContainer, ['Net Operating Income', formatCurrency(netOperatingIncome) + ' ' + currencyCode]);
    $row.addClass('incomeStatementMainRow');
    
    /* ********************************************************************** */
    
    totalBalance =
            balanceSheet.root.getChildByGLCode('4500').balance() -
            balanceSheet.root.getChildByGLCode('5600').balance();
            
    $row = addRow($rowContainer, ['Net Nonoperating Income/(Expense)', formatCurrency(totalBalance) + ' ' + currencyCode]);
    $row.addClass('incomeStatementMainRow');
    
    /* ********************************************************************** */
    
    totalBalance = netOperatingIncome + totalBalance;
    
    var taxes = balanceSheet.root.getChildByGLCode('5900');
    $row = addRow($rowContainer, ['Net Income (Before Taxes and Donations)', formatCurrency(totalBalance) + ' ' + currencyCode]);
    AccountingHandler.self.addRowForNode(taxes, $rowContainer, 1);
    $row.addClass('incomeStatementMainRow');
    
    /* ********************************************************************** */
    
    totalBalance = totalBalance - taxes.balance();
    
    var donations = balanceSheet.root.getChildByGLCode('4600');
    $row = addRow($rowContainer, ['Net Income (After Taxes and Before donations)', formatCurrency(totalBalance) + ' ' + currencyCode]);
    AccountingHandler.self.addRowForNode(donations, $rowContainer, 1);
    $row.addClass('incomeStatementMainRow');
    
    /* ********************************************************************** */
    
    totalBalance = totalBalance + donations.balance();
            
    $row = addRow($rowContainer, ['Net Income (After Taxes and Donations)', formatCurrency(totalBalance) + ' ' + currencyCode]);
    $row.addClass('incomeStatementMainRow');
    
    /* ********************************************************************** */
    
    addClassToTableColumn($table, 1, 'currency');
    $tableContainer.append($table);
    showContent($tableContainer);
};

AccountingHandler.prototype.getAccountingRowData = function(node, indent) {
    var indentation = '';
    var rowdata = {};
    
    if (node.account.glCode === "5130") {
        indent -= 1;
    }
    
    for (var i = 0; i < indent; i++) {
        indentation += '&emsp;&emsp;&emsp;&emsp;';
    }
    
    for (var key in AccountingHandler.BALANCE_SHEET_TITLES) {
        var formattedValue;
        
        switch (key) {
            case 'name':
                formattedValue = indentation + node.account.name + ' (' + node.account.glCode + ')';
                break;
            case 'balance':
                formattedValue = formatCurrency(node.balance()) + ' ' + currencyCode;
                break;
            default:
                break;
        }
        
        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

AccountingHandler.prototype.generalLedgerAccount = function() {
    addHistory('general ledger account', '#generalLedgerAccount', getSidebarSubitemSelector('accounting', 'Accounting', 'generalLedgerAccount'));
    initDefaultContent('General ledger account');

    // fill table
    var journal = [];
    accountList.getEntities().forEach(function(account) {
        journal = journal.concat(account.journal);
    });
    AccountingHandler.self.displayJournal(journal);
    
    // show necessary content
    showContent($('#glAccount'));
};

/* global handlers, parseFloat, loanList, clientList, savingsAccountList */

var ManagementHandler = function() {
    ManagementHandler.self = this;
    loanList.addDataModelChangedEventListenerCallback(ManagementHandler.prototype._dataModelChanged);
    savingsAccountList.addDataModelChangedEventListenerCallback(ManagementHandler.prototype._dataModelChanged);
};

/* external */
ManagementHandler.prototype.overview = function() {
    hideContent();
    $('h3.page-header').text('Management');
    $('h3.page-header').show();
    $('h4.sub-header').hide();
    
    currentTable = 'management';
    
    var $tableContainer = $('#defaultTableContainer');
    $tableContainer.show();

    var $table = $tableContainer.find('table');
    var $rowContainer = $table.find('thead');
    $rowContainer.empty();
    addRow($rowContainer, { type: 'Type', number: 'Number'});

    $rowContainer = $table.find('tbody');
    $rowContainer.empty();
    
//    var loansNumber = loanList.getTotalCount();
//    var clientsNumber = clientList.getTotalCount();
//    var savingsAccountsNumber = savingsAccountList.getTotalCount();
//    
//    addRow($rowContainer, { type: 'Loans', number: '<span data-counter="' + loansNumber + '" data-counterkey="allLoans">' + loansNumber + '</span>' }, 'Loan', ManagementHandler.self.rowClickHandler);
//    addRow($rowContainer, { type: 'Clients', number: '<span data-counter="' + clientsNumber + '" data-counterkey="allClients">' + clientsNumber + '</span>' }, 'Client', ManagementHandler.self.rowClickHandler);
//    addRow($rowContainer, { type: 'Savings accounts', number: '<span data-counter="' + savingsAccountsNumber + '" data-counterkey="allSavingsAccounts">' + savingsAccountsNumber + '</span>' }, 'SavingsAccount', ManagementHandler.self.rowClickHandler);
};

ManagementHandler.prototype.rowClickHandler = function() {
    var $counterSpan = $(this).find('td span');
    var counterKey = $counterSpan.data('counterkey');
    var scope = counterKey.split(/(?=[A-Z])/)[0].capitalizeFirstLetter();
    var handler = $(this).data('object');
    $('li[data-parent~="management"][data-handler="' + handler + '"][data-action~="get' + scope + '"] a').click();
};

ManagementHandler.prototype._dataModelChanged = function(object) {
    
};

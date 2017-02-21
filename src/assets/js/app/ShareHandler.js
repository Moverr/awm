/* global shareList, clientList, savingsAccountList, MessageType, currencyCode */

var ShareHandler = function() {
    ShareHandler.self = this;
    
    this.commandStack = [];
    this.argumentStack = [];
    
    $('#singleActions a').off('click touch');
    $('#singleActions a').on('click touch', ShareHandler.prototype.singleObjectActionHandler);
};

ShareHandler.APPLICATION_TITLES = {
    clientName: 'Client name',
    numberOfShares: 'Number of shares',
    valueOfShares: 'Value of shares'
};

ShareHandler.CURRENT_MARKET_PRICE = 50000;

// <editor-fold defaultstate="collapsed" desc=" submit applications ">
ShareHandler.prototype.purchaseApplication = function() {
    ShareHandler.self.transactionApplication('purchase');
};

ShareHandler.prototype.fillClientList = function() {
    var $clientSelect = $('#shareClient');
    $clientSelect.find('option').not(':first').remove();
    clientList
            .getEntities()
            .filter(function (client) {
                return savingsAccountList.getByClient(client.awamoId).length > 0;
            })
            .sort(function (one, other) {
                return one.fullname > other.fullname;
            })
            .forEach(function (client) {
                $clientSelect.append($('<option value="' + client.awamoId + '">' + client.fullname + '</option>'));
            });
};

ShareHandler.prototype.transactionApplication = function(transactionType) {
    ShareHandler.self.stack(ShareHandler.prototype.transactionApplication);
    ShareHandler.self.shareApplication = null;
    initDefaultContent(transactionType + ' share');
    var $clientSelect = $('#shareClient');
    var $savingsAccountSelect = $('#shareSavingsAccount');
    
    ShareHandler.self.fillClientList();
    $clientSelect.off('input');
    $clientSelect.on('input', function() {
        $savingsAccountSelect.find('option').not(':first').remove();
        savingsAccountList
                .getByClient($(this).val())
                .filter(function (savingsAccount) {
                    return savingsAccount.status === 'ACTIVE';
                })
                .forEach(function(savingsAccount) {
                    $savingsAccountSelect.append($('<option value="' + savingsAccount.accountId + '">' + savingsAccount.accountNo + '</option>'));
                });
    });
    
    $('#shareCount').off('input');
    $('#shareCount').on('input', function() {
        var value = Math.round(Math.abs($(this).val()));
        if (value === 0) {
            $('#singleActions a[data-action="purchase"]').text(transactionType);
        } else {
            $('#singleActions a[data-action="purchase"]').text(transactionType + ' ' + value + ' share' + (value ===  1 ? '' : 's') + ' for ' + formatCurrency(value * ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode);
        }
    });
    $('#shareCount').next('.input-group-addon').text(formatCurrency(ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode + ' each');

    $('#shareApplicationForm').data('transactionType', transactionType);
    $('#shareApplicationForm').off('submit');
    $('#shareApplicationForm').on('submit', ShareHandler.prototype.submitTransactionApplicationHandler);

    $('#sharePurchaseDatePicker').datetimepicker({
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
    $('#sharePurchaseDatePicker').datetimepicker('setValue'); // show "today" in input field
    ShareHandler.self.showActionButtons();
    
    showContent($('#shareApplication'));
};

ShareHandler.prototype.submitTransactionApplicationHandler = function(event) {
    if (exists(event)) {
        event.preventDefault();
    }
    
    var numberOfShares = Math.round(Math.abs($('#shareCount').val()));
    var shareTransaction = {
        transactionDate: new Date($('#sharePurchaseDate').val()).getTime(),
        clientAwamoId: $('#shareClient').val(),
        savingsAccountId: $('#shareSavingsAccount').val(),
        requestedShares: numberOfShares,
        submittedDate: new Date().getTime(),
        transactionType: $('#shareApplicationForm').data('transactionType').toUpperCase()
    };
    
    ajax(shareList.rootPath, 'POST', function(response) {
        message('Success',
            'successfully submitted application for purchase of ' + numberOfShares + ' share' + (numberOfShares ===  1 ? '' : 's') + ' for ' + (numberOfShares * ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode,
            MessageType.SUCCESS);
            
        $('#sharePurchaseDatePicker').datetimepicker('setDate', new Date());
        $('#shareClient').find('option').not(':first').remove();
        $('#shareSavingsAccount').find('option').not(':first').remove();
        $('#shareCount').val('');
        $('#singleActions a[data-action="purchase"]').text('Purchase');
        $('#singleActions a[data-action="purchase"]').prop('disabled', true);
        
        $('#sharePurchaseDatePicker').blur();
        $('#shareClient').blur();
        $('#shareSavingsAccount').blur();
        $('#shareCount').blur();
        $('#singleActions a[data-action="purchase"]').blur();
        
        ShareHandler.self.fillClientList();
    }, JSON.stringify(shareTransaction), undefined, function(response) {
        message('Error', response.responseJSON.message, MessageType.WARNING);
    });
};

ShareHandler.prototype.sellApplication = function () {
    ShareHandler.self.stack(ShareHandler.prototype.sellApplication);
    initDefaultContent('Sell share(s)');

    var $clientSelect = $('#shareSaleApplicationClient');
    $clientSelect.find('option').not(':first').remove();
    ajax(shareList.rootPath + 'clientsWithShares', 'GET', function (clientsWithShares) {
        clientsWithShares.forEach(function (client) {
            var $element = $('<option value="' + client.clientAwamoId + '" data-max="' + client.numberOfShares + '">' + client.clientName + '</option>');
            $clientSelect.append($element);
        });
        $clientSelect.off('input');
        $clientSelect.on('input', function () {
            var maxShares = $(this).find(":selected").data('max');
            $('#shareSaleApplicationCount').attr('max', maxShares);
            $('#shareSaleApplicationCount').next('.input-group-addon').text(formatCurrency(ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode + ' each, min 1 and max ' + maxShares + ' shares');

        });
    });

    $('#shareSaleApplicationForm').off('submit');
    $('#shareSaleApplicationForm').on('submit', ShareHandler.prototype.submitSellApplicationHandler);

    ShareHandler.self.shareApplication = {status: 'WANT_TO_SELL'};
    ShareHandler.self.showActionButtons();

    showContent($('#shareSaleApplication'));
};

ShareHandler.prototype.submitSellApplicationHandler = function(event) {
    if (exists(event)) {
        event.preventDefault();
    }

    var $clientSelect = $('#shareSaleApplicationClient');
    var numberOfShares = Math.round(Math.abs($('#shareSaleApplicationCount').val()));
    var shareTransaction = {
        transactionDate: new Date().getTime(),
        clientAwamoId: $clientSelect.val(),
        requestedShares: numberOfShares,
        submittedDate: new Date().getTime(),
        transactionType: 'SALE'
    };
    
   ajax(shareList.rootPath, 'POST', function (response) {
        message('Success',
                'successfully submitted application for sale of ' + numberOfShares + ' share' + (numberOfShares === 1 ? '' : 's') + ' for ' + (numberOfShares * ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode,
                MessageType.SUCCESS);

        $('#shareSaleApplicationCount').val('');
        $('#shareSaleApplicationCount').next('.input-group-addon').text(formatCurrency(ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode + ' each');
        $('#singleActions a[data-action="sell"]').text('Sell');
        $('#singleActions a[data-action="sell"]').prop('disabled', true);

        $clientSelect.blur();
        $('#shareSaleApplicationCount').blur();
        $('#singleActions a[data-action="sell"]').blur();

        $clientSelect.find('option').not(':first').remove();
        ajax(shareList.rootPath + 'clientsWithShares', 'GET', function (clientsWithShares) {
            clientsWithShares.forEach(function (client) {
                var $element = $('<option value="' + client.clientAwamoId + '" data-max="' + client.numberOfShares + '">' + client.clientName + '</option>');
                $clientSelect.append($element);
            });
            $clientSelect.off('input');
            $clientSelect.on('input', function () {
                var maxShares = $(this).find(":selected").data('max');
                $('#shareSaleApplicationCount').attr('max', maxShares);
                $('#shareSaleApplicationCount').next('.input-group-addon').text(formatCurrency(ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode + ' each, min 1 and max ' + maxShares + ' shares');

            });
        });
    }, JSON.stringify(shareTransaction), undefined, function (response) {
        message('Error', response.responseJSON.message, MessageType.WARNING);
    });
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" approve/reject application ">
ShareHandler.prototype.approvePurchase = function() {
    ShareHandler.self.stack(ShareHandler.prototype.approvePurchase);
    initDefaultContent('Purchase applications');
    var $rowContainer = getDefaultRowContainer(ShareHandler.APPLICATION_TITLES);
    
    ajax(shareList.rootPath + "listApplications?transactionType=PURCHASE", "GET", function(shareApplicationList) {
        ShareHandler.self.counter = shareApplicationList.length;
        
        if (ShareHandler.self.counter === 0) {
            tableMessage('no applications found');
        }
        
        shareApplicationList.forEach(function(shareApplication) {
            clientList.get(shareApplication.clientAwamoId, function(client) {
                shareApplication.client = client;
                shareApplication.status = "SUBMITTED_FOR_PURCHASE";
                
                savingsAccountList.get(shareApplication.savingsAccountId, function(savingsAccount) {
                    shareApplication.savingsAccount = savingsAccount;
                    addRow(
                            $rowContainer,
                            ShareHandler.self.getShareRowData(shareApplication),
                            shareApplication,
                            ShareHandler.self.approvePurchaseRowClickHandler,
                            shareApplication.clientAwamoId);
                    ShareHandler.self.counter = ShareHandler.self.counter - 1;
                    if (ShareHandler.self.counter === 0) {
                        $rowContainer.parent().tablesorter(getDefaultTableSorter("unsorted"));
                        addClassToTableColumn($rowContainer.parent(), 2, 'currency');
                    }
                });
            });
        });
    });
    
    showContent($('#defaultTableContainer'));
};

ShareHandler.prototype.approvePurchaseRowClickHandler = function () {
    // register new button handler
    $('#approveNo').off('click touch');
    $('#approveNo').on('click touch', ShareHandler.prototype.back);
    $('#rejectNo').off('click touch');
    $('#rejectNo').on('click touch', ShareHandler.prototype.back);
    
    $('#approveYes').off('click touch');
    $('#approveYes').on('click touch', ShareHandler.prototype.approvePurchaseApplication);
    $('#rejectYes').off('click touch');
    $('#rejectYes').on('click touch', ShareHandler.prototype.rejectPurchaseApplication);
    
    $('#approveApplication .panel-body .approvalObject').text('share purchase');
    $('#rejectApplication .panel-body .rejectionObject').text('share purchase');
    
    ShareHandler.self.displaySingleShare($(this).data('object'));
};

ShareHandler.prototype.approvePurchaseApplication = function () {
    ShareHandler.self.shareApplication.status = 'APPROVED_PURCHASE';
    ajax(
            shareList.rootPath + ShareHandler.self.shareApplication.id + '/approvePurchase',
            'POST',
            ShareHandler.prototype.approvePurchaseApplicationSuccessful);
    
    window.setTimeout(function() {
        ShareHandler.self.back();
        ShareHandler.self.back();
    }, 1000);
};

ShareHandler.prototype.approvePurchaseApplicationSuccessful = function () {
    ShareHandler.self.shareApplication.status = 'APPROVED_PURCHASE';
};

ShareHandler.prototype.rejectPurchaseApplication = function () {
    ShareHandler.self.shareApplication.status = 'REJECTED_PURCHASE';
    ajax(
            shareList.rootPath + ShareHandler.self.shareApplication.id + '/rejectPurchase',
            'POST',
            ShareHandler.prototype.rejectPurchaseApplicationSuccessful,
            '{"note":"' + $('#rejectionNote').val() + '"}');
    ShareHandler.self.back();
    ShareHandler.self.back();
};

ShareHandler.prototype.rejectPurchaseApplicationSuccessful = function () {
    ShareHandler.self.shareApplication.status = 'REJECTED_PURCHASE';
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" apply for sale ">
ShareHandler.prototype.saleRowClickHandler = function () {
    var shareApplication = $(this).data('object');
    ShareHandler.self.displaySingleShare(shareApplication);
    $('#shareSaleCount').val(shareApplication.requestedShares);
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" approve/reject sale application ">
ShareHandler.prototype.approveSale = function() {
    ShareHandler.self.stack(ShareHandler.prototype.approveSale);
    initDefaultContent('Sale applications');
    var $rowContainer = getDefaultRowContainer(ShareHandler.APPLICATION_TITLES); 

    ajax(shareList.rootPath + "listApplications?transactionType=SALE", "GET", function (shareApplicationList) {
        ShareHandler.self.counter = shareApplicationList.length;
        
        if (ShareHandler.self.counter === 0) {
            tableMessage('no applications found');
        }
        
        shareApplicationList.forEach(function (shareApplication) {
            clientList.get(shareApplication.clientAwamoId, function (client) {
                shareApplication.client = client;
                shareApplication.status = "SUBMITTED_FOR_SALE";

                savingsAccountList.get(shareApplication.savingsAccountId, function (savingsAccount) {
                    shareApplication.savingsAccount = savingsAccount;
                    addRow(
                            $rowContainer,
                            ShareHandler.self.getShareRowData(shareApplication),
                            shareApplication,
                            ShareHandler.self.approveSaleRowClickHandler,
                            shareApplication.clientAwamoId);
                    ShareHandler.self.counter = ShareHandler.self.counter - 1;
                    if (ShareHandler.self.counter === 0) {
                        $rowContainer.parent().tablesorter(getDefaultTableSorter("unsorted"));
                        addClassToTableColumn($rowContainer.parent(), 2, 'currency');
                    }
                });
            });
        });
    });

    showContent($('#defaultTableContainer'));
};

ShareHandler.prototype.approveSaleRowClickHandler = function () {
    // register new button handler
    $('#approveNo').off('click touch');
    $('#approveNo').on('click touch', ShareHandler.prototype.back);
    $('#rejectNo').off('click touch');
    $('#rejectNo').on('click touch', ShareHandler.prototype.back);
    
    $('#approveYes').off('click touch');
    $('#approveYes').on('click touch', ShareHandler.prototype.approveSaleApplication);
    $('#rejectYes').off('click touch');
    $('#rejectYes').on('click touch', ShareHandler.prototype.rejectSaleApplication);
  
    $('#approveApplication .panel-body .approvalObject').text('share sale');
    $('#rejectApplication .panel-body .rejectionObject').text('share sale');
    
    ShareHandler.self.displaySingleShare($(this).data('object'));
};

ShareHandler.prototype.approveSaleApplication = function () {
    ShareHandler.self.shareApplication.status = 'APPROVED_SALE';
    ajax(
            shareList.rootPath + ShareHandler.self.shareApplication.id + '/approveSale',
            'POST',
            ShareHandler.prototype.approveSaleApplicationSuccessful);
    window.setTimeout(function() {
        ShareHandler.self.back();
        ShareHandler.self.back();
    }, 1000);
};

ShareHandler.prototype.approveSaleApplicationSuccessful = function () {
    ShareHandler.self.shareApplication.status = 'APPROVED_SALE';
};

ShareHandler.prototype.rejectSaleApplication = function () {
    ShareHandler.self.shareApplication.status = 'REJECTED_SALE';
    ajax(
            shareList.rootPath + ShareHandler.self.shareApplication.id + '/rejectSale',
            'POST',
            ShareHandler.prototype.rejectPurchaseApplicationSuccessful,
            '{"note":"' + $('#rejectionNote').val() + '"}');
    ShareHandler.self.back();
    ShareHandler.self.back();
};

ShareHandler.prototype.rejectSaleApplicationSuccessful = function () {
    ShareHandler.self.shareApplication.status = 'REJECTED_SALE';
};
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc=" common methods ">
ShareHandler.prototype.displayApprove = function(share) {
    ShareHandler.self.stack(ShareHandler.prototype.displayApprove, share);
    hideContent();
    showContent($('#approveApplication'));
};

ShareHandler.prototype.displayReject = function(share) {
    ShareHandler.self.stack(ShareHandler.prototype.displayReject, share);
    hideContent();
    $('#rejectionNote').val('');
    showContent($('#rejectApplication'));
};

ShareHandler.prototype.getShareRowData = function(shareApplication) {
    var rowdata = {};
    
    for (var key in ShareHandler.APPLICATION_TITLES) {
        var formattedValue = shareApplication[key];
        
        switch (key) {
            case 'clientName':
                formattedValue = shareApplication.client.fullname;
                break;
            case 'numberOfShares':
                formattedValue = shareApplication.requestedShares;
                break;
            case 'valueOfShares':
                formattedValue = formatCurrency(parseInt(shareApplication.requestedShares) * parseInt(ShareHandler.CURRENT_MARKET_PRICE)) + ' ' + currencyCode;
                break;
            default:
                break;
        }
        
        rowdata[key] = String(formattedValue);
    }

    return rowdata;
};

ShareHandler.prototype.displaySingleShareApplication = function (shareApplication) {
    ShareHandler.self.stack(ShareHandler.prototype.displaySingleShare, shareApplication);
    ShareHandler.self.shareApplication = shareApplication;
    
    // hide all content
    hideContent();
    
    // set data
    $('#singleSharePurchaseDate').val(formatDate(shareApplication.submittedDate));
    $('#singleShareClient').val(shareApplication.awamoId);
    $('#singleShareSavingsAccount').val(shareApplication.savingsAccount.accountNo);
    $('#singleShareCount').val(shareApplication.requestedShares);
    $('#singleShareCount').next('.input-group-addon').text(ShareHandler.CURRENT_MARKET_PRICE + ' ' + currencyCode);
    
    // handle buttons
    ShareHandler.self.showActionButtons();
    
    // show form
    showContent($('#singleShare'));
};

ShareHandler.prototype.displaySingleShare = function (shareApplication) {
    ShareHandler.self.stack(ShareHandler.prototype.displaySingleShare, shareApplication);
    ShareHandler.self.shareApplication = shareApplication;
    
    // hide all content
    hideContent();
    
    // set data
    $('#singleSharePurchaseDate').val(formatDate(shareApplication.transactionDate));
    $('#singleShareClient').val(shareApplication.client.fullname);
    $('#singleShareSavingsAccount').val(shareApplication.savingsAccount.accountNo);
    $('#singleShareCount').val(shareApplication.requestedShares);
    $('#singleShareCountValue').val(formatCurrency(shareApplication.requestedShares * ShareHandler.CURRENT_MARKET_PRICE) + ' ' + currencyCode);
    
    // handle buttons
    ShareHandler.self.showActionButtons();
    
    // show form
    showContent($('#singleShare'));
};

ShareHandler.prototype.singleObjectActionHandler = function() {
    var action = $(this).data('action');

    switch (action) {
        case 'approve':
            ShareHandler.self.displayApprove(ShareHandler.self.shareApplication);
            break;
        case 'reject':
            ShareHandler.self.displayReject(ShareHandler.self.shareApplication);
            break;
        case 'back':
            ShareHandler.self.back();
            break;
        case 'purchase':
            $('#shareApplicationForm input[type="submit"]').click();
            break;
        case 'sell':
            $('#shareSaleApplicationForm input[type="submit"]').click();
            break;
        default:
            // noop
            break;
    }
};

ShareHandler.prototype.showActionButtons = function() {
    $('#singleActions a[data-action]').hide();
    
    if (ShareHandler.self.shareApplication === null) {
        $('#singleActions a[data-action="purchase"]').show();
    } else {
        $('#singleActions a[data-action="back"]').show();
        
        switch (ShareHandler.self.shareApplication.status) {
            case 'WANT_TO_SELL':
                $('#singleActions a[data-action="sell"]').show();
                break;
            
            case 'SUBMITTED_FOR_PURCHASE':
            case 'SUBMITTED_FOR_SALE':
                $('#singleActions a[data-action="approve"]').show();
                $('#singleActions a[data-action="reject"]').show();
                break;
            case 'ACTIVE':
                $('#singleActions a[data-action="sell"]').show();
                break;
            default:
                break;
        }
    }
    
    showContent($('#singleActions'));
};

ShareHandler.prototype.dataModelChanged = function() {
    // NOOP
};

ShareHandler.prototype.entityChanged = function(object, type) {
//    switch (type) {
//        case eventtype.CREATE:
//        case eventtype.UPDATE:
//            //ShareHandler.self.outputLoan(object);
//            break;
//        case eventtype.DELETE:
//            // TODO
//            console.log('not yet implemented: loan entity [' + object.mainId + '] deleted');
//            break;
//        default:
//            break;
//    }
};

ShareHandler.prototype.stack = function(command, arguments) {
    ShareHandler.self.commandStack.push(command);
    ShareHandler.self.argumentStack.push(arguments); // TODO: don't know if this works if it is undefined ...
};

ShareHandler.prototype.back = function() {
    // remove current page from stack
    ShareHandler.self.commandStack.pop();
    ShareHandler.self.argumentStack.pop();
    
    // call previous page
    ShareHandler.self.commandStack.pop()(ShareHandler.self.argumentStack.pop());
};
// </editor-fold>

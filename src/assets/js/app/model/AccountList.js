'use strict';

/* global AbstractList */

var AccountList = function() {
    AbstractList.call(this);

    this.rootPath = '/accounting/v1d/';
    this.entityName = 'account';
    this.storagePrefix = this.entityName + '_';
    AccountList.self = this;
};

AccountList.prototype = Object.create(AbstractList.prototype, {
    constructor: AccountList,
    addJournal: {value: function (self, entity, callback, callbackArgs) {
            
            ajax(this.rootPath + "journal/" + entity.accountId, 'GET', function (journal) {
                (function (entity, journal) {
                    if (exists(journal)) {
                        entity.journal = journal;
                        AbstractList.prototype.put.call(this, self, entity, callback, callbackArgs);
                    } else {
                        console.log('could not load journal of gl account  ' + entity.accountId);
                    }
                })(entity, journal);
            });
    }, enumerable: true},
    put: { value: function(self, entity, callback, callbackArgs) {
        this.addJournal(self, entity, callback, callbackArgs);
    }, enumerable: true },
    enrich: { value: function(object) {
        object.mainId = object.accountId;
        return object;
    }, enumerable: true },
    addJournalEntry: { value: function(journalEntry) {
        this.getById(journalEntry.accountId).journal.push(journalEntry);
    }, enumerable: true },
    addJournalEntries: { value: function(journalEntries) {
        journalEntries.forEach(function (journalEntry) {
            AccountList.self.getById(journalEntry.accountId).journal.push(journalEntry);
        });
    }, enumerable: true },
    getBalanceSheet: { value: function() {
        var balanceSheet = new BalanceSheet();
        
        this.getEntities().forEach(function(account) {
            balanceSheet.addAccount(account);
        });
        
        return balanceSheet;
    }, enumerable: true }
});

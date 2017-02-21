'use strict';
 
function BalanceSheet() {
    this.root = new Node();
    
    this.root.addChild(new Node({ glCode: "1000", name: 'Assets' }));
    this.root.addChild(new Node({ glCode: "2000", name: 'Liabilities' }));
    this.root.addChild(new Node({ glCode: "3000", name: 'Equity' }));
    this.root.addChild(new Node({ glCode: "4000", name: 'Revenues' }));
    this.root.addChild(new Node({ glCode: "5000", name: 'Expenses' }));
};

BalanceSheet.prototype = {
    root: null,
    constructor: BalanceSheet,
    addAccount: function(account) {
        var parentGLCode;
        
        if (account.glCode % 100 === 0 && account.glCode % 1000 !== 0) {
            parentGLCode = Math.floor(account.glCode / 1000) * 1000;
        } else {
            parentGLCode = Math.floor(account.glCode / 100) * 100;
        }

        var parent = this.root.getChildByGLCode(parentGLCode.toString());
        
        if (parent === null) {
            console.log('no parent found for ' + account.glCode);
            return;
        }
        
        parent.addChild(new Node(account));
    }
};

function Node(account) {
    this.account = account;
    this.children = [];
};

Node.prototype = {
    parent: null,
    account: null,
    children: null,
    constructor: Node,
    balance: function() {
        if (this.children.length === 0) {
            return this.sumOfJournal(this.account);
        }
        
        var balance = this.children.reduce(function (sum, child) {
            sum += child.balance();
            return sum;
        }, 0);
        
        return balance;
    },
    sumOfJournal: function(account) {
        if (!exists(account) || !exists(account.journal)) {
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
    },
    addChild: function(node) {
        node.parent = this;
        this.children.push(node);
    },
    getChildByGLCode: function(glCode) { // BFS
        if (exists(this.account) && this.account.glCode === glCode) {
            return this;
        }
        var len = this.children.length;
        for (var i = 0; i < len; i++) {
            if (this.children[i].account.glCode === glCode) {
                return this.children[i];
            }
        }
        for (var i = 0; i < len; i++) {
            var node = this.children[i].getChildByGLCode(glCode);
            if (node !== null) {
                return node;
            }
        }
        return null;
    }
};

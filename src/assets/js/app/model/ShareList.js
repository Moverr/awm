'use strict';

/* global AbstractList, clientList */

var ShareList = function () {
    AbstractList.call(this);

    this.rootPath = '/share/v1d/';
    this.entityName = 'share';
    this.storagePrefix = this.entityName + '_';
};

ShareList.prototype = Object.create(AbstractList.prototype, {
    constructor: ShareList,
    enrich: {value: function (object) {
            object.mainId = object.id;
            return object;
        }, enumerable: true},
    getCountByStatus: {value: function (status) {
            var listtemp = this.getEntities();
            return listtemp.reduce(function (accumulator, object) {
                if (object.status === status) {
                    accumulator = accumulator + 1;
                }
                return accumulator;
            }, 0);
        }, enumerable: true},
    getListByStatus: {value: function (status) {
            return this.getEntities().filter(function (share) {
                return share.status === status;
            });
        }, enumerable: true},
    addClient: {value: function (self, share, callback, callbackArgs) {
// TODO: use private client list from parent prototype of AbstractList
            clientList.get(share.awamoId, function (client) {
                (function (share, client) {
                    if (exists(client)) {
                        share.client = client;
                        share.clientName = client.fullname;
                        AbstractList.prototype.put.call(this, self, share, callback, callbackArgs);
                    }
                })(share, client);
            });
        }, enumerable: true},
    put: {value: function (self, entity, callback, callbackArgs) {
            this.addClient(self, entity, callback, callbackArgs);
        }, enumerable: true}

});

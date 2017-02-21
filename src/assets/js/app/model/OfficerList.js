'use strict';

/* global Storage, DEV_NO_MODEL_INIT, AbstractList */

var OfficerList = function() {
    AbstractList.call(this);

    this.rootPath = '/officer/v1d/';
    this.entityName = 'officer';
    this.storagePrefix = this.entityName + '_';
};

OfficerList.prototype = Object.create(AbstractList.prototype, {
    constructor: OfficerList,
    enrich: { value: function(object) {
        object.mainId = object.awamoId;
        object.fullname = object.lastname.toUpperCase() + ", " + object.firstname;
        return object;
    }, enumerable: true }
});

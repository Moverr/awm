'use strict';

/* global Storage, DEV_NO_MODEL_INIT, AbstractList */

var GroupList = function() {
    AbstractList.call(this);

    this.rootPath = '/group/v1d/';
    this.entityName = 'group';
    this.storagePrefix = this.entityName + '_';
};

GroupList.prototype = Object.create(AbstractList.prototype, {
    constructor: GroupList,
    enrich: { value: function(object) {
        object.mainId = object.awamoId;
        return object;
    }, enumerable: true }
});

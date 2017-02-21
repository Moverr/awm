/* global DEV_NO_MODEL_INIT, eventtype, Storage */

// TODO: add all lists as internal variable such that each list has access to
//       all others without relying on global variables
// TODO: some better handling for eventtype? class constant?

function AbstractList() {
    this.mainIds = [];
    this.entityMap = {};
    this.entityArray = [];
    this.dataModelChangedEventListenerCallbacks = [];
    this.entityChangedEventListenerCallbacks = [];
    this.callbacks = {};
    this.reloadIds = [];
    this.reloadInProgress = false;
}

AbstractList.prototype = {
    rootPath: null,
    storagePrefix: null,
    constructor: AbstractList,
    initLocal: function (callbackList) {
        this.loadAllFromLocal(callbackList);
    },
    init: function (callbackList) {
        // the callbackList gets destroyed recursively, so clone it first
        var callbackListClone = [];
        callbackList.forEach(function(callback) {
            callbackListClone.push(callback);
        });
        
        // then fill GUI from local storage with cloned list
        this.initLocal(callbackListClone);
        
        // then synchronize with server with untouched original list
        if (!this.updated) {
            this.updated = true;

            this.loadAll(callbackList); // load once immediately
            var self = this;
            this.reloadTimer = window.setInterval(function () {
                self.loadAll();
            }, 1000 * 60 * 30); // every 30 minutes
        }
    },
    reload: function() {
        this.loadAll();
    },
    get: function(id, callback) {
        callback(this.entityMap[id]);
        
        
//        var entity = this.entityMap[id];
//        if (exists(entity)) {
//            // if the entity is stored locally, use it
//            callback(entity);
//        } else {
//            console.log('There has been a request to get the entity with the ID ' + id + '. ' +
//                    'This entity cannot be found in the local storage and must be loaded from the server. ' +
//                    'This is a very unusual case. We handle this, but check why this case did occur.');
//            // we need to fetch the data from the backend
//            // we do this by creating a callback queue, adding the given callback to this
//            // queue, do an ajax call for loading the data and iterate over all callbacks
//            // for that data in the ajax response function
//
//            // Background: if the data is loaded twice, both caller will try to load the
//            // data (if it is not yet stored locally). If the first call is already underway,
//            // but no response was received (such that the local storage is still empty),
//            // we do not issue a second ajax call, but attach the second callback to the
//            // first call.
//
//            var callbacks = this.callbacks[id];
//            if (exists(callbacks)) {
//                try {
//                    callbacks.push(callback);
//                } catch (err) {
//                    this.loadOne(id, callback);
//                }
//            } else {
//                this.loadOne(id, callback);
//            }
//        }
    },
    getTotalCount: function() {
        return this.mainIds.length;
    },
    getMainIds: function() {
        return this.mainIds;
    },
    getEntities: function() {
        return this.entityArray;
    },
    addDataModelChangedEventListenerCallback: function(dataModelChangedEventListenerCallback) {
        this.dataModelChangedEventListenerCallbacks.push(dataModelChangedEventListenerCallback);
    },
    removeDataModelChangedEventListenerCallback: function(dataModelChangedEventListenerCallback) {
        var index = this.dataModelChangedEventListenerCallbacks.indexOf(dataModelChangedEventListenerCallback);
        if (index > - 1) {
            this.dataModelChangedEventListenerCallbacks.splice(index, 1);
        }
    },
    addEntityChangedEventListenerCallback: function(entityChangedEventListenerCallback) {
        this.entityChangedEventListenerCallbacks.push(entityChangedEventListenerCallback);
    },
    removeEntityChangedEventListenerCallback: function(entityChangedEventListenerCallback) {
        var index = this.entityChangedEventListenerCallbacks.indexOf(entityChangedEventListenerCallback);
        if (index > - 1) {
            this.entityChangedEventListenerCallbacks.splice(index, 1);
        }
    },
    store: function(entity) {
        entity = this.enrich(entity);

        var type = eventtype.CREATE;
        var len = this.entityArray.length;
        var index = 0;
        for (; index < len; index++) {
            if (this.entityArray[index].mainId === entity.mainId) {
                if (this.equals(this.entityArray[index], entity)) {
                    type = eventtype.UNCHANGED;
                } else {
                    type = eventtype.UPDATE;
                }
                break;
            }
        }
        
        if (type !== eventtype.UNCHANGED) {
            if (!this.mainIds.includes(entity.mainId)) {
                this.mainIds.push(entity.mainId);
            }
            this.entityMap[entity.mainId] = entity;
            this.entityArray[index] = entity;
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem(this.storagePrefix + entity.mainId, JSON.stringify(entity));
            }
            this.notifyEntityChangedListener(entity, type);
            this.notifyDataModelChangedListener();
        }
    },
    loadOne: function(id, callback) { // should not be needed, see comment on branch in get method
        this.callbacks[id] = [ callback ];
        var self = this;
        ajax(this.rootPath + id, 'GET', function (entity) {
            self.store(entity);
            try {
                var callback = self.callbacks[id].pop();
                while (exists(callback)) {
                    callback(entity);
                    callback = self.callbacks[id].pop();
                }
            } catch (err) {
                // noop
            }
            delete self.callbacks[id];
        }, null, undefined, function () {
            callback(null);
        });
    },
    loadAllFromLocal: function(callbackList) {
        if (typeof (Storage) !== "undefined") {
            for (var i = 0, len = localStorage.length; i < len; ++i) {
                var key = localStorage.key(i);
                if (key.startsWith(this.storagePrefix)) {
                    var value = localStorage.getItem(key);
                    var entity = JSON.parse(value);
                    this.store(entity);
                }
            }
            
            if (Array.isArray(callbackList)) {
                var nextInitializer = callbackList.shift();

                if (exists(nextInitializer)) {
                    nextInitializer.initLocal(callbackList);
                }
            }
        }
    },
    loadAll: function(callbackList) {
        // TODO: can I use this.mainIds for that?
        var knownMainIds = [];

        // fill list from local storage if possible
        if (typeof (Storage) !== "undefined") {
            for (var i = 0, len = localStorage.length; i < len; ++i) {
                var key = localStorage.key(i);
                if (key.startsWith(this.storagePrefix)) {
                    var value = localStorage.getItem(key);
                    var entity = JSON.parse(value);
                    knownMainIds.push(entity.mainId);
                    this.store(entity);
                }
            }
        }

        // get new or changed ones
        var self = this;
        ajax(this.rootPath + 'mainIds/0', 'GET', function (ids) {
            knownMainIds.forEach(function (mainId) {
                if (!ids.includes(mainId)) {
                    // delete entity from local browser storage
                    if (typeof (Storage) !== "undefined") {
                        localStorage.removeItem(self.storagePrefix + mainId);
                    }

                    // delete from class internal storages
                    self.mainIds.remove(mainId);
                    delete self.entityMap[mainId];
                    self.entityArray = self.entityArray.filter(function(entity) { return entity.mainId !== mainId; });

                    // notify listeners of deletion
                    self.notifyDataModelChangedListener();
                    self.notifyEntityChangedListener(mainId, eventtype.DELETE);
                }
            });

            // sort descending to get the newest ones first
            ids.sort(function(one, other) {
                return parseInt(one) > parseInt(other);
            }).reverse();
            self.reloadIds = ids;
            if (!self.reloadInProgress) {
                self.loadNext(self, callbackList);
            }
        });
    },
    loadNext: function(self, callbackList) {
        if (!exists(self.reloadIds)) {
            return;
        }
        
        var id = self.reloadIds.shift();
        
        if (exists(id)) {
            self.reloadInProgress = true;
            ajax(self.rootPath + id, 'GET', function(entity) {
                self.put(self, entity, self.loadNext, callbackList);
            }, undefined, undefined, function() { self.loadNext(self, callbackList); });
        } else {
            self.reloadInProgress = false;
            if (Array.isArray(callbackList)) {
                var nextInitializer = callbackList.shift();
                
                if (exists(nextInitializer)) {
                    nextInitializer.init(callbackList);
                }
            }
        }
    },
    put: function(self, entity, callback, callbackArgs) {
        self.store(entity);
        statusbar('synchronizing ' + self.entityName + 's, ' + self.reloadIds.length + ' left to load');
        if ($.isFunction(callback)) {
            callback(self, callbackArgs);
        }
    },
    notifyDataModelChangedListener: function() {
        this.dataModelChangedEventListenerCallbacks.forEach(function(callback) { callback(); } );
    },
    // if the change was "add", the new entity is passed
    // if it was "delete", the mainId of the deleted entity is passed
    notifyEntityChangedListener: function(entity, type) {
        this.entityChangedEventListenerCallbacks.forEach( function(callback) { callback(entity, type); });// TODO: don't know if this works, test!
    },
    sorter: function(one, other) {
        return one > other;
    },
    equals: function(one, other) {
        if (one === other) {
            return true;
        }

        if (!exists(one) || !exists(other)) {
            return false;
        }

        var onesKeys = Object.keys(one).sort();
        var othersKeys = Object.keys(other).sort();
        var onesLength = onesKeys.length;
        var othersLength = othersKeys.length;

        if (onesLength !== othersLength) {
            return false;
        }

        for (var i = 0; i < onesLength; i++) {
            var onesKey = onesKeys[i];
            var otherKey = othersKeys[i];
            if (onesKey !== otherKey) {
                return false;
            } else {
                if (one[onesKey] !== other[otherKey]) {
                    return false;
                }
            }
        }

        return true;
    },
    getById: function(id) {
        var idFilter = function(entity) {
            return entity.mainId === id;
        };
        
        var filtered = this.getEntities().filter(idFilter);
        if (filtered.length === 1) {
            return filtered[0];
        }
        
        return null;
    }
};

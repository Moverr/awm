'use strict';

/* global Storage, host, DEV_NO_MODEL_INIT, BIT_MASK_WEEK, BIT_MASK_DAY, BIT_MASK_MONTH, BIT_MASK_YEAR, eventtype, AbstractList */

var ClientList = function() {
    AbstractList.call(this);

    this.rootPath = '/client/v1d/';
    this.entityName = 'client';
    this.storagePrefix = this.entityName + '_';
};

ClientList.prototype = Object.create(AbstractList.prototype, {
    constructor: ClientList,
    enrich: { value: function(object) {
        object.mainId = object.awamoId;
        object.fullname = object.lastname.toUpperCase() + ", " + object.firstname;

        if (object.birthdate === null) { // should not occur, but we have some corrupted test data
            object.age = 0;
        } else {
            object.age = Math.floor((new Date().getTime() - object.birthdate) / 31536000000); // years
        }

        object.createdWithin = 0;
        if (object.submitDate !== null) { // should not occur, but we have some corrupted test data
            object.submitDate = parseInt(object.submitDate);

            var now = new Date().getTime();
            var day = new Date(now);
            var week = new Date(now);
            var month = new Date(now);
            var year = new Date(now);

            day = day.setDate(day.getDate() - 1);
            week = week.setDate(week.getDate() - 7);
            month = month.setMonth(month.getMonth() - 1);
            year = year.setYear(year.getYear() - 1);

            object.createdWithin |= (day < object.submitDate ? BIT_MASK_DAY : 0);
            object.createdWithin |= (week < object.submitDate ? BIT_MASK_WEEK : 0);
            object.createdWithin |= (month < object.submitDate ? BIT_MASK_MONTH : 0);
            object.createdWithin |= (year < object.submitDate ? BIT_MASK_YEAR : 0);
        }

        return object;
    }, enumerable: true },
    putWithThumbnail: { value: function(client) { // not yet used
        var self = this;

        $.ajax({
            url: host + '/client/v1d/find?' +
                    'awamoId=' + client.awamoId + '&' +
                    'deviceId=cockpit&' +
                    'datatype=THUMBNAIL&' +
                    'width=32',
            type: 'GET',
            headers: getAuthenticationHeader(),
            xhrFields : {
                responseType : 'arraybuffer'
            }
        })
        .done(function (e) {
            var blob = new Blob([e], {type: "image/jpg"});
            var fr = new FileReader();
            fr.onload = function (e) {
                client.thumbnail = e.target.result;
                self.put(self, client);
            };
            fr.readAsDataURL(blob);
        })
        .fail(function (e) {
            console.log('fail');
            console.log(e);
        })
        .always(function (e) {
//            console.log('always');
//            console.log(e);
        });
    }, enumerable: true }
});


//ClientList.prototype.getOverviewLastDay = function() {
//    return ClientList.self._getOverviewLastPeriod(BIT_MASK_DAY);
//};
//ClientList.prototype.getOverviewLastWeek = function() {
//    return ClientList.self._getOverviewLastPeriod(BIT_MASK_WEEK);
//};
//ClientList.prototype.getOverviewLastMonth = function() {
//    return ClientList.self._getOverviewLastPeriod(BIT_MASK_MONTH);
//};
//ClientList.prototype.getOverviewLastYear = function() {
//    return ClientList.self._getOverviewLastPeriod(BIT_MASK_YEAR);
//};
//ClientList.prototype._getOverviewLastPeriod = function(periodBitMask) {
//    var clients = ClientList.self.getEntities();
//    var len = clients.length;
//    var withinLastPeriod = 0;
//    
//    for (var i = 0; i < len; i++) {
//        if ((clients[i].createdWithin & periodBitMask) > 0) {
//            withinLastPeriod += 1;
//        } else {
//            if (periodBitMask === BIT_MASK_YEAR) {
//                console.log(clients[i]);
//            }
//        }
//    }
//    
//    return withinLastPeriod;
//};

/**
 * Copyright: E2E Technologies Ltd
 */
"use strict";

// var FilePersistency = require('./file.js').Persistency;
// var MongoDBPersistency = require('./mongodb.js').Persistency;
var MemPersistency = require('./memDB.js').Persistency;

/**
 * @param {Object} previously stored DB
 * @constructor
 */
var Persistency = exports.Persistency = function(options) {
    this.implementation = new MemPersistency(options);
};

/**
 * @param {{processInstanceId: String}} persistentData
 * @param {Function} done
 */
Persistency.prototype.persist = function(persistentData, done) {
    this.implementation.persist(persistentData, done);
};

/**
 * @param {String} processId
 * @param {String} processName
 * @param done
 */
Persistency.prototype.load = function(processId, processName, done) {
    this.implementation.load(processId, processName, done);
};

/**
 * @param {String} processName
 * @param done
 */
Persistency.prototype.loadAll = function(processName, done) {
    this.implementation.loadAll(processName, done);
};

/**
 * @param {Function} callback
 */
Persistency.prototype.dump = function(callback) {
    this.implementation.dump(callback);
};

/**
 * @param done
 */
Persistency.prototype.close = function(done) {
    this.implementation.close(done);
};

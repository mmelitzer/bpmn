"use strict";

function MemDB(options) {
    this.processes = options.initState || {};
}

MemDB.prototype.find = function(query, fields, callback) {
    var proc = this.processes[query.processId] || this.processes[query.processName];
    var result = [];
    if (!proc) {
        proc = Object.values(this.processes).find(function(p) {
            return p.processName === query.processName;
        });
    }
    if (!!proc) {
        result.push(proc);
    }
    callback(false, result);
}

MemDB.prototype.update = MemDB.prototype.insert = function(data, callback) {
    this.processes[data.processId] = data;
    callback(false, data);
}

MemDB.prototype.dump = function(callback) {
    callback(this.processes);
}

/**
 * @param {Object} currently unused
 * @constructor
 */
var Persistency = exports.Persistency = function(options) {
    this.db = new MemDB(options || {});
};

/**
 * {Function} callback
 */
Persistency.prototype.dump = function(callback) {
    this.db.dump(callback);
}

/**
 * @param {{processInstanceId: String}} persistentData
 * @param {Function} done
 */
Persistency.prototype.persist = function(persistentData, done) {
    var db = this.db;
    var processId = persistentData.processId;
    var query = {processId: processId, processName: persistentData.processName};
    var fields = {}; // all fields

    db.find(query, fields, function(err, documents) {
        if (documents && documents.length > 0) {
            if (documents.length === 1) {
                persistentData._saved = documents[0]._saved;
                persistentData._updated = Date.now();
                db.update(persistentData, function(error, updatedData) {
                    if(error) {
                        done(error);
                    } else {
                        done(null, updatedData);
                    }
                });
            } else {
                done(new Error("Process ID: '" + processId + "' is not unique in the DB"));
            }
        } else {
            persistentData._saved = Date.now();
            persistentData._updated = persistentData._saved;
            db.insert(persistentData, function(error, insertedData) {
                if(error) {
                    done(error);
                } else {
                    done(null, insertedData);
                }
            });
        }
    });
};

/**
 * @param {String} processId
 * @param {String} processName
 * @param done
 */
Persistency.prototype.load = function(processId, processName, done) {
    var db = this.db;
    var query = {processId: processId, processName: processName};
    var fields = {}; // all fields

    db.find(query, fields, function(error, documents) {
        if (documents && documents.length > 0) {
            if (documents.length === 1) {
                if(error) {
                    done(error);
                } else {
                    done(null, documents[0]);
                }
            } else {
                done(new Error("Persistency: Process ID: '" + processId + "' is not unique in the DB"));
            }
        } else {
            // we allow that nothing has been found because this happens
            // the very first time when the process is being created
            done();
        }
    });
};

/**
 * @param {String} processName
 * @param done
 */
Persistency.prototype.loadAll = function(processName, done) {
    var db = this.db;
    var query = {processName: processName};
    var fields = {}; // all fields

    db.find(query, fields, function(err, documents) {
        if(err){
            return done(err);
        }

        if (documents) {
            done(null, documents);
        } else {
            done(null, []);
        }
    });
};

Persistency.prototype.close = function() {};

var promise = require("bluebird");
var config = require('./config');
var p = require('path');

module.exports = promise;

// promise化sqlite
var sqlite3 = require('sqlite3').verbose();
module.exports.db = promise.promisifyAll(new sqlite3.Database(p.join(config.root,"PodHash.sqlite3")));

// promise化fs模块
module.exports.fs = promise.promisifyAll(require('fs'));


module.exports.cmd = promise.promisifyAll(require('child_process'),{multiArgs: true});

module.exports.downthrow = promise.method(function(obj){
    return obj;
});
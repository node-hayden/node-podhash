var fs = require('fs');
var Promise = require('bluebird');
var p = require('path');

module.exports.getSubDirsAsync = function(path, reg){
    return new Promise(function(resolve, reject){
        var dirs = new Array();
        fs.readdir(path, function(err, files){
            if(err){
                reject(err);
            }else if(files && files.length>0){
                var count = files.length;
                var index = 0;
                files.forEach(function(name){
                    fs.stat(p.join(path, name), function(err, stats){
                        if(stats.isDirectory()){
                            if(reg && reg.test(name)){
                                dirs.push(name);
                            }else if(reg==null){
                                dirs.push(name);
                            }
                        }
                        index ++;
                        if(index == count){
                            resolve(dirs);
                        }
                    });
                });
            }else {
                resolve(dirs);
            }
        });
    });
};

module.exports.readLines = function (filePath, callback) {
    var inputstream = fs.createReadStream(filePath);
    var remaining = '';
    inputstream.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
            var line = remaining.substring(0, index);
            remaining = remaining.substring(index + 1);
            callback(null, line, false);
            index = remaining.indexOf('\n');
        }
    });

    inputstream.on('end', function() {
        if (remaining.length > 0) {
            callback(null, remaining, true);
        }else{
            callback(null, null, true);
        }
    });

    inputstream.on('error', function(err){
        callback(err, null, true);
    });
};
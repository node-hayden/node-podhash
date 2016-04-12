var db = require('../common/db');
var p = require('path');
var promise = require('../common/promise');
var config = require('../common/config');
var file = require('../common/file');
var ArrUtil = require('../common/array');
var rd = require("rd");


var dependReg = /^\s*\S+\.dependency\s+["']{1}\S+["']{1}\s*$|^\s*\S+\.dependency\s+["']{1}\S+["']{1}\s*,\s*["']{1}.+["']{1}\s*$/;

module.exports.getRepoList = function () {
    return new promise(function (resolve, reject) {
        db.serialize(function () {
            db.all("SELECT repo_name FROM repo_meta ORDER BY id ASC", function (err, repos) {
                if (err) {
                    reject(err);
                } else {
                    resolve(repos);
                }
            });
        });
    });
};

module.exports.addRepo = function (name, source) {
    return new promise(function (resolve, reject) {
        var reg = /^http:\/\/\S+\.git$|^https:\/\/\S+\.git$|^\S+@\S+\.git$|^ssh:\/\/\S+\.git$/
        if (source == null || !reg.test(source)) {
            console.warn("repo_name or source is not valid!");
            reject({eno: 1, msg: "仓库名称和源地址不合法!"});
            return;
        }

        var pname = p.basename(source, ".git");
        var repo_name = name && name.length ? name : pname;

        db.serialize(function () {
            var strSQL = "SELECT * FROM repo_meta WHERE repo_name=?"
            db.get(strSQL, pname, function (err, repo) {
                if (err) {
                    reject(err);
                } else if (repo) {
                    reject({eno: 1, msg: "存在重名仓库"});
                } else {
                    strSQL = "INSERT INTO repo_meta (repo_name, repo_source) VALUES (?,?)";
                    db.run(strSQL, repo_name, source, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            module.exports.updateRepo(repo_name).then(function () {
                                resolve();
                            }).catch(function (err) {
                                db.run("DELETE FROM repo_meta WHERE repo_name=?", repo_name, function(){
                                    reject(err);
                                });
                            });
                        }
                    });
                }
            });
        });
    });
}

module.exports.updateRepo = function (repo_name) {
    return new promise(function (resolve, reject) {
        db.serialize(function () {
            var strSql = "SELECT * FROM repo_meta WHERE repo_name=?";
            db.getAsync(strSql, repo_name).then(function (repo) {
                if (repo) {
                    return [module.exports.clearRepo(repo_name),
                        promise.downthrow(repo.repo_source)];
                } else {
                    reject({eno: 1, msg: "没有该名称仓库"});
                }
            }).spread(function (clear, repo_source) {
                return module.exports.cloneRepo(repo_name, repo_source);
            }).then(function(){
                return module.exports.addStruct(repo_name);
            }).then(function () {
                resolve();
            }).catch(function (err) {
                db.run("DELETE FROM repo WHERE repo_name=?", repo_name, function(){
                    reject(err);
                });
            });
        });
    });
};

module.exports.clearRepo = function (repo_name) {
    return new promise(function (resolve, reject) {
        var array = new Array();
        var strSql = "DELETE FROM repo WHERE repo_name=?";
        array.push(db.runAsync(strSql, repo_name));

        var strCmd = "rm -rf " + p.join(config.repo_root, repo_name);
        array.push(promise.cmd.execAsync(strCmd));

        db.serialize(function () {
            promise.all(array).then(function () {
                resolve();
            }).catch(function (err) {
                reject(err);
            });
        });
    });
};

module.exports.cloneRepo = function (repo_name, repo_source) {
    return new promise(function (resolve, reject) {
        var repo_path = p.join(config.repo_root, repo_name);
        var strCmd = "git clone " + repo_source + " " + repo_path;
        promise.cmd.execAsync(strCmd).then(function(){
            resolve();
        }).catch(function(err){
            reject(err);
        });
    });
}

module.exports.addStruct = function (repo_name) {
    return new promise(function (resolve, reject) {
        var repo_path = p.join(config.repo_root, repo_name);
        rd.readFileFilter(repo_path, /^\S+\.podspec$|^\S+\.json$/, function (err, files) {
            if (err) {
                reject(err);
            } else {
                var count = files.length;
                var success = 0;
                files.forEach(function(filePath){
                    module.exports.readDepands(filePath).then(function(depends){
                        var relPath = p.relative(config.repo_root, filePath);
                        var array = relPath.split(p.sep);
                        var module = array.length>1 ? array[1] : "unkown";
                        var version = array.length>2 ? array[2] : "0.0.0";
                        var fileName = p.basename(filePath);
                        var strSQL = "INSERT INTO repo (repo_name, module_name, version, file_name, depends) "+
                            "VALUES (?,?,?,?,?)";
                        db.serialize(function(){
                            db.run(strSQL, repo_name, module, version, fileName, depends, function(err){
                                if(err){
                                    reject(err);
                                }else{
                                    success ++;
                                    if(success == count){
                                        resolve();
                                    }
                                }
                            });
                        });
                    }).catch(function(err){
                        reject(err);
                    });
                });
            }
        });
    });
}

module.exports.readDepands = function (path) {
    return new promise(function (resolve, reject) {
        var extName = p.extname(path);
        var mname = p.basename(path, extName);
        if (extName == ".json") {
            resolve("extern");
        } else {
            var depends = new Array();
            var reg = new RegExp("[\"\']"+mname+"/\\S+[\"\']");
            file.readLines(path, function (err, line, isEnd) {
                if (err){
                    reject(err);
                    return;
                }else if(line){
                    var dps = line.match(dependReg);
                    var dp = dps && dps.length>0 ? dps[0] : null;
                    if(dp && dp.length && !reg.test(dp)){
                        dp = dp.replace(/\S+\.dependency\s/g,"");
                        dp = dp.replace(/[\s"']/g, "");
                        if(dp.length){
                            depends.push((dp));
                        }
                    }
                }

                if(isEnd){
                    var returnDepends = "";
                    if(depends.length){
                        depends.sort(function(a, b){
                            return a>b ? 1 : ( a<b ? -1 : 0 );
                        });
                        returnDepends = depends.join("#@#");
                    }
                    resolve(returnDepends);
                }
            });
        }
    });
};

module.exports.getRepoDetail = function(repo_name){
    return new promise(function (resolve, reject) {
        var strSQL = "SELECT DISTINCT module_name FROM repo WHERE repo_name=?";
        db.serialize(function(){
            db.all(strSQL, repo_name, function(err, repos){
                if(err){
                    reject(err);
                }else {
                    resolve(repos);
                }
            });
        });
    });
};

module.exports.getModuleDetail = function(repo_name, module_name){
    return new promise(function (resolve, reject) {
        var strSQL = "SELECT DISTINCT version, depends FROM repo WHERE repo_name=? AND module_name=?";
        db.serialize(function(){
            db.all(strSQL, repo_name, module_name, function(err, repos){
                if(err){
                    reject(err);
                }else {
                    ArrUtil.sortModuleVersion(repos);
                    resolve(repos);
                }
            });
        });
    });
}


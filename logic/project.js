var db = require('../common/db');
var p = require('path');
var promise = require('../common/promise');
var config = require('../common/config');
var file = require('../common/file');
var ArrUtil = require('../common/array');
var rd = require("rd");

var filterReg = /.*\.[m]{1,2}$|.*\.[h]{1}$|.*\.cpp$|.*\.c$/;

module.exports.getAllFiles = function(root){
    return new promise(function(resolve, reject){
        rd.readFileFilter(root, filterReg, function(err, files){
            if(err){
                reject(err);
            }else if(files && files.length > 0){
                resolve(files);
            }else {
                reject({eno:1, msg:("No files in "+root)})
            }
        });
    });
};

module.exports.getAllImportFileNames = function(files){
    return new promise(function(resolve, reject){
        if(files == null || !(files instanceof Array)){
            reject({eno:1, msg:"File path array not valid!"});
            return;
        }
        var count = files.length;
        var index = 0;
        var importFilterReg = /^\s*#import\s+[<"]{1}[a-zA-Z0-9_\/\.\+]+[>"]{1}\s*/;
        var allImport = {};
        files.forEach(function(path){
            file.readLines(path,function(err, data, isEnd){
                if(err){
                    reject(err);
                    return;
                }
                if(data){
                    var arrRegText = data.match(importFilterReg);
                    if(arrRegText && arrRegText.length){
                        arrRegText.forEach(function(e){
                            var str = e.replace(/#import/g, "");
                            str = str.replace(/["<>\s]+/g, "");
                            var ext = p.extname(str);
                            var name;
                            if(ext){
                                name = p.basename(str, ext);
                            }else{
                                name = p.basename(str);
                            }
                            if(name && !allImport[name]){
                                allImport[name] = str;
                            }
                        });
                    }
                }
                if(isEnd){
                    index ++;
                    if(index==count){
                        resolve(allImport);
                    }
                }
            });
        });
    });
};

module.exports.getAllFileNameMap = function(files){
    if(files == null || !(files instanceof Array)){;
        return null;
    }
    var dic = {};
    files.forEach(function(e){
        var fileName;
        var extname = p.extname(e);
        if(extname){
            fileName = p.basename(e, extname);
        }else{
            fileName = p.basename(e);
        }

        if(fileName) {
            var arrTemp = dic[fileName];
            if(arrTemp){
                arrTemp.push(e);
            }else {
                arrTemp = new Array();
                arrTemp.push(e);
                dic[fileName] = arrTemp;
            }
        }
    });
    return dic;
};

module.exports.getExternImport = function(allImport, allFileNameMap){
    if (allFileNameMap == null) {
        return allImport;
    }
    var dicExternImport = {};
    for(var key in allImport){
        if(allFileNameMap[key]) continue;
        dicExternImport[key] = allImport[key];
    }
    return dicExternImport;
};

module.exports.getDepandMap = function(imports, fileNameMap){
    var dicDepends = {};
    var dicUnfind = {};
    for(var key in imports){
        var obj = fileNameMap[key];
        var currentDepandArray = dicDepends[key];
        if(obj) {
            if(currentDepandArray){
                obj.forEach(function(e){
                    currentDepandArray.push(e);
                });
            }else{
                dicDepends[key] = obj;
            }
        }else {
            dicUnfind[key] = imports[key];
        }
    }
    return {find:dicDepends, unfind:dicUnfind};
};

// for router
module.exports.getDependstForR = function(root, dependRoot){
    return new promise(function(resolve, reject){
        var array = new Array();
        array.push(module.exports.getAllFiles(root));
        if(dependRoot){
            array.push(module.exports.getAllFiles(dependRoot));
        }
        promise.downthrow().then(function(){
            return array;
        }).spread(function(files, dependFiles){
            return [module.exports.getAllImportFileNames(files), promise.downthrow(files), promise.downthrow(dependFiles)];
        }).spread(function(allImports, files, dependFiles){
            var fileNameMap = module.exports.getAllFileNameMap(files);
            var externImport = module.exports.getExternImport(allImports, fileNameMap);
            var result = {depends:externImport};
            if(dependFiles){
                var depandFileNameMap = module.exports.getAllFileNameMap(dependFiles);
                var depends = module.exports.getDepandMap(externImport, depandFileNameMap);
                for(var key in depends){
                    result[key] = depends[key];
                }
            }
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
};


module.exports.getDuplicate = function(root, reg){
    return new promise(function(resolve, reject){
        rd.readFileFilter(root, reg, function(err, files){
            if(err){
                reject(err);
            }else if(files && files.length > 0){
                var dicCount = {};
                files.forEach(function(path){
                    var fileName = p.basename(path);
                    var array = dicCount[fileName];
                    if(array){
                        array.push(path);
                    }else{
                        array = new Array();
                        array.push(path);
                        dicCount[fileName] = array;
                    }
                });
                var dicResult = {};
                for(var key in dicCount){
                    var array = dicCount[key];
                    if(array.length < 2) continue;
                    var extname = p.extname(key);
                    extname = extname && extname.length>0 ? extname : "none";
                    var obj = dicResult[extname];
                    if(obj){
                        obj[key] = array;
                    }else{
                        obj = {};
                        obj[key] = array;
                        dicResult[extname] = obj;
                    }
                }
                resolve(dicResult);
            }else {
                reject({eno:1, msg:("No files in "+root)})
            }
        });
    });
}



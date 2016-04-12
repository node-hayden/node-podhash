
//var delStr = 'rm -rf /Users/Hayden/Project/Workspace/Node/node-podhash/data/repo/dp\n';
//var cmdStr = 'git clone http://code.dianpingoa.com/mobile/DPPods.git /Users/Hayden/Project/Workspace/Node/node-podhash/data/repo/dp';
var promise = require('./common/promise');
var repologic = require('./logic/repo');

//var dir = __dirname;
//var file = require('./common/file');
//
////promise.cmd.execAsync(delStr).then(function(err, stdout, stderr){
//    if(err) {
//        console.log('get weather api error:'+stderr);
//    } else {
//        console.log(stderr);
//        console.log("=====");
//        console.log(stdout);
//    }
//}).catch(function(err){
//    console.log(err);
//});
//
//file.getSubDirsAsync(dir, /^[^\.\s_-]\S*$/).map(function(e){
//
//    console.log(e);
//}).catch(function(err){
//    console.error(err);
//})
//;


var db = require('./common/db');
db.prepareMetaData(function(){
    //repologic.addStruct("DPPods").then(function(){
    //    return db.allAsync("SELECT * FROM repo");
    //}).then(function(repos){
    //    console.log(repos);
    //}).catch(function(err){
    //    console.log(err);
    //});


    repologic.addRepo("DPPods", "http://code.dianpingoa.com/mobile/DPPods.git").then(function(){
        return db.allAsync("SELECT * FROM repo");
    }).then(function(repo_meta){
        console.log(repo_meta);
    }).catch(function(err){
        console.log(err);
    });

    //db.allAsync("SELECT * FROM repo").then(function(data){
    //    console.log(data);
    //});
});

//var f = require("./common/file");
//f.readLines("/Users/Hayden/Project/Workspace/Node/node-podhash/data/repo/DPPods/Core/1.1.9/Core.podspec", function(err, line, isEnd){
//    console.log(line);
//    if(isEnd){
//        console.log("End");
//    }
//});

//function t (){
//    return new Promise(function(resolve, reject){
//        setTimeout(function(){
//            console.log("ttt");
//            //resolve();
//            reject();
//        }, 2000);
//    });
//}
//
//function e (){
//    return new Promise(function(resolve, reject){
//        setTimeout(function(){
//            console.log("eee");
//            resolve(2);
//        }, 1500);
//    });
//}
//
//
//promise.all([t(),e()]).then(function(i){
//    return [t(), e()];
//}).spread(function(a){
//    console.log(a +" - ");
//});

//var mname = "dd";
//var reg = new RegExp("[\"\']"+mname+"/\\S+[\"\']");
//var t = "    \"dd/dd\", 'sdfsd'";
//console.log(reg.test(t));
//
//var obj = promise.fs.readdirAsync(__dirname).map(function(e){
//    console.log(e);
//}).finally(function(){
//    console.log("ff");
//});


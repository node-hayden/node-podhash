var express = require('express');
var router = express.Router();
var project = require('../logic/project');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('project/index');
});

router.get('/depends', function(req, res, next) {
    res.render('project/depends');
});

router.post('/depends', function(req, res, next){
    var root = req.body.root;
    if(root == null || root.length==0){
        res.send({eno:1, msg:"Invalid root path!"});
        return;
    }
    var dependRoot = req.body.depend_root;
    project.getDependstForR(root, dependRoot).then(function(obj){
        res.send(obj);
    }).catch(function(err){
        res.send(err);
    });
});

router.get('/duplicate', function(req, res, next) {
    res.render('project/duplicate');
});

router.post('/duplicate', function(req, res, next){
    var root = req.body.root;
    if(root == null || root.length==0){
        res.send({eno:1, msg:"Invalid root path!"});
        return;
    }
    var ext = req.body.ext;
    var reg;
    if(ext && ext.length){
        ext = ext.replace(/\s+/g, "");
        var array = ext.split(",");
        var temp = "";
        array.forEach(function(ext){
            if(ext.length == 0) return;
            if(temp.length>0){
                temp+="|";
            }
            temp+= ("^\\S+\\."+ext+"$");
        });
        reg = temp.length ? new RegExp(temp) : /\S+/;
    }else{
        reg = /\S+/;
    }
    project.getDuplicate(root,reg).then(function(dicResult){
        res.send(dicResult);
    }).catch(function(err){
        res.send(err);
    });
});

module.exports = router;
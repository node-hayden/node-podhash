var express = require('express');
var router = express.Router();
var repo = require('../logic/repo');

router.get('/', function(req, res, next) {
    var arrayRes;
    repo.getRepoList().then(function(repos){
        arrayRes = repos != null && (repos instanceof Array) ? repos : new Array();
    }).catch(function(err){
        arrayRes = new Array();
    }).finally(function(){
        arrayRes.push({id:0, repo_name:"[+]新增Repo"});
        res.render('repo/list', {list:arrayRes});
    });
});

router.get('/detail', function(req, res, next){
    var repo_name = req.query.repo_name;
    repo_name = repo_name ? repo_name : "";
    var result;
    repo.getRepoDetail(repo_name).then(function (repos) {
        result = repos ? repos : new Array();
    }).catch(function(err){
        console.log(err);
        result = new Array();
    }).finally(function(){
        res.render("repo/detail", {repo_name:repo_name, title:"仓库"+repo_name+"模块列表",list:result});
    });
});

router.get('/mversion', function(req, res, next){
    var repo_name = req.query.repo_name;
    var module_name = req.query.module_name;
    repo_name = repo_name ? repo_name : " ";
    module_name = module_name ? module_name : " ";
    var result;
    repo.getModuleDetail(repo_name, module_name).then(function (repos) {
        result = repos ? repos : new Array();
    }).catch(function(err){
        console.log(err);
        result = new Array();
    }).finally(function(){
        res.render("repo/mversion", {title:module_name+"版本列表",list:result});
    });
});

router.get('/add', function(req, res, next){
    res.render('repo/add');
});

router.post('/add', function(req, res, next){
    var repo_name = req.body.repo_name;
    var source = req.body.repo_source;
    if(source){
        repo.addRepo(repo_name, source).then(function(){
            res.send({eno:0, msg:"添加成功!"});
        }).catch(function(err){
            res.send({eno:1, msg:JSON.stringify(err)});
        });
    }else{
        res.send({eno:1, msg:"Repo地址无效!"});
    }
});

module.exports = router;
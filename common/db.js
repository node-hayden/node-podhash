var db = require('./promise').db;

db.prepareMetaData = function(callback){
    console.log("Creating database meta data...");
    var createMockData = "CREATE TABLE IF NOT EXISTS  repo " +
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, "+
        "repo_name TEXT, "+
        "module_name TEXT, "+
        "version TEXT, "+
        "file_name TEXT,"+
        "depends TEXT)";
    db.runAsync(createMockData).then(function () {
        createMockData = "CREATE TABLE IF NOT EXISTS  repo_meta " +
            "(id INTEGER PRIMARY KEY AUTOINCREMENT, "+
            "repo_name TEXT, "+
            "repo_source TEXT,"+
            "last_update_date TEXT)";
        return db.runAsync(createMockData);
    }).catch(function(err){
        console.warn(err);
    }).finally(function(){
        callback();
    });
};

module.exports = db;
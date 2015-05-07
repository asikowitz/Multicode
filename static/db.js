var databaseURI = "localhost:5678/";
var collections =["code"];
var db = require("mongojs").connect(databaseURI,collectionos);
module.exports = db;

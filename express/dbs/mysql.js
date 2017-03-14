var mysql = require('mysql')
var config = require('../config/main')

var pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : config.database.host,
    user     : config.database.user,
    password : config.database.host,
    database : config.database.database,
    debug    : false
})
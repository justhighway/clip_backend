const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qkr0wo2gus5",
  database: "clip",
});

db.connect();

module.exports = db;

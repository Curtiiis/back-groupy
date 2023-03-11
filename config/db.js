const mysql = require("mysql");

const db = mysql.createConnection({
  host: "eu-cdbr-west-03.cleardb.net",
  user: "bbdb7c5e3fe102",
  password: "17e6d54e",
  database: "heroku_3cf69f851b9a05c",
});
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected !");
});

module.exports = db;

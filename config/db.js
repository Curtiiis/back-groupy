const mysql = require("mysql");

const db = mysql.createConnection({
  host: "eu-cdbr-west-03.cleardb.net",
  user: "bbdb7c5e3fe102",
  password: "17e6d54e",
  database: "heroku_3cf69f851b9a05c",
  // host: "eu-cdbr-west-03.cleardb.net",
  // user: "b4c110b57334ed",
  // password: "53e49e8d",
  // database: "heroku_159d15e2b75e127",
});
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected !");
});

module.exports = db;

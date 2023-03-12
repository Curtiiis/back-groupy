const mysql = require("mysql");

const db = mysql.createConnection({
  host: "eu-cdbr-west-03.cleardb.net",
  user: "b329cb1dabd306",
  password: "b2400f9c",
  database: "heroku_4e35ae0f1613967",
});
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected !");
});

setInterval(() => db.query("SELECT 1"), 30000);

module.exports = db;

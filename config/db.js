const mysql = require("mysql");

const db = mysql.createConnection({
  host: "us-cdbr-east-06.cleardb.net",
  user: "b136162cc4410f",
  password: "fa21a3bb",
  database: "heroku_f7f74de54416b25",
});
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected !");
});

setInterval(() => db.query("SELECT 1"), 30000);

module.exports = db;

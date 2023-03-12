require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected !");
});

setInterval(() => db.query("SELECT 1"), 30000);

module.exports = db;

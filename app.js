const express = require("express");
const app = express();
const mysql = require("mysql");

const port = process.env.PORT || 3000;

// Connection Details
const connection = mysql.createConnection({
  host: "eu-cdbr-west-03.cleardb.net",
  user: "b4c110b57334ed",
  password: "53e49e8d",
  database: "heroku_159d15e2b75e127",
});

// View engine
app.set("view engine", "ejs");

// Render Home Page
app.get("/", function (req, res) {
  res.send("Hello world!!!");
});

app.listen(port);
console.log(`Server is listening on port ${port}`);

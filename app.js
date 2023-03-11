const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("./config/cors");
// const db = require("./config/db");
const authRoute = require("./routes/auth.routes");

const port = process.env.PORT || 3000;

app.use(cors);
app.use(express.json());

//Initialisation des Routes
app.use("/api/auth", authRoute);

// Render Home Page
app.get("/", function (req, res) {
  res.send("Welcome to app");
  // db.query("SELECT * FROM users WHERE isActive = 1", (error, rows) => {
  //   if (error) console.log(error);
  //   res.send(rows);
  // });
});

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;

const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("./config/cors");
const path = require("path");
const authRoute = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postsRoutes = require("./routes/post.routes");
const commentRoute = require("./routes/comment.routes");

//CORS
app.use(cors);

//Bodyparser
app.use(express.json());

//Initialisation des Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comment", commentRoute);

// app.get(/.*/, function (req, res) {
//   res.sendFile(path.join(__dirname, '/dist/index.html'))
// })

app.use("/images", express.static(path.join(__dirname, "images")));

app.listen(process.env.PORT, (err) => {
  if (err) throw err;
  console.log("Server listening on port " + process.env.PORT);
});

module.exports = app;

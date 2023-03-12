const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
// const cors = require("./config/cors");
const path = require("path");
const authRoute = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postsRoutes = require("./routes/post.routes");
const commentRoute = require("./routes/comment.routes");

//CORS
app.use(
  cors({
    origin: "*",
  })
);

//Bodyparser
app.use(express.json());

//Initialisation des Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comment", commentRoute);

app.use("/images", express.static(path.join(__dirname, "images")));

const port = process.env.PORT || 3000;
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port " + port);
});

module.exports = app;

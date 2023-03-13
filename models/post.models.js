const db = require("../config/db");

const Post = function (post) {
  this.title = post.title;
  this.text = post.text;
  this.media = post.media;
  this.userId = post.userId;
};

const executeQuery = (query, data, result) => {
  db.query(query, data, (err, res) => {
    err ? result(err, null) : result(null, res);
  });
};

const PostMethods = {
  create: (data, result) => {
    const query = "INSERT INTO posts SET ?";
    executeQuery(query, data, result);
  },
  getLastByFive: (data, result) => {
    const query =
      "SELECT * FROM `posts_users` WHERE isActive = 1 ORDER BY createdAt DESC LIMIT ?";
    executeQuery(query, data, result);
  },
  getOneByPostId: (data, result) => {
    const query = "SELECT * FROM `posts_users` WHERE postId = ?";
    executeQuery(query, data, result);
  },
  getAllFromUser: (data, result) => {
    const query = "SELECT * FROM `posts_users` WHERE userId = ?";
    executeQuery(query, data, result);
  },
  getByIdAndUserId: (data, result) => {
    const query =
      "SELECT * FROM `posts` WHERE `posts`.`id` = ? AND `posts`.`userId` = ?";
    executeQuery(query, data, result);
  },
  getCount: (data, result) => {
    const query = "SELECT COUNT(id) AS posts FROM posts";
    executeQuery(query, data, result);
  },
  modify: (data, result) => {
    const query =
      "UPDATE `posts` SET title = ?, text = ? WHERE `posts`.`id` = ?";
    executeQuery(query, data, result);
  },
  delete: (data, result) => {
    const query = "DELETE FROM `posts` WHERE `posts`.`id` = ?";
    executeQuery(query, data, result);
  },
};

module.exports = { Post, PostMethods };

const executeQuery = require("../utils/functions.js");

const Comment = function (post) {
  this.userId = post.userId;
  this.postId = post.postId;
  this.text = post.text;
};

const CommentMethods = {
  create: (data, result) => {
    const query = "INSERT INTO comments SET ?";
    executeQuery(query, data, result);
  },
  getAllComments: (result) => {
    const query = "SELECT * FROM `comments_pseudo` ORDER BY createdAt DESC";
    executeQuery(query, [], result);
  },
  getByPostId: (data, result) => {
    const query =
      "SELECT * FROM `comments_pseudo` WHERE postId = ? ORDER BY createdAt DESC";
    executeQuery(query, data, result);
  },
  getByIdAndUserId: (data, result) => {
    const query =
      "SELECT userId FROM `comments` WHERE `comments`.`id` = ? AND `comments`.`userId` = ?";
    executeQuery(query, data, result);
  },
  getCount: (data, result) => {
    const query = "SELECT COUNT(id) AS comments FROM comments";
    executeQuery(query, data, result);
  },
  getCountFromUser: (data, result) => {
    const query =
      "SELECT COUNT(id) AS postsCount FROM `posts` WHERE userId = ?";
    executeQuery(query, data, result);
  },
  modify: (data, result) => {
    const query = "UPDATE `comments` SET text = ? WHERE `comments`.`id` = ?";
    executeQuery(query, data, result);
  },
  delete: (data, result) => {
    const query = "DELETE FROM `comments` WHERE `comments`.`id` = ?";
    executeQuery(query, data, result);
  },
};

module.exports = { Comment, CommentMethods };

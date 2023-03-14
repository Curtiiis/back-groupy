const executeQuery = require("../utils/functions.js");

const Like = function (post) {
  this.userId = post.userId;
  this.postId = post.postId;
};

const LikeMethods = {
  create: (data, result) => {
    const query = "INSERT INTO likes SET ?";
    executeQuery(query, data, result);
  },

  getAllLikes: (result) => {
    const query = "SELECT postId, userId FROM likes";
    executeQuery(query, null, result);
  },

  getFromUser: (data, result) => {
    const query = "SELECT userId,postId FROM users_likes WHERE postOwner = ?";
    executeQuery(query, data, result);
  },

  getOneByPostId: (data, result) => {
    const query = "SELECT userId FROM likes WHERE postId = ?";
    executeQuery(query, data, result);
  },

  getByPostIdAndUserId: (data, result) => {
    const query = "SELECT userId FROM likes WHERE postId = ? AND userId = ?";
    executeQuery(query, data, result);
  },

  getCount: (data, result) => {
    const query = "SELECT COUNT(id) AS likes FROM likes";
    executeQuery(query, data, result);
  },

  getCountFromUser: (data, result) => {
    const query = "SELECT COUNT(userId) AS likesCount FROM users_likes WHERE postOwner = ?";
    executeQuery(query, data, result);
  },

  delete: (data, result) => {
    const query = "DELETE FROM likes WHERE postId = ? AND userId = ?";
    executeQuery(query, data, result);
  },
};

module.exports = { Like, LikeMethods };

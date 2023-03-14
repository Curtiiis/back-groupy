const executeQuery = require("../utils/functions.js");

const Save = function (post) {
  this.postId = post.postId;
  this.userId = post.userId;
};

const SaveMethods = {
  create: (data, result) => {
    const query = "INSERT INTO saves SET ?";
    executeQuery(query, data, result);
  },

  getAllSaves: (result) => {
    const query = "SELECT postId, userId FROM `saves` ORDER BY createdAt DESC";
    executeQuery(query, null, result);
  },

  getOneByPostId: (data, result) => {
    const query = "SELECT userId FROM `saves` WHERE postId = ?";
    executeQuery(query, data, result);
  },

  getSavesFromUser: (data, result) => {
    const query =
      "SELECT postId, pseudo, title, media FROM `posts_saves` WHERE userId = ? ORDER BY createdAt DESC";
    executeQuery(query, data, result);
  },

  getFromUser: (data, result) => {
    const query = "SELECT userId,postId FROM `users_saves` WHERE postOwner = ?";
    executeQuery(query, data, result);
  },

  getAllFromUser: (data, result) => {
    const query = "SELECT * FROM `posts_saves` WHERE userId = ?";
    executeQuery(query, data, result);
  },

  getByPostIdAndUserId: (data, result) => {
    const query = "SELECT userId FROM `saves` WHERE postId = ? AND userId = ?";
    executeQuery(query, data, result);
  },

  delete: (data, result) => {
    const query = "DELETE FROM `saves` WHERE postId = ? AND userId = ?";
    executeQuery(query, data, result);
  },
};

module.exports = { Save, SaveMethods };

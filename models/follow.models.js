const executeQuery = require("../utils/functions.js");

const Follow = function (post) {
  this.userId = post.userId;
  this.followId = post.followId;
};

const FollowMethods = {
  create: (data, result) => {
    const query = "INSERT INTO follows SET ?";
    executeQuery(query, data, result);
  },

  isFollowed: (data, result) => {
    const query = "SELECT userId FROM `follows` WHERE userId = ? AND followId = ?";
    executeQuery(query, data, result);
  },

  getAllFollows: (result) => {
    const query = "SELECT userId, followId FROM `follows`";
    executeQuery(query, null, result);
  },

  getFollowsFromUser: (data, result) => {
    const query = "SELECT userId, followId FROM `follows` WHERE followId = ?";
    executeQuery(query, data, result);
  },

  getWholeFollowersFromUser: (data, result) => {
    const query = "SELECT userId, picture, pseudo FROM `users_follows` WHERE followId = ?";
    executeQuery(query, data, result);
  },

  delete: (data, result) => {
    const query = "DELETE FROM `follows` WHERE userId = ? AND followId = ?";
    executeQuery(query, data, result);
  },
};

module.exports = { Follow, FollowMethods };

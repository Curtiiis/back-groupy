const { queryDB } = require("../utils/functions.js");

class Follow {
  constructor(post) {
    this.userId = post.userId;
    this.followId = post.followId;
  }

  static create(newFollow, result) {
    queryDB("INSERT INTO follows SET ?", newFollow, result);
  }

  static isFollowed(data, result) {
    queryDB("SELECT userId FROM `follows` WHERE userId = ? AND followId = ?", data, result);
  }

  static getAllFollows(result) {
    queryDB("SELECT userId, followId FROM `follows`", null, result);
  }

  static getFollowsFromUser(data, result) {
    queryDB("SELECT userId, followId FROM `follows` WHERE followId = ?", data, result);
  }

  static getWholeFollowersFromUser(data, result) {
    queryDB("SELECT userId, picture, pseudo FROM `users_follows` WHERE followId = ?", data, result);
  }

  static delete(data, result) {
    queryDB("DELETE FROM `follows` WHERE userId = ? AND followId = ?", data, result);
  }
}

module.exports = Follow;

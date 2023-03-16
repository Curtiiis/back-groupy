const { queryDB } = require("../utils/functions.js");

class Like {
  constructor(post) {
    this.userId = post.userId;
    this.postId = post.postId;
  }

  static create(data, result) {
    queryDB("INSERT INTO likes SET ?", data, result);
  }

  static getAllLikes(result) {
    queryDB("SELECT postId, userId FROM `likes`", null, result);
  }

  static getFromUser(data, result) {
    queryDB("SELECT userId FROM `users_likes` WHERE postOwner = ?", data, result);
  }

  static getOneByPostId(data, result) {
    queryDB("SELECT userId FROM `likes` WHERE postId = ?", data, result);
  }

  static getByPostIdAndUserId(data, result) {
    queryDB("SELECT userId FROM `likes` WHERE postId = ? AND userId = ?", data, result);
  }

  static getCount(data, result) {
    queryDB("SELECT COUNT(id) AS likes FROM likes", data, result);
  }

  static getCountFromUser(data, result) {
    queryDB(
      "SELECT COUNT(userId) AS likesCount FROM `users_likes` WHERE postOwner = ?",
      data,
      result
    );
  }

  static delete(data, result) {
    queryDB("DELETE FROM `likes` WHERE postId = ? AND userId = ?", data, result);
  }
}

module.exports = Like;

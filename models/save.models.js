const queryDB = require("../utils/functions");

class Save {
  constructor(post) {
    this.postId = post.postId;
    this.userId = post.userId;
  }

  static create(data, result) {
    queryDB("INSERT INTO saves SET ?", data, result);
  }

  static getAllSaves(result) {
    queryDB("SELECT postId, userId FROM `saves` ORDER BY createdAt DESC", [], result);
  }

  static getOneByPostId(data, result) {
    queryDB("SELECT userId FROM `saves` WHERE postId = ?", data, result);
  }

  static getSavesFromUser(data, result) {
    queryDB(
      "SELECT postId,pseudo,title,media FROM `posts_saves` WHERE userId = ? ORDER BY createdAt DESC",
      data,
      result
    );
  }

  static getFromUser(data, result) {
    queryDB("SELECT userId FROM `users_saves` WHERE postOwner = ?", data, result);
  }

  static getByPostIdAndUserId(data, result) {
    queryDB("SELECT userId FROM `saves` WHERE postId = ? AND userId = ?", data, result);
  }

  static getFromUser(data, result) {
    queryDB("SELECT * FROM `posts_saves` WHERE userId = ?", data, result);
  }

  static delete(data, result) {
    queryDB("DELETE FROM `saves` WHERE postId = ? AND userId = ?", data, result);
  }
}

module.exports = Save;

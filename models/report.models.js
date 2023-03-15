const queryDB = require("../utils/functions");

class Report {
  constructor(post) {
    this.postId = post.postId;
    this.userId = post.userId;
  }

  static create(data, result) {
    queryDB("INSERT INTO `reports` SET ?", data, result);
  }

  static getAll(result) {
    queryDB("SELECT * FROM `posts_reports` ORDER BY createdAt DESC", [], result);
  }

  static getByPostIdAndUserId(data, result) {
    queryDB("SELECT userId FROM `reports` WHERE postId = ? AND userId = ?", data, result);
  }

  static delete(data, result) {
    queryDB("DELETE FROM `reports` WHERE postId = ?", data, result);
  }
}

module.exports = Report;

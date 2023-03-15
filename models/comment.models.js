const queryDB = require("../utils/functions.js");

class Comment {
  constructor(post) {
    this.userId = post.userId;
    this.postId = post.postId;
    this.text = post.text;
  }

  static create(data, result) {
    queryDB("INSERT INTO `comments` SET ?", data, result);
  }

  static getAllComments(result) {
    queryDB("SELECT * FROM `comments_pseudo` ORDER BY createdAt DESC", null, result);
  }

  static getByPostId(data, result) {
    queryDB(
      "SELECT * FROM `comments_pseudo` WHERE postId = ? ORDER BY createdAt DESC",
      data,
      result
    );
  }

  static getByIdAndUserId(data, result) {
    queryDB(
      "SELECT userId FROM `comments` WHERE `comments`.`id` = ? AND `comments`.`userId` = ?",
      data,
      result
    );
  }

  static getCount(data, result) {
    queryDB("SELECT COUNT(id) AS comments FROM comments", data, result);
  }

  static getCountFromUser(data, result) {
    queryDB("SELECT COUNT(id) AS postsCount FROM `posts` WHERE userId = ?", data, result);
  }

  static modify(data, result) {
    queryDB("UPDATE `comments` SET text = ? WHERE `comments`.`id` = ?", data, result);
  }

  static delete(data, result) {
    queryDB("DELETE FROM `comments` WHERE `comments`.`id` = ?", data, result);
  }
}

module.exports = Comment;

const { queryDB } = require("../utils/functions.js");

class Post {
  constructor(post) {
    this.title = post.title;
    this.text = post.text;
    this.media = post.media;
    this.userId = post.userId;
  }

  static create(data, result) {
    queryDB("INSERT INTO posts SET ?", data, result);
  }

  static getLastByFive(data, result) {
    queryDB(
      "SELECT * FROM `posts_users` WHERE isActive = 1 ORDER BY createdAt DESC LIMIT ?",
      data,
      result
    );
  }

  static getOneByPostId(data, result) {
    queryDB("SELECT * FROM `posts_users` WHERE postId = ?", data, result);
  }

  static getAllFromUser(data, result) {
    queryDB("SELECT * FROM `posts_users` WHERE userId = ?", data, result);
  }

  static getByIdAndUserId(data, result) {
    queryDB("SELECT * FROM `posts` WHERE id = ? AND userId = ?", data, result);
  }

  static getCount(data, result) {
    queryDB("SELECT COUNT(id) AS posts FROM posts", data, result);
  }

  static modify(data, result) {
    queryDB("UPDATE `posts` SET title = ?, text = ? WHERE id = ?", data, result);
  }

  static delete(data, result) {
    queryDB("DELETE FROM `posts` WHERE `posts`.`id` = ?", data, result);
  }
}

module.exports = Post;

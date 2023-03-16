const { queryDB } = require("../utils/functions.js");

class Picture {
  constructor(post) {
    this.profilePicture = post.profilePicture;
    this.userId = post.userId;
  }

  static update(data, result) {
    queryDB("UPDATE `users` SET `picture` = ? WHERE `users`.`id` = ?", data, result);
  }
}

module.exports = Picture;

const queryDB = require("../utils/functions");

class Password {
  constructor(user) {
    this.password = user.password;
  }

  static update(newPassword, result) {
    queryDB("UPDATE `users` SET `password` = ? WHERE `users`.`id` = ?", newPassword, result);
  }
}

module.exports = Password;

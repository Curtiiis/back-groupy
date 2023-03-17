const { queryDB } = require("../utils/functions.js");

class User {
  constructor(user) {
    this.pseudo = user.pseudo;
    this.email = user.email;
    this.password = user.password;
  }

  static create(data, result) {
    queryDB("INSERT INTO `users` SET ?", data, result);
  }

  static isUnique(data, result) {
    queryDB(
      "SELECT SUM (CASE WHEN pseudo = ? THEN 1 ELSE 0 END) AS pseudo, SUM (CASE WHEN email = ? THEN 1 ELSE 0 END) AS email FROM users",
      data,
      (err, res) => {
        result(err, !(err || res[0].pseudo !== 0 || res[0].email !== 0));
      }
    );
  }

  static getAllActives(result) {
    queryDB(
      "SELECT id AS userId,pseudo,picture,isAdmin,isActive FROM `users` WHERE isActive = 1",
      null,
      result
    );
  }

  static getUserByEmail(data, result) {
    queryDB(
      "SELECT id AS userId,password,email,isAdmin,isActive FROM `users` WHERE email = ?",
      data,
      (err, res) => {
        if (err || res.length === 0) return result(err, null);
        if (res[0].isActive == 0) return result(null, res[0].isActive);
        result(null, res[0]);
      }
    );
  }

  static getUserById(userId, result) {
    queryDB("SELECT id,picture,pseudo,isAdmin FROM users WHERE id = ?", [userId], (err, res) => {
      result(err, err || res.length === 0 ? false : res[0]);
    });
  }

  static getCurrent(data, result) {
    queryDB(
      "SELECT id AS userId, pseudo,picture,email,isAdmin,isActive FROM `users` WHERE `users`.`id` = ?",
      data,
      result
    );
  }

  static getByPseudo(data, result) {
    queryDB(
      "SELECT id AS userId,picture,pseudo FROM `users` WHERE id <> ? AND pseudo like ?",
      data,
      result
    );
  }

  static getUsersStats(data, result) {
    queryDB(
      `SELECT COUNT(id) AS users, 
      SUM (CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS users_actives, 
      SUM (CASE WHEN isActive = 0 THEN 1 ELSE 0 END) AS users_disabled, 
      SUM (CASE WHEN isAdmin = 1 THEN 1 ELSE 0 END) AS status_admins, 
      SUM (CASE WHEN isAdmin = 0 THEN 1 ELSE 0 END) AS status_users 
      FROM users`,
      data,
      result
    );
  }

  static getSuggestions(data, result) {
    queryDB(
      "SELECT DISTINCT userId,picture,pseudo FROM `users_follows` WHERE userId <> ? AND isActive = 1 ORDER BY RAND() LIMIT 5",
      data,
      result
    );
  }

  static changeForUserStatus(data, result) {
    queryDB("UPDATE users SET isAdmin = 0 WHERE id = ?", data, result);
  }

  static changeForAdminStatus(data, result) {
    queryDB("UPDATE users SET isAdmin = 1 WHERE id = ?", data, result);
  }

  static disableUser(data, result) {
    queryDB("UPDATE users SET isActive = 0 WHERE id = ?", data, result);
  }
}

module.exports = User;

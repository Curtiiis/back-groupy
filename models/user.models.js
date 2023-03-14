const db = require("../config/db");
const executeQuery = require("../utils/functions.js");

const User = function (user) {
  this.pseudo = user.pseudo;
  this.email = user.email;
  this.password = user.password;
};

const UserMethods = {
  create: (data, result) => {
    const query = "INSERT INTO users SET ?";
    executeQuery(query, data, result);
  },
  getCurrent: (data, result) => {
    const query =
      "SELECT id AS userId, pseudo, picture, email, isAdmin, isActive FROM users WHERE users.id = ?";
    executeQuery(query, data, result);
  },
  getByPseudo: (data, result) => {
    const query =
      "SELECT id AS userId, picture, pseudo FROM users WHERE id <> ? AND pseudo LIKE ?";
    executeQuery(query, data, result);
  },
  getUsersStats: (data, result) => {
    const query =
      "SELECT COUNT(id) AS users, SUM (CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS users_actives, SUM (CASE WHEN isActive = 0 THEN 1 ELSE 0 END) AS users_disabled, SUM (CASE WHEN isAdmin = 1 THEN 1 ELSE 0 END) AS status_admins, SUM (CASE WHEN isAdmin = 0 THEN 1 ELSE 0 END) AS status_users FROM users";
    executeQuery(query, data, result);
  },
  getSuggestions: (data, result) => {
    const query =
      "SELECT DISTINCT userId, picture, pseudo FROM users_follows WHERE userId <> ? AND isActive = 1 ORDER BY RAND() LIMIT 5";
    executeQuery(query, data, result);
  },
  changeForUserStatus: (data, result) => {
    const query = "UPDATE users SET isAdmin = 0 WHERE id = ?";
    executeQuery(query, data, result);
  },
  changeForAdminStatus: (data, result) => {
    const query = "UPDATE users SET isAdmin = 1 WHERE id = ?";
    executeQuery(query, data, result);
  },
  disableUser: (data, result) => {
    const query = "UPDATE users SET isActive = 0 WHERE id = ?";
    executeQuery(query, data, result);
  },
};

User.isUnique = (data, result) => {
  db.query(
    "SELECT COUNT(*) AS count FROM users WHERE pseudo = ? OR email = ?",
    data,
    (err, res) => {
      err || res[0].count !== 0 ? result(err, false) : result(null, true);
    }
  );
};

User.getAllActives = (result) => {
  db.query(
    "SELECT id AS userId,pseudo,picture,isAdmin,isActive FROM `users` WHERE isActive = 1",
    (err, res) => {
      err ? result(err, null) : result(null, res);
    }
  );
};

User.getUserByEmail = (data, result) => {
  db.query(
    "SELECT id AS userId,password,email,isAdmin,isActive FROM `users` WHERE email = ?",
    data,
    (err, res) => {
      if (err) {
        return result(err, null);
      }
      if (res.length === 0) {
        return result(null, null);
      }
      if (res[0].isActive == 0) {
        return result(null, res[0].isActive);
      }
      return result(null, res[0]);
    }
  );
};

User.getUserById = (data, result) => {
  db.query(
    "SELECT id,picture,pseudo,isAdmin FROM users WHERE id = ?",
    data,
    (err, res) => {
      err || res.length === 0 ? result(err, false) : result(null, res[0]);
    }
  );
};

module.exports = { User, UserMethods };

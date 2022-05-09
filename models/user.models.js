const db = require('../config/db');

const User = function (user) {
  this.email = user.email,
    this.pseudo = user.pseudo,
    this.password = user.password,
    this.isAdmin = false,
    this.isActive = true
}

User.create = (newUser, result) => {
  db.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length === 0) {
      result(null, null);
      return;
    }
    result(null, { newUser })
  });
};

User.getUserByEmail = (email, result) => {
  db.query("SELECT id,pseudo,password,picture,email,isAdmin,isActive FROM users WHERE email = ?", email, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length === 0) {
      result(null, null);
      return;
    }
    result(null, res[0])
  })
};

User.getUserById = (userId, result) => {
  db.query("SELECT id, picture, pseudo FROM users WHERE id = ?", userId, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length === 0) {
      result(null, null);
      return;
    }
    result(null, res[0])
  })
};

module.exports = User;


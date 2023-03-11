const db = require('../config/db');

const Save = function (post) {
  this.postId = post.postId;
  this.userId = post.userId;
}

Save.create = (data, result) => {
  db.query("INSERT INTO saves SET ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, data)
  });
};

Save.getAllSaves = (result) => {
  db.query("SELECT postId, userId FROM `saves` ORDER BY createdAt DESC", (err, res) => {
    if (err) { return result(err, null) };
    if (res.length === 0) { return result(null, null) };
    return result(null, res)
  })
};

Save.getOneByPostId = (data, result) => {
  db.query("SELECT userId FROM `saves` WHERE postId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Save.getSavesFromUser = (data, result) => {
  db.query("SELECT postId,pseudo,title,media FROM `posts_saves` WHERE userId = ? ORDER BY createdAt DESC", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Save.getFromUser = (data, result) => {
  db.query("SELECT userId FROM `users_saves` WHERE postOwner = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Save.getByPostIdAndUserId = (data, result) => {
  db.query("SELECT userId FROM `saves` WHERE postId = ? AND userId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Save.getFromUser = (data, result) => {
  db.query("SELECT * FROM `posts_saves` WHERE userId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Save.delete = (data, result) => {
  db.query("DELETE FROM `saves` WHERE postId = ? AND userId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

module.exports = Save;

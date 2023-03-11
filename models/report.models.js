const db = require('../config/db');

const Report = function (post) {
  this.postId = post.postId;
  this.userId = post.userId;
}

Report.create = (data, result) => {
  db.query("INSERT INTO `reports` SET ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Report.getAll = (result) => {
  db.query("SELECT * FROM `posts_reports` ORDER BY createdAt DESC", (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Report.getByPostIdAndUserId = (data, result) => {
  db.query("SELECT userId FROM `reports` WHERE postId = ? AND userId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Report.delete = (data, result) => {
  db.query("DELETE FROM `reports` WHERE postId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

module.exports = Report;

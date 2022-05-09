const db = require('../config/db');

const Report = function (post) {
  this.postId = post.postId,
    this.userId = post.userId
}

Report.create = (newReport, result) => {
  db.query("INSERT INTO `reports` SET ?", newReport, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, newReport)
  });
};

module.exports = Report;

const db = require('../config/db');

const Comment = function (post) {
  this.userId = post.userId,
    this.postId = post.postId,
    this.text = post.text
}

Comment.create = (data, result) => {
  db.query("INSERT INTO `comments` SET ?", data, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, data)
  });
};

module.exports = Comment;

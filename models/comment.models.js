const db = require('../config/db');

const Comment = function (post) {
  this.userId = post.userId;
  this.postId = post.postId;
  this.text = post.text;
}

Comment.create = (data, result) => {
  db.query("INSERT INTO `comments` SET ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, data)
  })
};

Comment.getAllComments = (result) => {
  db.query("SELECT * FROM `comments_pseudo` ORDER BY createdAt DESC", (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Comment.getByPostId = (data, result) => {
  db.query("SELECT * FROM `comments_pseudo` WHERE postId = ? ORDER BY createdAt DESC", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Comment.getByIdAndUserId = (data, result) => {
  db.query("SELECT userId FROM `comments` WHERE `comments`.`id` = ? AND `comments`.`userId` = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Comment.getCount = (data, result) => {
  db.query("SELECT COUNT(id) AS comments FROM comments", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Comment.getCountFromUser = (data, result) => {
  db.query("SELECT COUNT(id) AS postsCount FROM `posts` WHERE userId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Comment.modify = (data, result) => {
  db.query("UPDATE `comments` SET text = ? WHERE `comments`.`id` = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Comment.delete = (data, result) => {
  db.query("DELETE FROM `comments` WHERE `comments`.`id` = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

module.exports = Comment;

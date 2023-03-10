const db = require('../config/db');

const Post = function (post) {
  this.title = post.title;
  this.text = post.text;
  this.media = post.media;
  this.userId = post.userId;
}

Post.create = (data, result) => {
  db.query("INSERT INTO posts SET ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Post.getLastByFive = (data, result) => {
  db.query("SELECT * FROM `posts_users` WHERE isActive = 1 ORDER BY createdAt DESC LIMIT ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Post.getOneByPostId = (data, result) => {
  db.query("SELECT * FROM `posts_users` WHERE postId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Post.getAllFromUser = (data, result) => {
  db.query("SELECT * FROM `posts_users` WHERE userId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Post.getByIdAndUserId = (data, result) => {
  db.query("SELECT * FROM `posts` WHERE `posts`.`id` = ? AND `posts`.`userId` = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Post.getCount = (data, result) => {
  db.query("SELECT COUNT(id) AS posts FROM posts", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Post.modify = (data, result) => {
  db.query("UPDATE `posts` SET title = ?, text = ? WHERE `posts`.`id` = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Post.delete = (data, result) => {
  db.query("DELETE FROM `posts` WHERE `posts`.`id` = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

module.exports = Post;

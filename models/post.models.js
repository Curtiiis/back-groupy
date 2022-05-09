const db = require('../config/db');

const Post = function (post) {
  this.title = post.title,
    this.text = post.text,
    this.media = post.media,
    this.userId = post.userId
}

Post.create = (newPost, result) => {
  db.query("INSERT INTO posts SET ?", newPost, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, newPost)
  });
};

// Post.update = (data, result) => {
//   db.query("UPDATE `posts` SET title = ?, text = ?, media = ? WHERE `posts`.`id` = ?", data, (err, res) => {
//     if (err) {
//       result(err, null);
//       return;
//     }
//     result(null, data)
//   });
// };

module.exports = Post;

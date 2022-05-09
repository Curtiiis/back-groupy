const db = require('../config/db');

const Picture = function (post) {
  this.profilePicture = post.profilePicture
  this.userId = post.userId
}

Picture.update = (data, result) => {
  db.query("UPDATE `users` SET `picture` = ? WHERE `users`.`id` = ?", data, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, data)
  });
};

module.exports = Picture;

const db = require('../config/db');

const Follow = function (post) {
  this.userId = post.userId;
  this.followId = post.followId;
}

Follow.create = (newFollow, result) => {
  db.query("INSERT INTO follows SET ?", newFollow, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  });
};

Follow.isFollowed = (data, result) => {
  db.query("SELECT userId FROM `follows` WHERE userId = ? AND followId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Follow.getAllFollows = (result) => {
  db.query("SELECT userId, followId FROM `follows`", (err, res) => {
    if (err) { return result(err, null) };
    if (res.length === 0) { return result(null, null) };
    return result(null, res)
  })
};

Follow.getFollowsFromUser = (data, result) => {
  db.query("SELECT userId, followId FROM `follows` WHERE followId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Follow.getWholeFollowersFromUser = (data, result) => {
  db.query("SELECT userId,picture,pseudo FROM `users_follows` WHERE followId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

Follow.delete = (data, result) => {
  db.query("DELETE FROM `follows` WHERE userId = ? AND followId = ?", data, (err, res) => {
    (err) ? result(err, null) : result(null, res)
  })
};

module.exports = Follow;

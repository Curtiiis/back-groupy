require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Follow = require('../models/follow.models');
const Picture = require('../models/picture.models');
const Password = require('../models/password.models');

// GET
exports.getAllUsers = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  db.query(
    "SELECT id AS userId,pseudo,picture,isAdmin,isActive FROM `users` WHERE isActive = 1", (err, data) => {
      let dataArray = data;
      if (err) throw err
      for (let item of dataArray) {
        item.link = item.pseudo.toLowerCase().replace(" ", "-")
      }
      res.status(200).json(dataArray)
    })
};

exports.getOneUser = (req, res) => {
  const userIdAuth = req.auth.userId;
  const values = [req.params.id]
  db.query("SELECT * FROM `posts_users` WHERE userId = ?", values, (err, data) => {
    let dataArray = data;
    if (err) throw err
    if (dataArray == '') {
      db.query("SELECT pseudo FROM `users` WHERE id = ?", values, (err, data) => {
        if (err) throw err
        dataArray = data[0]
        res.status(202).json(dataArray)
      })
    } else {
      db.query("SELECT userId FROM `users_likes` WHERE postOwner = ?", values, (err, dataLikes) => {
        if (err) throw err
        db.query("SELECT userId FROM `users_saves` WHERE postOwner = ?", values, (err, dataSaves) => {
          if (err) throw err
          db.query("SELECT userId FROM `follows` WHERE followId = ?", values, (err, dataFollows) => {
            if (err) throw err
            db.query("SELECT postId, pseudo, createdAt, text FROM `comments_pseudo` ORDER BY createdAt DESC",
              (err, dataComments) => {
                if (err) throw err
                for (let item of dataArray) {
                  item.likes = dataLikes.map(y => y.userId).length
                  item.liked = dataLikes.map(y => y.userId).includes(userIdAuth)
                  item.saves = dataSaves.map(y => y.userId).length
                  item.saved = dataSaves.map(y => y.userId).includes(userIdAuth)
                  item.follows = dataFollows.map(y => y.userId).length
                  item.followed = dataFollows.map(y => y.userId).includes(userIdAuth)
                  item.link = item.pseudo.toLowerCase().replace(" ", "-")
                  item.notMyself = item.userId != userIdAuth
                  let commentsArray = dataComments.filter(x => x.postId == item.postId)
                  item.comments = commentsArray
                  item.commentsCount = commentsArray.length
                  item.commentText = "";

                  for (let comment of commentsArray) {
                    comment.updating = false;
                    comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt)
                  }
                }
                res.json(dataArray)
              })
          })
        })
      })
    }
  })
};

exports.searchUser = (req, res) => {
  let sql = "SELECT id AS userId,picture,pseudo FROM `users` WHERE id <> ? AND pseudo like ?";
  let values = [req.auth.userId, `${req.params.id}%`]

  db.query(sql, values, (err, data) => {
    if (err) throw err
    let dataArray = data;

    for (let item of dataArray) {
      item.link = item.pseudo.toLowerCase().replace(" ", "-")
    }

    res.status(200).json(data)
  })
};

exports.getCurrentUser = (req, res) => {
  if (req.params.id != req.auth.userId && req.auth.isAdmin == 0) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  let values = [req.auth.userId];
  db.query(
    "SELECT id AS userId, pseudo,picture,email,isAdmin,isActive FROM `users` WHERE `users`.`id` = ?",
    values,
    (err, dataUser) => {
      if (err) throw err
      db.query(
        "SELECT userId FROM `follows` WHERE followId = ?",
        values, (err, dataFollowers) => {
          if (err) throw err
          db.query(
            "SELECT postId,pseudo,title,media FROM `posts_saves` WHERE userId = ? ORDER BY createdAt DESC",
            values, (err, dataSaves) => {
              if (err) throw err
              db.query(
                "SELECT COUNT(userId) AS likesCount FROM `users_likes` WHERE postOwner = ?",
                values, (err, dataLikes) => {
                  if (err) throw err
                  db.query(
                    "SELECT COUNT(id) AS postsCount FROM `posts` WHERE userId = ?",
                    values, (err, dataPosts) => {
                      if (err) throw err

                      let userInfos = {
                        ...dataUser[0],
                        email: dataUser[0].email,
                        followers: dataFollowers.map(x => x.userId),
                        followersCount: dataFollowers.map(x => x.userId).length,
                        likes: dataLikes[0].likesCount,
                        link: dataUser[0].pseudo.toLowerCase().replace(" ", "-"),
                        picture: dataUser[0].picture,
                        posts: dataPosts[0].postsCount,
                        pseudo: dataUser[0].pseudo,
                        userId: dataUser[0].userId
                      };
                      res.status(200).json({ userInfos: userInfos, dataSaves, dataSaves })
                    })
                })
            })
        })
    })
};

exports.getfollowers = (req, res, next) => {
  db.query("SELECT userId,picture,pseudo FROM `users_follows` WHERE followId = ?",
    [req.auth.userId], (err, data) => {
      let dataFollowers = data;
      if (err) throw err
      db.query("SELECT userId, followId FROM `follows`",
        (err, dataFollows) => {
          if (err) throw err
          for (let item of dataFollowers) {
            item.link = item.pseudo.toLowerCase().replace(" ", "-")
            item.followed = dataFollows
              .filter(x => x.followId == item.userId)
              .map(y => y.userId)
              .includes(req.auth.userId)
          }
          res.status(200).json(dataFollowers)
        })
    })
}

exports.getSuggestions = (req, res, next) => {
  if (req.params.id != req.auth.userId && req.auth.isAdmin == 0) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  db.query(
    "SELECT DISTINCT userId,picture,pseudo FROM `users_follows` WHERE userId <> ? ORDER BY RAND() LIMIT 5",
    [req.auth.userId],
    (err, data) => {
      let dataUsers = data;
      if (err) {
        return res.status(400).json({ err, message: 'Bad request !' });
      }

      db.query("SELECT userId, followId FROM `follows`",
        (err, dataFollows) => {
          if (err) throw err
          for (let item of dataUsers) {
            let followsArray = dataFollows
              .filter(x => x.followId == item.userId)
              .map(y => y.userId)
            item.followed = followsArray.includes(Number(req.auth.userId))
            item.link = item.pseudo.toLowerCase().replace(" ", "-")
          }
          res.status(200).json(dataUsers)
        })
    })
}

// POST
exports.followUser = (req, res, next) => {
  db.query(
    "SELECT userId FROM `follows` WHERE userId = ? AND followId = ?",
    [req.auth.userId, req.params.id],
    (err, data) => {
      if (err) throw err
      let hasBeenFollowed = Object.keys(data).length > 0
      if (hasBeenFollowed) {
        db.query(
          "DELETE FROM `follows` WHERE userId = ? AND followId = ?",
          [req.auth.userId, req.params.id],
          (err, data) => {
            if (err) throw err
            res.status(200).json({ message: 'Follow retiré !' });
          })
      } else {
        const followInfo = new Follow({
          userId: req.auth.userId,
          followId: req.params.id
        });
        Follow.create(followInfo, (err, data) => {
          if (err) throw err
          res.status(201).json({ message: 'Follow ajouté !' });
        });
      }
    })
};

// PUT
exports.changePassword = (req, res, next) => {
  bcrypt.hash(req.body.password, 3)
    .then(hash => {

      let values = [hash, req.auth.userId]
      Password.update(values, (err, data) => {
        if (err) {
          //console.log(err)
          return res.status(400).json(err)
        }
        res.status(201).json(data);
      })
    })
    .catch(error => { return res.status(500).json({ error }) })
};

exports.updatePicture = (req, res, next) => {
  db.query(
    "SELECT id AS userId,picture FROM `users` WHERE `users`.`id` = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(400).json({ message: 'Error in request !' });
      }
      if (data[0].userId != req.auth.userId && req.auth.isAdmin == 0) {
        res.status(403).json({ message: 'Unauthorized request !' });
      } else {
        const filename = data[0].picture.split('/images/')[1]
        if (filename != 'pp-d1.png') {
          fs.unlinkSync(`images/${filename}`);
        }
        Picture.update(
          [`${req.protocol}://${req.get('host')}/images/${req.file.filename}`, req.auth.userId], (err, picture) => {
            if (err) {
              //console.log(err)
              return res.status(400).json(err)
            }
            res.status(200).json(picture[0]);
          })
      }
    })
};

exports.disableUser = (req, res, next) => {
  db.query(
    "SELECT isActive FROM `users` WHERE `users`.`id` = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(400).json({ message: 'Bad request !' });
      }
      if (data[0].userId != req.auth.userId && req.auth.isAdmin == 0) {
        return res.status(403).json({ message: 'Unauthorized request !' });
      }
      db.query(
        'UPDATE users SET isActive = 0 WHERE id = ?',
        [req.params.id],
        (err, response) => {
          if (err) throw err;
          res.status(200).json(response)
        })
    })
};

exports.changeAdminStatus = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  db.query(
    "SELECT isAdmin FROM `users` WHERE `users`.`id` = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(400).json({ message: 'Bad request !' });
      }
      let isAdmin = data[0].isAdmin == 1;
      if (isAdmin) {
        db.query(
          `UPDATE users SET isAdmin = 0 WHERE id = ?`,
          [req.params.id],
          (err, response) => {
            if (err) throw err;
            res.status(200).json(response)
          })
      } else {
        db.query(
          `UPDATE users SET isAdmin = 1 WHERE id = ?`,
          [req.params.id],
          (err, response) => {
            if (err) throw err;
            res.status(201).json(response)
          })
      }
    })
};
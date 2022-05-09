require('dotenv').config();
const db = require('../config/db');
const fs = require('fs');
const Post = require('../models/post.models');
const Like = require('../models/like.models');
const Save = require('../models/save.models');
const Report = require('../models/report.models');

// CRUD POSTS
exports.createPost = (req, res, next) => {
  if (!req.file && req.body.title == '' && req.body.text == '') {
    return res.status(400).json({ message: 'Empty body !' })
  }

  if (req.file) {
    const post = new Post({
      userId: req.auth.userId,
      title: req.body.title,
      text: req.body.text,
      media: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    Post.create(post, (err, data) => {
      if (err) throw err
      return res.status(201).json({ message: 'Post created !' });
    })
  } else {
    const post = new Post({
      userId: req.auth.userId,
      title: req.body.title,
      text: req.body.text
    });
    Post.create(post, (err, data) => {
      if (err) throw err
      return res.status(201).json({ message: 'Post created !' });
    })
  }
};

exports.getAllPosts = (req, res, next) => {
  const userIdAuth = req.auth.userId;

  db.query("SELECT * FROM `posts_users` ORDER BY createdAt DESC", (err, data) => {
    let dataArray = data;
    if (err) throw err
    db.query("SELECT postId,userId FROM `likes`", (err, dataLikes) => {
      if (err) throw err
      db.query("SELECT postId, userId FROM `saves`", (err, dataSaves) => {
        if (err) throw err
        db.query("SELECT userId, followId FROM `follows`", (err, dataFollows) => {
          if (err) throw err
          db.query("SELECT * FROM `comments_pseudo` ORDER BY createdAt DESC", (err, dataComments) => {
            if (err) throw err
            for (let item of dataArray) {
              item.notMyself = item.userId != userIdAuth
              item.link = item.pseudo.toLowerCase().replace(" ", "-")
              item.updated = Number(item.createdAt) !== Number(item.updatedAt)
              let likesArray = dataLikes.filter(x => x.postId == item.postId).map(y => y.userId)
              item.likes = likesArray.length
              item.liked = likesArray.includes(userIdAuth)
              let savesArray = dataSaves.filter(x => x.postId == item.postId).map(y => y.userId)
              item.saves = savesArray.length
              item.saved = savesArray.includes(userIdAuth)
              let followsArray = dataFollows.filter(x => x.followId == item.userId).map(y => y.userId)
              item.follows = followsArray
              item.followed = followsArray.includes(userIdAuth)
              let commentsArray = dataComments.filter(x => x.postId == item.postId)
              item.comments = commentsArray
              item.commentsCount = commentsArray.length
              item.commentText = "";

              for (let comment of commentsArray) {
                comment.updating = false;
                comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt)
              }
            }
            res.status(200).json(dataArray)
          })
        })
      })
    })
  })
};

exports.getOnePost = (req, res) => {
  const userIdAuth = req.auth.userId;
  let values = req.params.id;

  db.query("SELECT * FROM `posts_users` WHERE postId = ?", values, (err, data) => {
    if (err) throw err
    db.query("SELECT userId FROM `likes` WHERE postId = ?", values, (err, dataLikes) => {
      if (err) throw err
      db.query("SELECT userId FROM `saves` WHERE postId = ?", values, (err, dataSaves) => {
        if (err) throw err
        db.query("SELECT userId, followId FROM `follows` WHERE followId = ?", userIdAuth, (err, dataFollows) => {
          if (err) throw err
          db.query("SELECT * FROM `comments_pseudo` WHERE postId = ? ORDER BY createdAt DESC", values,
            (err, dataComments) => {
              if (err) throw err
              for (let comment of dataComments) {
                comment.updating = false;
                comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt)
              }

              let onePost = {
                ...data[0],
                link: data[0].pseudo.toLowerCase().replace(" ", "-"),
                updated: Number(data[0].createdAt) !== Number(data[0].updatedAt),
                likes: dataLikes.length,
                liked: dataLikes.map(x => x.userId).includes(userIdAuth),
                saves: dataSaves.length,
                saved: dataSaves.map(x => x.userId).includes(userIdAuth),
                follows: dataFollows,
                followed: dataFollows.map(x => x.userId).includes(userIdAuth),
                notMyself: data[0].userId != userIdAuth,
                comments: dataComments,
                commentsCount: dataComments.length,
                commentText: ""
              }
              res.status(200).json([onePost])
            })
        })
      })
    })
  })
};

exports.modifyPost = (req, res, next) => {
  db.query(
    "SELECT userId,media FROM `posts` WHERE `posts`.`id` = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        return res.status(400).json({ message: 'Bad request !' });
      }
      if (data[0].userId != req.auth.userId && req.auth.isAdmin == 0) {
        return res.status(403).json({ message: 'Unauthorized request !' });
      }

      db.query(
        "UPDATE `posts` SET title = ?, text = ? WHERE `posts`.`id` = ?",
        [req.body.title, req.body.text, req.params.id],
        (err, response) => {
          if (err) throw err;
          res.status(200).json(response)
        })
    })
};

exports.deletePost = (req, res, next) => {
  let values = [req.params.id]
  db.query(
    "SELECT userId,media FROM `posts` WHERE id = ?",
    values,
    (err, data) => {
      if (err) {
        return res.status(400).json({ message: 'Error in request !' });
      }
      if (data[0].userId != req.auth.userId && req.auth.isAdmin == 0) {
        res.status(403).json({ message: 'Unauthorized request !' });
      } else {
        if (data[0].media != null) {
          const filename = data[0].media.split('/images/')[1]
          db.query(
            "DELETE FROM `posts` WHERE id = ?",
            values,
            (err, data) => {
              if (err) throw err
              fs.unlinkSync(`images/${filename}`);
              res.status(200).json({ message: 'Post deleted !' });
            })
        } else {
          db.query(
            "DELETE FROM `posts` WHERE id = ?",
            values,
            (err, data) => {
              if (err) throw err
              res.status(200).json({ message: 'Post deleted !' });
            })
        }
      }
    })
};

exports.getStatistics = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  db.query(
    `SELECT 
      COUNT(id) AS users,
      SUM (CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS users_actives, 
      SUM (CASE WHEN isActive = 0 THEN 1 ELSE 0 END) AS users_disabled, 
      SUM (CASE WHEN isAdmin = 1 THEN 1 ELSE 0 END) AS status_admins, 
      SUM (CASE WHEN isAdmin = 0 THEN 1 ELSE 0 END) AS status_users 
      FROM users`,
    (err, statsUsers) => {
      if (err) throw err
      db.query(`SELECT  COUNT(id) AS posts FROM posts`,
        (err, statsPosts) => {
          if (err) throw err
          db.query(`SELECT  COUNT(id) AS comments FROM comments`,
            (err, statsComments) => {
              if (err) throw err
              db.query(`SELECT  COUNT(id) AS likes FROM likes`,
                (err, statsLikes) => {
                  if (err) throw err
                  Object.assign(statsPosts[0], statsUsers[0], statsComments[0], statsLikes[0])
                  res.status(200).json(statsPosts[0])
                })
            })
        })
    })
};


// CRUD SAVES
exports.getSaves = (req, res, next) => {
  db.query(
    "SELECT postId,userId,pseudo,title,media FROM `posts_saves` WHERE userId = ? ORDER BY createdAt DESC",
    req.auth.userId,
    (err, data) => {
      if (err) throw err
      res.json(data)
    })
}

exports.savePost = (req, res, next) => {
  let sql = "SELECT userId FROM `saves` WHERE postId = ? AND userId = ?";
  let values = [req.params.id, req.auth.userId]
  db.query(
    sql,
    values,
    (err, data) => {
      if (err) throw err
      let hasBeenSaved = Object.keys(data).length > 0
      if (hasBeenSaved) {
        db.query(
          "DELETE FROM `saves` WHERE postId = ? AND userId = ?",
          values,
          (err, data) => {
            if (err) throw err
            res.status(200).json({ data, message: 'Post saved !' });
          })
      } else {
        const saveInfo = new Save({
          userId: req.auth.userId,
          postId: req.params.id
        });
        Save.create(saveInfo, (err, data) => {
          if (err) throw err
          res.status(201).json({ data, message: 'Post unsaved !' });
        });
      }
    })
};

// CRUD REPORTS
exports.getReports = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  db.query(
    "SELECT userId,pseudo,postId,media,title FROM `posts_reports` ORDER BY createdAt DESC", (err, data) => {
      if (err) throw err;
      res.status(200).json(data)
    })
}

exports.reportPost = (req, res, next) => {
  db.query(
    "SELECT userId FROM `reports` WHERE postId = ? AND userId = ?",
    [req.params.id, req.body.owner],
    (err, data) => {
      if (err) throw err
      let hasBeenReported = Object.keys(data).length > 0
      if (hasBeenReported) {
        return res.status(201).json({ message: 'Post reported !' });
      }
      const report = new Report({
        postId: req.params.id,
        userId: req.body.owner
      });
      Report.create(report, (err, data) => {
        if (err) throw err
        return res.status(201).json({ message: 'Post reported !' });
      });
    })
};

exports.deleteReport = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  db.query(
    "DELETE FROM `reports` WHERE postId = ?",
    [req.params.id],
    (err, data) => {
      if (err) throw err
      res.status(200).json({ message: 'Report deleted !' });
    })
};

//LIKES
exports.likePost = (req, res, next) => {
  let sql = "SELECT userId FROM `likes` WHERE postId = ? AND userId = ?";
  let values = [req.params.id, req.auth.userId]
  db.query(
    sql,
    values,
    (err, data) => {
      if (err) throw err
      let hasBeenLiked = Object.keys(data).length > 0
      if (hasBeenLiked) {
        db.query(
          "DELETE FROM `likes` WHERE postId = ? AND userId = ?",
          values,
          (err, data) => {
            if (err) throw err
            res.status(200).json({ data, message: 'Post unliked !' });
          })
      } else {
        const likeInfo = new Like({
          userId: req.auth.userId,
          postId: req.params.id
        });
        Like.create(likeInfo, (err, data) => {
          if (err) throw err
          res.status(201).json({ data, message: 'Post liked !' });
        });
      }
    })
};


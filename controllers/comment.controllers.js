const db = require('../config/db');
// require('dotenv').config({ path: '../config/.env' });
require('dotenv').config();
const Comment = require('../models/comment.models');

// CRUD COMMENTS
exports.createComment = (req, res, next) => {
  if (req.body.text == '' || `${req.body.text.length}` > 250) {
    return res.status(400).json({ message: 'Incorrect text length !' })
  } else {
    const comment = new Comment({
      userId: req.auth.userId,
      postId: Number(req.params.id),
      text: req.body.text,
    });
    Comment.create(comment, (err, data) => {
      if (err) {
        //console.log(err)
        return res.status(400).json(err)
      }
      db.query("SELECT * FROM `comments_pseudo` WHERE postId = ? ORDER BY createdAt DESC", Number(req.params.id), (err, response) => {
        if (err) throw err;
        for (let item of response) {
          item.updating = false;
        }
        data.commentsArray = response
        res.status(201).json(data);
      })
    })
  }
};

exports.modifyComment = (req, res, next) => {
  db.query("SELECT userId FROM `comments` WHERE `comments`.`id` = ?", req.params.id, (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Bad request !' });
    }

    if (req.auth.userId != data[0].userId && req.auth.isAdmin == 0) {
      return res.status(401).json({ message: 'Unauthorized request !' })
    }

    db.query(
      "UPDATE `comments` SET text = ? WHERE `comments`.`id` = ?",
      [req.body.text, req.params.id], (err, response) => {
        if (err) {
          return res.status(400).json({ message: 'Bad request !' });
        }
      })
    res.status(200).json(req.body.text)
  })
};

exports.deleteComment = (req, res, next) => {
  db.query("SELECT userId FROM `comments` WHERE `comments`.`id` = ?", [req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Bad request !' });
    }

    if (req.auth.userId != data[0].userId && req.auth.isAdmin == 0) {
      return res.status(401).json({ message: 'Unauthorized request !' })
    }

    db.query(
      "DELETE FROM `comments` WHERE `comments`.`id` = ?",
      [req.params.id], (err, response) => {
        if (err) {
          return res.status(400).json({ message: 'Bad request !' });
        }
        res.status(200).json({ message: 'Comment deleted !' })
      })
  })
};


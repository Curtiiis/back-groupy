require('dotenv').config();
const Comment = require('../models/comment.models');

// CRUD COMMENTS
exports.createComment = (req, res, next) => {
  if (req.body.text == '' || `${req.body.text.length}` > 250) {
    return res.status(400).json({ message: 'Incorrect text length !' })
  }
  const comment = new Comment({
    userId: req.auth.userId,
    postId: Number(req.params.id),
    text: req.body.text,
  });
  Comment.create(comment, (err, data) => {
    if (err) { return res.status(400).json(err) }
    Comment.getByPostId(Number(req.params.id), (err, response) => {
      if (err) throw err;
      for (let item of response) {
        item.updating = false;
      }
      data.commentsArray = response
      res.status(201).json(data);
    })
  })
};

exports.modifyComment = (req, res, next) => {
  Comment.getByIdAndUserId([req.params.id, req.auth.userId], (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Bad request !' });
    }
    if (data == '' && req.auth.isAdmin == 0) {
      return res.status(401).json({ message: 'Unauthorized request !' })
    }
    Comment.modify([req.body.text, req.params.id], (err, data) => {
      (err)
        ? res.status(400).json({ message: 'Bad request !' })
        : res.status(200).json(req.body.text)
    })
  })
};

exports.deleteComment = (req, res, next) => {
  Comment.getByIdAndUserId([req.params.id, req.auth.userId], (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Bad request !' });
    }
    if (data == '' && req.auth.isAdmin == 0) {
      return res.status(401).json({ message: 'Unauthorized request !' })
    }

    Comment.delete([req.params.id], (err) => {
      (err)
        ? res.status(400).json({ message: 'Bad request !' })
        : res.status(200).json({ message: 'Comment deleted !' })
    })
  })
};


require("dotenv").config();
const Comment = require("../models/comment.models");
const { promisify } = require("../utils/functions.js");

// CRUD COMMENTS
exports.createComment = async (req, res, next) => {
  const userId = req.auth.userId;
  const postId = Number(req.params.id);
  const text = req.body.text;

  if (text.trim() == "" || text.length > 250) {
    return res.status(400).json({ message: "Incorrect text length !" });
  }

  const comment = new Comment({ userId, postId, text });

  try {
    const [data, response] = await Promise.all([
      promisify(Comment.create, comment),
      promisify(Comment.getByPostId, postId),
    ]);
    response.forEach((item) => (item.updating = false));
    data.commentsArray = response;
    res.status(201).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.modifyComment = async (req, res, next) => {
  const commentId = req.params.id;
  const userIdAuth = req.auth.userId;
  const isAdmin = req.auth.isAdmin === 1;
  const text = req.body.text;

  if (text.trim() == "" || text.length > 250) {
    return res.status(400).json({ message: "Incorrect text length !" });
  }

  try {
    const data = await promisify(Comment.getByIdAndUserId, [commentId, userIdAuth]);
    if (data == "" && !isAdmin) {
      return res.status(401).json({ message: "Unauthorized request !" });
    }
    await promisify(Comment.modify, [text, commentId]);
    res.status(200).json(text);
  } catch (error) {
    return res.status(400).json({ message: "Bad request !" });
  }
};

exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.id;
  const userIdAuth = req.auth.userId;
  const isAdmin = req.auth.isAdmin === 1;
  const text = req.body.text;

  try {
    const data = await promisify(Comment.getByIdAndUserId, [commentId, userIdAuth]);
    if (data == "" && !isAdmin) {
      return res.status(401).json({ message: "Unauthorized request !" });
    }
    await promisify(Comment.delete, commentId);
    res.status(200).json(text);
  } catch (error) {
    return res.status(500).json({ message: "Server error !" });
  }
};

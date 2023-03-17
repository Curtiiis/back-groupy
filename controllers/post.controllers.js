require("dotenv").config();
const fs = require("fs");
const { generateLink, promisify, setUserAssets } = require("../utils/functions.js");
const Post = require("../models/post.models");
const User = require("../models/user.models");
const Like = require("../models/like.models");
const Save = require("../models/save.models");
const Report = require("../models/report.models");
const Follow = require("../models/follow.models");
const Comment = require("../models/comment.models");

// CRUD POSTS
exports.createPost = (req, res, next) => {
  if (!req.file && req.body.title == "" && req.body.text == "") {
    return res.status(400).json({ message: "Empty body !" });
  }

  const post = new Post({
    userId: req.auth.userId,
    title: req.body.title,
    text: req.body.text,
  });

  if (req.file) {
    post.media = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  }

  Post.create(post, (err, data) => {
    if (err) throw err;
    return res.status(201).json({ message: "Post created !" });
  });
};

exports.getAllPosts = async (req, res, next) => {
  const userIdAuth = req.auth.userId;
  const values = Number([req.params.number]);

  try {
    const [dataArray, dataLikes, dataSaves, dataFollows, dataComments] = await Promise.all([
      promisify(Post.getLastByFive, values),
      promisify(Like.getAllLikes),
      promisify(Save.getAllSaves),
      promisify(Follow.getAllFollows),
      promisify(Comment.getAllComments),
    ]);

    for (let item of dataArray) {
      setUserAssets(item, userIdAuth, dataLikes, dataSaves, dataFollows, dataComments);
    }
    res.status(200).json(dataArray);
  } catch (err) {
    next(err);
  }
};

exports.getOnePost = async (req, res) => {
  const userIdAuth = req.auth.userId;
  let values = req.params.id;

  try {
    const dataArray = await promisify(Post.getOneByPostId, values);

    const [dataLikes, dataSaves, dataFollows, dataComments] = await Promise.all([
      promisify(Like.getOneByPostId, values),
      promisify(Save.getOneByPostId, values),
      promisify(Follow.getFollowsFromUser, userIdAuth),
      promisify(Comment.getByPostId, values),
    ]);

    dataArray[0].notMyself = dataArray[0].userId != userIdAuth;
    dataArray[0].likes = dataLikes.length;
    dataArray[0].liked = dataLikes.map((x) => x.userId).includes(userIdAuth);
    dataArray[0].saves = dataSaves.length;
    dataArray[0].saved = dataSaves.map((x) => x.userId).includes(userIdAuth);
    dataArray[0].follows = dataFollows;
    dataArray[0].followed = dataFollows.map((x) => x.userId).includes(userIdAuth);
    dataArray[0].comments = dataComments;
    dataArray[0].commentsCount = dataComments.length;
    dataArray[0].commentText = "";
    for (let comment of dataComments) {
      comment.updating = false;
      comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt);
    }
    res.status(200).json(dataArray);
  } catch (err) {
    throw err;
  }
};

exports.modifyPost = async (req, res, next) => {
  const postId = req.params.id;
  const userIdAuth = req.auth.userId;
  const isAdmin = req.auth.isAdmin === 1;
  const title = req.body.title;
  const text = req.body.text;

  try {
    const data = await promisify(Post.getByIdAndUserId, [postId, userIdAuth]);

    if (data == "" && !isAdmin) {
      return res.status(401).json({ message: "Unauthorized request !" });
    }
    const response = await promisify(Post.modify, [title, text, postId]);
    res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error, message: "Bad request !" });
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.id;
  const userIdAuth = req.auth.userId;
  const isAdmin = req.auth.isAdmin === 1;

  try {
    const data = await promisify(Post.getByIdAndUserId, [postId, userIdAuth]);

    if (data == "" && !isAdmin) {
      return res.status(401).json({ message: "Unauthorized request !" });
    }
    if (data[0].media != null) {
      const filename = data[0].media.split("/images/")[1];
      fs.unlinkSync(`images/${filename}`);
    }
    await promisify(Post.delete, [postId]);
    res.status(200).json({ message: "Post deleted !" });
  } catch (error) {
    return res.status(400).json({ error, message: "Bad request !" });
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    if (req.auth.isAdmin !== 1) {
      return res.status(403).json({ message: "Unauthorized request !" });
    }

    const [statsUsers, statsPosts, statsComments, statsLikes] = await Promise.all([
      promisify(User.getUsersStats),
      promisify(Post.getCount),
      promisify(Comment.getCount),
      promisify(Like.getCount),
    ]);

    const response = Object.assign(statsPosts[0], statsUsers[0], statsComments[0], statsLikes[0]);
    res.status(200).json(response);
  } catch (error) {
    throw error;
  }
};

// CRUD SAVES
exports.getSaves = async (req, res, next) => {
  try {
    const data = await promisify(Save.getFromUser, [req.auth.userId]);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error, message: "Bad request !" });
  }
};

exports.savePost = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.auth.userId;
  let values = [postId, userId];
  const saveInfo = new Save({ userId, postId });

  try {
    const data = await promisify(Save.getByPostIdAndUserId, values);

    let hasBeenSaved = Object.keys(data).length > 0;

    if (hasBeenSaved) {
      const result = await promisify(Save.delete, values);
      res.status(200).json({ result, message: "Post unsaved !" });
    } else {
      const result = await promisify(Save.create, saveInfo);
      res.status(201).json({ result, message: "Post saved !" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "Bad request !" });
  }
};

// CRUD REPORTS
exports.getReports = async (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: "Unauthorized request !" });
  }

  try {
    const data = await promisify(Report.getAll);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error, message: "Bad request !" });
  }
};

exports.reportPost = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.body.owner;
  let values = [postId, userId];
  const report = new Report({ postId, userId });

  try {
    const data = await promisify(Report.getByPostIdAndUserId, values);

    let hasBeenReported = Object.keys(data).length > 0;

    const result = hasBeenReported ? null : await promisify(Report.create, report);
    res.status(201).json({ result, message: "Post reported !" });
  } catch (error) {
    res.status(400).json({ error, message: "Bad request !" });
  }
};

exports.deleteReport = async (req, res, next) => {
  if (req.auth.isAdmin !== 1) {
    return res.status(403).json({ message: "Forbidden request !" });
  }
  try {
    await promisify(Report.delete, [req.params.id]);
    return res.status(200).json({ message: "Report deleted !" });
  } catch (error) {
    return res.status(400).json({ message: "Bad request !" });
  }
};

//LIKES
exports.likePost = async (req, res, next) => {
  const userId = req.auth.userId;
  const postId = req.params.id;

  const likeInfo = new Like({ userId, postId });

  let values = [postId, userId];

  try {
    const data = await promisify(Like.getByPostIdAndUserId, values);

    let hasBeenLiked = Object.keys(data).length > 0;

    if (hasBeenLiked) {
      const data = await promisify(Like.delete, values);
      return res.status(200).json({ data, message: "Post unliked !" });
    } else {
      const data = await promisify(Like.create, likeInfo);
      return res.status(201).json({ data, message: "Post liked !" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Bad request !" });
  }
};

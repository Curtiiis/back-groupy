require("dotenv").config();
const bcrypt = require("bcrypt");
const fs = require("fs");
const {
  getFollowedStatus,
  generateLink,
  promisify,
  getUserAssets,
} = require("../utils/functions.js");
const User = require("../models/user.models");
const Post = require("../models/post.models");
const Follow = require("../models/follow.models");
const Picture = require("../models/picture.models");
const Password = require("../models/password.models");
const Like = require("../models/like.models");
const Save = require("../models/save.models");
const Comment = require("../models/comment.models");

// GET
exports.getAllUsers = async (req, res, next) => {
  if (req.auth.isAdmin !== 1) {
    return res.status(403).json({ message: "Forbidden request !" });
  }

  try {
    const dataArray = await promisify(User.getAllActives);
    dataArray.forEach((item) => (item.link = generateLink(item.pseudo)));
    res.status(200).json(dataArray);
  } catch (err) {
    throw err;
  }
};

exports.getOneUser = async (req, res) => {
  const userIdAuth = req.auth.userId;
  const values = req.params.id;

  try {
    const dataArray = await promisify(Post.getAllFromUser, values);

    if (dataArray == "") {
      User.getUserById(values, (err, dataArray) => {
        if (err) throw err;
        return res.status(202).json(dataArray);
      });
    }

    const [dataLikes, dataSaves, dataFollows, dataComments] = await Promise.all([
      promisify(Like.getFromUser, values),
      promisify(Save.getFromUser, values),
      promisify(Follow.getFollowsFromUser, values),
      promisify(Comment.getByUserId, userIdAuth),
    ]);

    for (let item of dataArray) {
      item.likes = dataLikes.map((y) => y.userId).length;
      item.liked = dataLikes.map((y) => y.userId).includes(userIdAuth);
      item.saves = dataSaves.map((y) => y.userId).length;
      item.saved = dataSaves.map((y) => y.userId).includes(userIdAuth);
      item.follows = dataFollows.map((y) => y.userId).length;
      item.followed = dataFollows.map((y) => y.userId).includes(userIdAuth);
      item.link = item.pseudo.toLowerCase().replace(" ", "-");
      item.notMyself = item.userId != userIdAuth;
      let commentsArray = dataComments.filter((x) => x.postId == item.postId);
      item.comments = commentsArray;
      item.commentsCount = commentsArray.length;
      item.commentText = "";

      for (let comment of commentsArray) {
        comment.updating = false;
        comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt);
      }
    }
    res.status(200).json(dataArray);
  } catch (error) {
    throw error;
  }
};

exports.searchUser = (req, res) => {
  User.getByPseudo([req.auth.userId, `${req.params.id}%`], (err, data) => {
    if (err) throw err;
    data.forEach((i) => (i.link = generateLink(i.pseudo)));
    res.status(200).json(data);
  });
};

exports.getCurrentUser = async (req, res) => {
  if (req.params.id != req.auth.userId && req.auth.isAdmin == 0) {
    return res.status(403).json({ message: "Forbidden request !" });
  }
  let values = [req.auth.userId];

  try {
    const [dataUser, dataFollowers, dataSaves, dataLikes, dataPosts] = await Promise.all([
      promisify(User.getCurrent, values),
      promisify(Follow.getFollowsFromUser, values),
      promisify(Save.getSavesFromUser, values),
      promisify(Like.getCountFromUser, values),
      promisify(Comment.getCountFromUser, values),
    ]);

    let userInfos = {
      ...dataUser[0],
      email: dataUser[0].email,
      followers: dataFollowers.map((x) => x.userId),
      followersCount: dataFollowers.map((x) => x.userId).length,
      likes: dataLikes[0].likesCount,
      link: generateLink(dataUser[0].pseudo),
      picture: dataUser[0].picture,
      posts: dataPosts[0].postsCount,
      pseudo: dataUser[0].pseudo,
      userId: dataUser[0].userId,
    };
    res.status(200).json({ userInfos, dataSaves });
  } catch (err) {
    throw err;
  }
};

exports.getfollowers = async (req, res, next) => {
  try {
    const [dataFollowers, dataFollows] = await Promise.all([
      promisify(Follow.getWholeFollowersFromUser, [req.auth.userId]),
      promisify(Follow.getAllFollows),
    ]);

    dataFollowers.forEach((item) => {
      item.link = generateLink(item.pseudo);
      item.followed = getFollowedStatus(dataFollows, item.userId, req.auth.userId);
    });
    res.status(200).json(dataFollowers);
  } catch (err) {
    throw err;
  }
};

exports.getSuggestions = async (req, res, next) => {
  const userIdAuth = Number(req.auth.userId);
  const userId = Number(req.params.id);

  if (userId !== userIdAuth) {
    return res.status(403).json({ message: "Forbidden request !" });
  }

  try {
    const [dataUsers, dataFollows] = await Promise.all([
      promisify(User.getSuggestions, userIdAuth),
      promisify(Follow.getAllFollows),
    ]);

    for (let item of dataUsers) {
      let followsArray = dataFollows.filter((x) => x.followId == item.userId).map((y) => y.userId);
      item.followed = followsArray.includes(userIdAuth);
      item.link = item.pseudo.toLowerCase().replace(" ", "-");
    }
    res.status(200).json(dataUsers);
  } catch (err) {
    return res.status(400).json({ err, message: "Bad request !" });
  }
};

// POST
exports.followUser = async (req, res, next) => {
  const userId = req.auth.userId;
  const followId = req.params.id;

  const followInfo = new Follow({ userId, followId });

  try {
    const data = await promisify(Follow.isFollowed, [userId, followId]);
    let hasBeenFollowed = Object.keys(data).length > 0;

    const method = hasBeenFollowed ? Follow.delete : Follow.create;
    const values = hasBeenFollowed ? [userId, followId] : followInfo;
    const statusCode = hasBeenFollowed ? 200 : 201;
    const message = hasBeenFollowed ? "Follow deleted!" : "Follow added!";

    const result = await promisify(method, values);
    res.status(statusCode).json({ result, message });
  } catch (err) {
    res.status(400).json({ message: "Bad request!" });
  }
};

// PUT
exports.changePassword = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 3);
    const values = [hash, req.auth.userId];
    const data = await promisify(Password.update, values);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.updatePicture = async (req, res, next) => {
  try {
    const data = await promisify(User.getUserById, [req.params.id]);

    if (data.id !== req.auth.userId && req.auth.isAdmin !== 1) {
      return res.status(403).json({ message: "Forbidden request !" });
    }

    const filename = data.picture.split("/images/")[1];
    if (filename != "pp-d1.png") {
      fs.unlinkSync(`images/${filename}`);
    }

    const values = [
      `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      req.auth.userId,
    ];
    const picture = await promisify(Picture.update, values);
    res.status(200).json(picture[0]);
  } catch (err) {
    res.status(400).json({ message: "Error in request!" });
  }
};

exports.disableUser = async (req, res, next) => {
  try {
    const data = await promisify(User.getUserById, [req.params.id]);

    if (data.id !== req.auth.userId && req.auth.isAdmin !== 1) {
      return res.status(403).json({ message: "Forbidden request !" });
    }

    const response = await promisify(User.disableUser, [req.params.id]);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ message: "Bad request !" });
  }
};

exports.changeAdminStatus = async (req, res, next) => {
  try {
    const data = await promisify(User.getUserById, [req.params.id]);
    console.log(data);

    if (data.id !== req.auth.userId && req.auth.isAdmin !== 1) {
      return res.status(403).json({ message: "Forbidden request !" });
    }

    const isAdmin = data.isAdmin === 1;
    const response = await promisify(
      isAdmin ? User.changeForUserStatus : User.changeForAdminStatus,
      [req.params.id]
    );

    res.status(isAdmin ? 200 : 201).json(response);
  } catch (err) {
    res.status(400).json({ message: "Bad request!" });
  }
};

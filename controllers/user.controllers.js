require("dotenv").config();
const bcrypt = require("bcrypt");
const fs = require("fs");
const async = require("async");
const { User, UserMethods } = require("../models/user.models");
const { PostMethods } = require("../models/post.models");
const { Follow, FollowMethods } = require("../models/follow.models");
const Picture = require("../models/picture.models");
const Password = require("../models/password.models");
const { LikeMethods } = require("../models/like.models");
const { SaveMethods } = require("../models/save.models");
const { CommentMethods } = require("../models/comment.models");

// GET
exports.getAllUsers = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: "Unauthorized request !" });
  }
  User.getAllActives((err, dataArray) => {
    if (err) throw err;
    dataArray.forEach((i) => (i.link = i.pseudo.toLowerCase().replace(" ", "-")));
    res.status(200).json(dataArray);
  });
};

exports.getOneUser = (req, res) => {
  const userIdAuth = req.auth.userId;
  const values = [req.params.id];

  PostMethods.getAllFromUser(values, (err, dataArray) => {
    if (err) throw err;

    if (dataArray == "") {
      User.getUserById(values, (err, dataArray) => {
        if (err) throw err;
        return res.status(202).json(dataArray);
      });
    }

    async.parallel(
      [
        (callback) => LikeMethods.getFromUser(values, callback),
        (callback) => SaveMethods.getFromUser(values, callback),
        (callback) => FollowMethods.getFollowsFromUser(values, callback),
        (callback) => CommentMethods.getAllComments(callback),
      ],
      (err, [likes, saves, follows, comments]) => {
        if (err) throw err;

        dataArray.forEach((item) => {
          item.followed = follows.some((follow) => follow.userId === userIdAuth);
          item.link = item.pseudo.toLowerCase().replace(" ", "-");
          item.notMyself = item.userId !== userIdAuth;

          item.likes = likes.filter((like) => like.postId === item.postId).length;
          item.liked = likes.some(
            (like) => like.userId === userIdAuth && like.postId === item.postId
          );

          item.saves = saves.filter((save) => save.postId === item.postId).length;
          item.saved = saves.some(
            (save) => save.userId === userIdAuth && save.postId === item.postId
          );

          const itemComments = comments.filter((comment) => comment.postId === item.postId);
          item.comments = itemComments;
          item.commentsCount = itemComments.length;

          itemComments.forEach((comment) => {
            comment.updating = false;
            comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt);
          });
        });

        res.json(dataArray);
      }
    );
  });
};

exports.searchUser = (req, res) => {
  UserMethods.getByPseudo([req.auth.userId, `${req.params.id}%`], (err, data) => {
    if (err) throw err;
    for (let item of data) {
      item.link = item.pseudo.toLowerCase().replace(" ", "-");
    }
    res.status(200).json(data);
  });
};

exports.getCurrentUser = (req, res) => {
  if (req.params.id != req.auth.userId && req.auth.isAdmin == 0) {
    return res.status(403).json({ message: "Unauthorized request !" });
  }
  let values = [req.auth.userId];
  UserMethods.getCurrent(values, (err, dataUser) => {
    if (err) throw err;
    FollowMethods.getFollowsFromUser(values, (err, dataFollowers) => {
      if (err) throw err;
      SaveMethods.getSavesFromUser(values, (err, dataSaves) => {
        if (err) throw err;
        LikeMethods.getCountFromUser(values, (err, dataLikes) => {
          if (err) throw err;
          CommentMethods.getCountFromUser(values, (err, dataPosts) => {
            if (err) throw err;

            let userInfos = {
              ...dataUser[0],
              email: dataUser[0].email,
              followers: dataFollowers.map((x) => x.userId),
              followersCount: dataFollowers.map((x) => x.userId).length,
              likes: dataLikes[0].likesCount,
              link: dataUser[0].pseudo.toLowerCase().replace(" ", "-"),
              picture: dataUser[0].picture,
              posts: dataPosts[0].postsCount,
              pseudo: dataUser[0].pseudo,
              userId: dataUser[0].userId,
            };
            res.status(200).json({ userInfos: userInfos, dataSaves, dataSaves });
          });
        });
      });
    });
  });
};

exports.getfollowers = (req, res, next) => {
  FollowMethods.getWholeFollowersFromUser([req.auth.userId], (err, dataFollowers) => {
    if (err) throw err;
    FollowMethods.getAllFollows((err, dataFollows) => {
      if (err) throw err;
      for (let item of dataFollowers) {
        item.link = item.pseudo.toLowerCase().replace(" ", "-");
        item.followed = dataFollows
          .filter((x) => x.followId == item.userId)
          .map((y) => y.userId)
          .includes(req.auth.userId);
      }
      res.status(200).json(dataFollowers);
    });
  });
};

exports.getSuggestions = (req, res, next) => {
  if (req.params.id != req.auth.userId && req.auth.isAdmin == 0) {
    return res.status(403).json({ message: "Unauthorized request !" });
  }
  UserMethods.getSuggestions([req.auth.userId], (err, dataUsers) => {
    if (err) {
      return res.status(400).json({ err, message: "Bad request !" });
    }
    FollowMethods.getAllFollows((err, dataFollows) => {
      if (err) throw err;
      for (let item of dataUsers) {
        let followsArray = dataFollows
          .filter((x) => x.followId == item.userId)
          .map((y) => y.userId);
        item.followed = followsArray.includes(Number(req.auth.userId));
        item.link = item.pseudo.toLowerCase().replace(" ", "-");
      }
      res.status(200).json(dataUsers);
    });
  });
};

// POST
exports.followUser = (req, res, next) => {
  const userId = req.auth.userId;
  const followId = req.params.id;
  const values = [userId, followId];
  const followInfo = new Follow({ userId, followId });

  FollowMethods.isFollowed(values, (err, data) => {
    if (err) throw err;

    const hasBeenFollowed = data && Object.keys(data).length > 0;
    const method = hasBeenFollowed ? FollowMethods.delete : FollowMethods.create;
    const payload = hasBeenFollowed ? values : followInfo;
    const statusCode = hasBeenFollowed ? 200 : 201;
    const message = hasBeenFollowed ? "Follow deleted !" : "Follow added !";

    method(payload, (err, data) => {
      err
        ? res.status(400).json({ message: "Bad request !" })
        : res.status(statusCode).json({ data, message: message });
    });
  });
};

// PUT
exports.changePassword = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 3)
    .then((hash) => {
      let values = [hash, req.auth.userId];
      Password.update(values, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).json(err);
        }
        res.status(201).json(data);
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });
};

exports.updatePicture = (req, res, next) => {
  UserMethods.getCurrent([req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: "Error in request !" });
    }
    if (data[0].userId != req.auth.userId && req.auth.isAdmin == 0) {
      return res.status(403).json({ message: "Unauthorized request !" });
    }
    const filename = data[0].picture.split("/images/")[1];
    if (filename != "pp-d1.png") {
      fs.unlinkSync(`images/${filename}`);
    }
    Picture.update(
      [`${req.protocol}://${req.get("host")}/images/${req.file.filename}`, req.auth.userId],
      (err, picture) => {
        err ? res.status(400).json({ message: "Bad request !" }) : res.status(200).json(picture[0]);
      }
    );
  });
};

exports.disableUser = (req, res, next) => {
  User.getUserById([req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: "Bad request !" });
    }
    if (data.id != req.auth.userId && req.auth.isAdmin == 0) {
      return res.status(403).json({ message: "Unauthorized request !" });
    }
    UserMethods.disableUser([req.params.id], (err, response) => {
      err ? res.status(400).json({ message: "Bad request !" }) : res.status(200).json(response);
    });
  });
};

exports.changeAdminStatus = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: "Unauthorized request !" });
  }
  User.getUserById([req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: "Bad request !" });
    }
    if (data.isAdmin == 1) {
      UserMethods.changeForUserStatus([req.params.id], (err, response) => {
        err ? res.status(400).json({ message: "Bad request !" }) : res.status(200).json(response);
      });
    } else {
      UserMethods.changeForAdminStatus([req.params.id], (err, response) => {
        err ? res.status(400).json({ message: "Bad request !" }) : res.status(201).json(response);
      });
    }
  });
};

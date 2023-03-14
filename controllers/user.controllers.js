require('dotenv').config();
const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require('../models/user.models');
const Post = require('../models/post.models');
const Follow = require('../models/follow.models');
const Picture = require('../models/picture.models');
const Password = require('../models/password.models');
const Like = require('../models/like.models');
const Save = require('../models/save.models');
const Comment = require('../models/comment.models');

// GET
exports.getAllUsers = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  User.getAllActives((err, dataArray) => {
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
  Post.getAllFromUser(values, (err, dataArray) => {
    if (err) throw err
    if (dataArray == '') {
      User.getUserById(values, (err, dataArray) => {
        if (err) throw err
        return res.status(202).json(dataArray)
      })
    } else {
      Like.getFromUser(values, (err, dataLikes) => {
        if (err) throw err
        Save.getFromUser(values, (err, dataSaves) => {
          if (err) throw err
          Follow.getFollowsFromUser(values, (err, dataFollows) => {
            if (err) throw err
            Comment.getAllComments((err, dataComments) => {
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
  User.getByPseudo([req.auth.userId, `${req.params.id}%`], (err, data) => {
    if (err) throw err
    for (let item of data) {
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
  User.getCurrent(values, (err, dataUser) => {
    if (err) throw err
    Follow.getFollowsFromUser(values, (err, dataFollowers) => {
      if (err) throw err
      Save.getSavesFromUser(values, (err, dataSaves) => {
        if (err) throw err
        Like.getCountFromUser(values, (err, dataLikes) => {
          if (err) throw err
          Comment.getCountFromUser(values, (err, dataPosts) => {
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
  Follow.getWholeFollowersFromUser([req.auth.userId], (err, dataFollowers) => {
    if (err) throw err
    Follow.getAllFollows((err, dataFollows) => {
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
  User.getSuggestions([req.auth.userId], (err, dataUsers) => {
    if (err) {
      return res.status(400).json({ err, message: 'Bad request !' });
    }
    Follow.getAllFollows((err, dataFollows) => {
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
  const followInfo = new Follow({
    userId: req.auth.userId,
    followId: req.params.id
  });

  Follow.isFollowed([req.auth.userId, req.params.id], (err, data) => {
    if (err) throw err
    let hasBeenFollowed = Object.keys(data).length > 0
    if (hasBeenFollowed) {
      Follow.delete([req.auth.userId, req.params.id], (err, data) => {
        (err)
          ? res.status(400).json({ message: 'Bad request !' })
          : res.status(200).json({ data, message: 'Follow deleted !' });
      })
    } else {
      Follow.create(followInfo, (err, data) => {
        (err)
          ? res.status(400).json({ message: 'Bad request !' })
          : res.status(201).json({ data, message: 'Follow added !' });
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
          console.log(err)
          return res.status(400).json(err)
        }
        res.status(201).json(data);
      })
    })
    .catch(error => { return res.status(500).json({ error }) })
};

exports.updatePicture = (req, res, next) => {
  User.getCurrent([req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Error in request !' });
    }
    if (data[0].userId != req.auth.userId && req.auth.isAdmin == 0) {
      return res.status(403).json({ message: 'Unauthorized request !' });
    }
    const filename = data[0].picture.split('/images/')[1]
    if (filename != 'pp-d1.png') {
      fs.unlinkSync(`images/${filename}`);
    }
    Picture.update(
      [`${req.protocol}://${req.get('host')}/images/${req.file.filename}`, req.auth.userId], (err, picture) => {
        (err)
          ? res.status(400).json({ message: 'Bad request !' })
          : res.status(200).json(picture[0]);
      })
  })
};

exports.disableUser = (req, res, next) => {
  User.getUserById([req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Bad request !' });
    }
    if (data.id != req.auth.userId && req.auth.isAdmin == 0) {
      return res.status(403).json({ message: 'Unauthorized request !' });
    }
    User.disableUser([req.params.id], (err, response) => {
      (err)
        ? res.status(400).json({ message: 'Bad request !' })
        : res.status(200).json(response);
    })
  })
};

exports.changeAdminStatus = (req, res, next) => {
  if (req.auth.isAdmin != 1) {
    return res.status(403).json({ message: 'Unauthorized request !' });
  }
  User.getUserById([req.params.id], (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Bad request !' });
    }
    if (data.isAdmin == 1) {
      User.changeForUserStatus([req.params.id], (err, response) => {
        (err)
          ? res.status(400).json({ message: 'Bad request !' })
          : res.status(200).json(response);
      })
    } else {
      User.changeForAdminStatus([req.params.id], (err, response) => {
        (err)
          ? res.status(400).json({ message: 'Bad request !' })
          : res.status(201).json(response);
      })
    }
  })
};
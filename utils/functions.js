const db = require("../config/db.js");

module.exports = executeQuery = (query, data, result) => {
  db.query(query, data, (err, res) => {
    err ? result(err, null) : res.length === 0 ? result(null, null) : result(null, res);
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
    } else {
      LikeMethods.getFromUser(values, (err, dataLikes) => {
        if (err) throw err;
        SaveMethods.getFromUser(values, (err, dataSaves) => {
          if (err) throw err;
          FollowMethods.getFollowsFromUser(values, (err, dataFollows) => {
            if (err) throw err;
            CommentMethods.getAllComments((err, dataComments) => {
              if (err) throw err;
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
              res.json(dataArray);
            });
          });
        });
      });
    }
  });
};

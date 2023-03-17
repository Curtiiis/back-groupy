const db = require("../config/db");

function queryDB(queryString, data, result) {
  db.query(queryString, data, (err, res) => {
    result(err, err ? null : res);
  });
}

const promisify = (func, ...args) =>
  new Promise((resolve, reject) =>
    func(...args, (err, data) => (err ? reject(err) : resolve(data)))
  );

const getFollowedStatus = (dataFollows, itemUserId, authUserId) => {
  return dataFollows
    .filter((x) => x.followId == itemUserId)
    .map((y) => y.userId)
    .includes(authUserId);
};

const generateLink = (pseudo) => {
  return pseudo.toLowerCase().replace(" ", "-");
};

const setUserAssets = (item, userIdAuth, dataLikes, dataSaves, dataFollows, dataComments) => {
  item.notMyself = item.userId != userIdAuth;
  item.link = item.pseudo.toLowerCase().replace(" ", "-");
  item.updated = Number(item.createdAt) !== Number(item.updatedAt);

  item.likes = dataLikes.filter((x) => x.postId == item.postId).length;
  item.liked = dataLikes.some((x) => x.postId == item.postId && x.userId == userIdAuth);

  item.saves = dataSaves.filter((x) => x.postId == item.postId).length;
  item.saved = dataSaves.some((x) => x.postId == item.postId && x.userId == userIdAuth);

  item.follows = dataFollows.filter((x) => x.followId == item.userId).map((y) => y.userId);
  item.followed = dataFollows.some((x) => x.followId == item.userId && x.userId == userIdAuth);

  let commentsArray = dataComments.filter((x) => x.postId == item.postId);
  item.comments = commentsArray;
  item.commentsCount = commentsArray.length;
  item.commentText = "";

  for (let comment of commentsArray) {
    comment.updating = false;
    comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt);
  }
};

async function getUserAssets(
  dataArray,
  dataLikes,
  dataSaves,
  dataFollows,
  dataComments,
  userIdAuth
) {
  dataArray.forEach((item) => {
    item.likes = dataLikes.filter((x) => x.postId == item.postId).map((y) => y.userId).length;
    item.liked = dataLikes
      .filter((x) => x.postId == item.postId)
      .map((y) => y.userId)
      .includes(userIdAuth);

    item.saves = dataSaves.filter((x) => x.postId == item.postId).map((y) => y.userId).length;
    item.saved = dataSaves
      .filter((x) => x.postId == item.postId)
      .map((y) => y.userId)
      .includes(userIdAuth);

    item.follows = dataFollows.filter((x) => x.followId == item.userId).map((y) => y.userId).length;
    item.followed = dataFollows
      .filter((x) => x.followId == item.userId)
      .map((y) => y.userId)
      .includes(userIdAuth);

    item.link = generateLink(item.pseudo);
    item.notMyself = item.userId != userIdAuth;
    let commentsArray = dataComments.filter((x) => x.postId == item.postId);
    item.comments = commentsArray;
    item.commentsCount = commentsArray.length;

    commentsArray.forEach((comment) => {
      comment.updating = false;
      comment.updated = Number(comment.createdAt) !== Number(comment.updatedAt);
    });
  });

  return dataArray;
}

module.exports = {
  queryDB,
  promisify,
  getFollowedStatus,
  generateLink,
  getUserAssets,
  setUserAssets,
};

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

module.exports = { queryDB, promisify, getFollowedStatus, generateLink };

const db = require("../config/db");

function queryDB(queryString, data, result) {
  db.query(queryString, data, (err, res) => {
    result(err, err ? null : res);
  });
}

module.exports = queryDB;

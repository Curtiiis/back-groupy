const db = require('../config/db');

const Follow = function (post) {
    this.userId = post.userId,
        this.followId = post.followId
}

Follow.create = (newFollow, result) => {
    db.query("INSERT INTO follows SET ?", newFollow, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, newFollow)
    });
};

module.exports = Follow;

const db = require('../config/db');

const Like = function (post) {
    this.userId = post.userId,
        this.postId = post.postId
}

Like.create = (newLike, result) => {
    db.query("INSERT INTO likes SET ?", newLike, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, newLike)
    });
};

module.exports = Like;

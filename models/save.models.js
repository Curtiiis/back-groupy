const db = require('../config/db');

const Save = function (post) {
    this.userId = post.userId,
        this.postId = post.postId
}

Save.create = (newSave, result) => {
    db.query("INSERT INTO saves SET ?", newSave, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, newSave)
    });
};

module.exports = Save;

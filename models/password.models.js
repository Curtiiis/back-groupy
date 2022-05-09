const db = require('../config/db');

const Password = function (user) {
    this.password = user.password
}

Password.update = (newPassword, result) => {
    db.query("UPDATE `users` SET `password` = ? WHERE `users`.`id` = ?", newPassword, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, { newPassword })
    });
};

module.exports = Password;


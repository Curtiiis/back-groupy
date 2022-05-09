const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);

    req.auth = {
      userId: decodedToken.id_user,
      pseudo: decodedToken.pseudo,
      isActive: decodedToken.isActive,
      isAdmin: decodedToken.isAdmin
    };

    if (req.body.userId && req.body.userId != decodedToken.id_user) {
      throw "Unavailable User ID!"
    } else {
      // if (req.body.userId == decodedToken.id_user || decodedToken.isAdmin == 1) {
      next();
    }
  }
  catch (error) {
    res.status(401).json({ error: error | "Non authorized request !" })
  }
};
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);

    req.auth = {
      userId: decodedToken.id_user,
      isActive: decodedToken.isActive,
      isAdmin: decodedToken.isAdmin,
    };

    // If someone else ask
    if (req.body.userId && req.body.userId !== decodedToken.id_user) {
      throw "Unavailable User ID!";
    } else {
      next();
    }
  } catch (error) {
    res.status(406).json({ error: error | "Non authorized request !" });
  }
};

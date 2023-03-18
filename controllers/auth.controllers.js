require("dotenv").config();
const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("../utils/functions.js");

exports.signup = async (req, res, next) => {
  const pseudo = req.body.pseudo;
  const email = req.body.email;

  try {
    const response = await promisify(User.isUnique, [pseudo, email]);
    const hash = await bcrypt.hash(req.body.password, 5);
    const user = new User({ email, pseudo, password: hash });

    if (!response) {
      return res.status(401).json({ message: "Pseudo/email already taken !" });
    }
    const data = await promisify(User.create, user);
    return res.status(201).json({ data, message: "Created with success !" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during the signup process", error });
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userFound = await promisify(User.getUserByEmail, email);
    const passwordEncoded = userFound === 0 ? "" : userFound.password;
    const valid = await bcrypt.compare(password, passwordEncoded);

    const userId = userFound.userId;
    const isActive = userFound.isActive;
    const isAdmin = userFound.isAdmin;

    if (userFound === 0) {
      return res.status(401).json({ message: "Disabled account" });
    }
    if (!valid) {
      return res.status(400).json({ message: "Unavailable pseudo or email" });
    }

    const token = jwt.sign({ id_user: userId, isActive, isAdmin }, process.env.TOKEN_KEY, {
      expiresIn: "24h",
    });
    return res.status(200).json({ isActive, isAdmin, userId, token });
  } catch (error) {
    return res.status(500).json({ error, message: "Erreur serveur" });
  }
};

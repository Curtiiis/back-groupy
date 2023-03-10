require('dotenv').config();
const User = require('../models/user.models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = (req, res, next) => {
  User.isUnique(
    [req.body.pseudo, req.body.email],
    (err, response) => {
      if (err) throw err
      if (response == false) {
        return res.status(401).json({ message: "Non unique pseudo or email" });
      }
      bcrypt.hash(req.body.password, 5)
        .then(hash => {
          const user = new User({
            email: req.body.email,
            pseudo: req.body.pseudo,
            password: hash
          });
          User.create(user, (err) => {
            if (err) throw err
            res.status(201).json({ message: 'Created with success' });
          })
        })
        .catch(error => res.status(500).json(error))
    })
};

exports.login = (req, res, next) => {
  User.getUserByEmail(req.body.email, (err, userFound) => {
    if (userFound == 0) {
      return res.status(401).json({ message: "Disabled account" })
    }
    const passwordEncoded = userFound === null ? '' : userFound.password
    bcrypt.compare(req.body.password, passwordEncoded)
      .then(valid => {
        if (err) throw err;
        if (!valid) {
          return res.status(400).json({ message: "Unavailable pseudo or email" })
        }
        res.status(200).json({
          isActive: userFound.isActive,
          isAdmin: userFound.isAdmin,
          userId: userFound.userId,
          token: jwt.sign({
            id_user: userFound.userId,
            isActive: userFound.isActive,
            isAdmin: userFound.isAdmin
          },
            `${process.env.TOKEN_KEY}`,
            { expiresIn: '24h' }
          )
        })
      })
      .catch(error => {
        console.log('Error 500', error)
        res.status(500).json({ message: "Erreur serveur" })
      }
      );
  })
};

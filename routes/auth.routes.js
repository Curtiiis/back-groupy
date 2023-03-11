const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controllers');
const passwordValidator = require('../middleware/password-validator');

router.post('/signup', passwordValidator, authCtrl.signup);
router.post('/login', authCtrl.login);

module.exports = router;


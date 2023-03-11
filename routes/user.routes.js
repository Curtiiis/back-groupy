const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controllers');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

//CRUD Post and comments
router.get('/', auth, userCtrl.getAllUsers);
router.get('/:id', auth, userCtrl.getOneUser);
router.get('/search/:id', auth, userCtrl.searchUser);
router.get('/current/:id', auth, userCtrl.getCurrentUser);
router.get('/followers/:id', auth, userCtrl.getfollowers);
router.get('/suggestions/:id', auth, userCtrl.getSuggestions);

router.post('/follow/:id', auth, userCtrl.followUser);

router.put('/updatePaswword/:id', auth, userCtrl.changePassword);
router.put('/updatePicture/:id', auth, multer, userCtrl.updatePicture);
router.put('/:id', auth, userCtrl.disableUser);
router.put('/status/:id', auth, userCtrl.changeAdminStatus);



module.exports = router;


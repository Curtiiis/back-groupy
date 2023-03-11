const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post.controllers');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.post('/', auth, multer, postCtrl.createPost);
router.get('/:number', auth, postCtrl.getAllPosts);
router.get('/post/:id', auth, postCtrl.getOnePost);
router.put('/:id', auth, postCtrl.modifyPost);
router.delete('/:id', auth, postCtrl.deletePost);

router.get('/statistics/:id', auth, postCtrl.getStatistics);

router.get('/saves/:id', auth, postCtrl.getSaves);
router.post('/saves/:id', auth, postCtrl.savePost);

router.get('/reports/:id', auth, postCtrl.getReports);
router.post('/reports/:id', auth, postCtrl.reportPost);
router.delete('/reports/:id', auth, postCtrl.deleteReport);

router.post('/like/:id', auth, postCtrl.likePost);

module.exports = router;
const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment.controllers');
const auth = require('../middleware/auth');

router.post('/:id', auth, commentCtrl.createComment);
router.put('/:id', auth, commentCtrl.modifyComment);
router.delete('/:id', auth, commentCtrl.deleteComment);

module.exports = router;
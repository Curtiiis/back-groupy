const express = require("express");
const router = express.Router();
const postCtrl = require("../controllers/post.controllers");
const multer = require("../middleware/multer-config");
const auth = require("../middleware/auth");

router.post("/", auth, multer, postCtrl.createPost);
router.get("/:number", auth, postCtrl.getAllPosts);
router.get("/post/:id", auth, postCtrl.getOnePost);

router.put("/:id", auth, postCtrl.modifyPost);
router.delete("/:id", auth, postCtrl.deletePost);

router.get("/statistics/:id", auth, postCtrl.getStatistics);

router.get("/saves/:id", auth, postCtrl.getSaves);
router.post("/saves/:id", auth, postCtrl.savePost);

router
  .route("/reports/:id")
  .get(auth, postCtrl.getReports)
  .post(auth, postCtrl.reportPost)
  .delete(auth, postCtrl.deleteReport);

router.post("/like/:id", auth, postCtrl.likePost);

module.exports = router;

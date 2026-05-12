const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access issueId from parent router
const commentsController = require("../controllers/comments.controller");
const { verifyToken } = require("../middleware/auth");

router.get("/", commentsController.getCommentsForIssue);
router.post("/", verifyToken, commentsController.createComment);
router.delete("/:commentId", verifyToken, commentsController.deleteComment);

module.exports = router;

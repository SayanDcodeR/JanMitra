const express = require("express");
const router = express.Router();
const issuesController = require("../controllers/issues.controller");
const { verifyToken, isAdmin } = require("../middleware/auth");
const multer = require('multer');
const { storage } = require("../config/cloudConfig");
const upload = multer({ storage });

router.get("/stats", issuesController.getStats);
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getIssueById);
router.post("/", verifyToken, upload.single('image'), issuesController.createIssue);
router.put("/:id", verifyToken, isAdmin, issuesController.updateIssueDetails);
router.patch("/:id", verifyToken, isAdmin, issuesController.updateIssueDetails);
router.patch("/:id/status", verifyToken, isAdmin, issuesController.updateIssueStatus);

module.exports = router;

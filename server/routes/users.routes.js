const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/me", verifyToken, usersController.getMe);
router.get("/me/issues", verifyToken, usersController.getMyIssues);
router.get("/stats", usersController.getUserStats);
router.get("/", verifyToken, isAdmin, usersController.getAllUsers);
router.patch("/:id/role", verifyToken, isAdmin, usersController.updateUserRole);
router.delete("/:id", verifyToken, isAdmin, usersController.deleteUser);

module.exports = router;

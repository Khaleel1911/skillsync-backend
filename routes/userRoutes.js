const express = require("express");
const { getUserById } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:id", protect, getUserById);

module.exports = router;


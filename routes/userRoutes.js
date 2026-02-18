const express = require("express");
const multer = require("multer");
const {
  getUserById,
  updateUserById,
  uploadProfileImage,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUserById);
router.post("/:id/profile-image", protect, upload.single("image"), uploadProfileImage);

module.exports = router;


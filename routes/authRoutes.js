const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("rollNumber").notEmpty().withMessage("Roll number is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  loginUser
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  forgotPassword
);

router.put(
  "/reset-password/:token",
  [body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")],
  validateRequest,
  resetPassword
);

router.get("/me", protect, getMe);

module.exports = router;


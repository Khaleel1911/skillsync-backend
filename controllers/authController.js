const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendResponse = require("../utils/responseHandler");
const createTransporter = require("../config/mailer");

const registerUser = async (req, res, next) => {
  try {
    const { email, rollNumber, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { rollNumber }],
    });
    if (existingUser) {
      return sendResponse(res, 400, "User already exists", {});
    }

    const user = await User.create(req.body);
    const token = generateToken(user._id);
    return sendResponse(res, 201, "Registration successful", {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, 401, "Invalid credentials", {});
    }

    const token = generateToken(user._id);
    return sendResponse(res, 200, "Login successful", {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, "User not found", {});
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrlBase = process.env.RESET_PASSWORD_URL || process.env.FRONTEND_URL;
    const resetUrl = resetUrlBase
      ? `${resetUrlBase.replace(/\/$/, "")}/reset-password/${resetToken}`
      : `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "SkillSync Password Reset",
      text: `You requested a password reset. Use this link: ${resetUrl}`,
    });

    return sendResponse(res, 200, "Reset password email sent", {});
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return sendResponse(res, 400, "Invalid or expired token", {});
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    return sendResponse(res, 200, "Password reset successful", { token });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendResponse(res, 200, "Profile fetched", { user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
};


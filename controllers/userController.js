const User = require("../models/User");
const sendResponse = require("../utils/responseHandler");
const cloudinary = require("../config/cloudinary");

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-resetPasswordToken -resetPasswordExpire"
    );
    if (!user) {
      return sendResponse(res, 404, "User not found", {});
    }

    return sendResponse(res, 200, "User fetched", { user });
  } catch (error) {
    return next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return sendResponse(res, 403, "Not authorized to update this user", {});
    }

    const allowedFields = [
      "fullName",
      "phoneNumber",
      "role",
      "department",
      "year",
      "section",
      "bio",
      "github",
      "linkedin",
      "skillsKnown",
      "skillsWanted",
      "interests",
      "profileImage",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-resetPasswordToken -resetPasswordExpire");

    if (!user) {
      return sendResponse(res, 404, "User not found", {});
    }

    return sendResponse(res, 200, "User updated", { user });
  } catch (error) {
    return next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return sendResponse(res, 403, "Not authorized to update this user", {});
    }
    if (!req.file) {
      return sendResponse(res, 400, "Image file is required", {});
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;
    const uploadResult = await cloudinary.uploader.upload(fileStr, {
      folder: process.env.CLOUDINARY_FOLDER || "skillsync",
      resource_type: "image",
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: uploadResult.secure_url },
      { new: true }
    ).select("-resetPasswordToken -resetPasswordExpire");

    return sendResponse(res, 200, "Profile image updated", {
      profileImage: uploadResult.secure_url,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUserById, updateUserById, uploadProfileImage };


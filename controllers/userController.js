const User = require("../models/User");
const sendResponse = require("../utils/responseHandler");

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

module.exports = { getUserById };


const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
        data: {},
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: {},
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        data: {},
      });
    }
    return next(error);
  }
};

module.exports = { protect };


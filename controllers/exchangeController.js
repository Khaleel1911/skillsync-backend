const SkillExchange = require("../models/SkillExchange");
const sendResponse = require("../utils/responseHandler");

const createExchange = async (req, res, next) => {
  try {
    const { targetUser } = req.body;
    if (targetUser === req.user._id.toString()) {
      return sendResponse(res, 400, "Cannot send exchange request to self", {});
    }

    const existing = await SkillExchange.findOne({
      requester: req.user._id,
      targetUser,
      status: { $in: ["Pending", "Accepted"] },
    });
    if (existing) {
      return sendResponse(res, 400, "Duplicate exchange request", {});
    }

    const exchange = await SkillExchange.create({
      ...req.body,
      requester: req.user._id,
    });

    return sendResponse(res, 201, "Exchange request created", { exchange });
  } catch (error) {
    return next(error);
  }
};

const browseExchanges = async (req, res, next) => {
  try {
    const exchanges = await SkillExchange.find({
      status: "Pending",
      isVisible: true,
    })
      .populate("requester", "fullName profileImage skillsKnown skillsWanted")
      .populate("targetUser", "fullName profileImage skillsKnown skillsWanted")
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, "Exchange requests fetched", { exchanges });
  } catch (error) {
    return next(error);
  }
};

const getUserExchanges = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const exchanges = await SkillExchange.find({
      $or: [{ requester: userId }, { targetUser: userId }],
    })
      .populate("requester", "fullName profileImage")
      .populate("targetUser", "fullName profileImage")
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, "User exchanges fetched", { exchanges });
  } catch (error) {
    return next(error);
  }
};

const respondToExchange = async (req, res, next) => {
  try {
    const { action } = req.body;
    const exchange = await SkillExchange.findById(req.params.id);
    if (!exchange) {
      return sendResponse(res, 404, "Exchange not found", {});
    }
    if (exchange.targetUser.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, "Only target user can respond", {});
    }
    if (exchange.status !== "Pending") {
      return sendResponse(res, 400, "Exchange already processed", {});
    }

    if (action === "accept") {
      exchange.status = "Accepted";
    } else if (action === "reject") {
      exchange.status = "Rejected";
      exchange.isVisible = false;
    } else {
      return sendResponse(res, 400, "Invalid action", {});
    }

    await exchange.save();
    return sendResponse(res, 200, "Exchange updated", { exchangeId: exchange._id });
  } catch (error) {
    return next(error);
  }
};

const completeExchange = async (req, res, next) => {
  try {
    const exchange = await SkillExchange.findById(req.params.id);
    if (!exchange) {
      return sendResponse(res, 404, "Exchange not found", {});
    }
    const isParticipant =
      exchange.requester.toString() === req.user._id.toString() ||
      exchange.targetUser.toString() === req.user._id.toString();
    if (!isParticipant) {
      return sendResponse(res, 403, "Only participants can complete", {});
    }
    if (exchange.status !== "Accepted") {
      return sendResponse(res, 400, "Exchange not accepted", {});
    }

    exchange.status = "Completed";
    exchange.isVisible = false;
    await exchange.save();

    return sendResponse(res, 200, "Exchange completed", { exchangeId: exchange._id });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createExchange,
  browseExchanges,
  getUserExchanges,
  respondToExchange,
  completeExchange,
};


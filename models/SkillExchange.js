const mongoose = require("mongoose");

const skillExchangeSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillsOffered: { type: [String], default: [] },
    skillsWanted: { type: [String], default: [] },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillExchange", skillExchangeSchema);


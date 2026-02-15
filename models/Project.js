const mongoose = require("mongoose");

const requiredRoleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    numberOfOpenings: { type: Number, required: true, min: 1 },
    filledPositions: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roleName: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const joinRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roleName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requiredRoles: { type: [requiredRoleSchema], default: [] },
    members: { type: [memberSchema], default: [] },
    joinRequests: { type: [joinRequestSchema], default: [] },
    projectStatus: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Archived"],
      default: "Open",
    },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

projectSchema.methods.hasOpenRole = function hasOpenRole() {
  return this.requiredRoles.some(
    (role) => role.filledPositions < role.numberOfOpenings
  );
};

projectSchema.methods.updateStatusForRoles = function updateStatusForRoles() {
  if (!this.hasOpenRole()) {
    this.projectStatus = "In Progress";
  }
};

module.exports = mongoose.model("Project", projectSchema);


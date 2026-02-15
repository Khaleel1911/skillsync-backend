const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    level: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "student" },
    department: { type: String, trim: true },
    year: { type: String, trim: true },
    section: { type: String, trim: true },
    bio: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    skillsKnown: { type: [skillSchema], default: [] },
    skillsWanted: { type: [skillSchema], default: [] },
    interests: { type: [String], default: [] },
    projectsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    projectsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);


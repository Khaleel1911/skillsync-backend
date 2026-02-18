const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  listProjects,
  matchProjects,
  getProjectById,
  joinProject,
  respondToJoinRequest,
  updateProject,
  completeProject,
  archiveProject,
} = require("../controllers/projectController");
const validateRequest = require("../middlewares/validateRequest");
const { protect, optionalProtect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("requiredRoles").isArray({ min: 1 }).withMessage("Roles are required"),
  ],
  validateRequest,
  createProject
);

router.get("/", listProjects);
router.get("/match/:userId", matchProjects);
router.get("/:id", optionalProtect, getProjectById);
router.put("/:id", protect, updateProject);

router.post(
  "/:id/join",
  protect,
  [body("roleName").notEmpty().withMessage("Role name is required")],
  validateRequest,
  joinProject
);

router.put(
  "/:id/respond",
  protect,
  [
    body("requestId").notEmpty().withMessage("Request id is required"),
    body("action").notEmpty().withMessage("Action is required"),
  ],
  validateRequest,
  respondToJoinRequest
);

router.put("/:id/complete", protect, completeProject);
router.put("/:id/archive", protect, archiveProject);

module.exports = router;


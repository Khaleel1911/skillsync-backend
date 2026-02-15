const express = require("express");
const { body } = require("express-validator");
const {
  createExchange,
  browseExchanges,
  getUserExchanges,
  respondToExchange,
  completeExchange,
} = require("../controllers/exchangeController");
const validateRequest = require("../middlewares/validateRequest");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  [body("targetUser").notEmpty().withMessage("Target user is required")],
  validateRequest,
  createExchange
);

router.get("/browse", browseExchanges);
router.get("/user/:id", protect, getUserExchanges);

router.put(
  "/:id/respond",
  protect,
  [body("action").notEmpty().withMessage("Action is required")],
  validateRequest,
  respondToExchange
);

router.put("/:id/complete", protect, completeExchange);

module.exports = router;


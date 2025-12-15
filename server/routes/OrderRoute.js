const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

const {
  getOrderByProductId,
  updateRatingDraft,
  finalizeOrder,
  cancelOrder,
} = require("../controllers/OrderController");

// ===== Hoang's routes =====

router.put(
  "/:productId/rating-draft",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  updateRatingDraft
);

router.post(
  "/:productId/complete",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  finalizeOrder
);

router.post(
  "/:productId/cancel",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  cancelOrder
);

// ====================================

// ==== Thuan's routes =====

// GET /api/orders/product/:productId - Get order details by product ID
router.get(
  "/product/:productId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder, ROLES_LIST.Seller),
  getOrderByProductId
);

// ==========================
module.exports = router;

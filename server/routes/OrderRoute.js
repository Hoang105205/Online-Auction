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
  submitPaymentInfo,
  submitShippingInfo,
  confirmDelivery,
  upload,
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

// POST /api/orders/:productId/payment - Submit payment info with image
router.post(
  "/:productId/payment",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  upload.single("paymentProof"),
  submitPaymentInfo
);

// POST /api/orders/:productId/shipping - Submit shipping info with image
router.post(
  "/:productId/shipping",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  upload.single("shippingProof"),
  submitShippingInfo
);

// POST /api/orders/:productId/confirm-delivery - Confirm delivery received
router.post(
  "/:productId/confirm-delivery",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  confirmDelivery
);

// POST /api/orders/:productId/close - Close order by seller
router.post(
  "/:productId/close",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  finalizeOrder
);

// ==========================
module.exports = router;

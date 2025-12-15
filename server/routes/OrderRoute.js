const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

const {
  updateRatingDraft,
  finalizeOrder,
  cancelOrder,
} = require("../controllers/OrderController");

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

module.exports = router;

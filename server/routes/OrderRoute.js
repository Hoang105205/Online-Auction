const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/OrderController");

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// GET /api/orders/product/:productId - Get order details by product ID
router.get(
  "/product/:productId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder, ROLES_LIST.Seller),
  OrderController.getOrderByProductId
);

module.exports = router;

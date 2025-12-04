const express = require("express");
const router = express.Router();

const SystemController = require("../controllers/SystemController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// Get category based on slugify of name
router.get("/categories/:slug", SystemController.getCategoryBySlug);

// Admin-only: view and modify system config
router.get(
  "/",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.getSystemConfig
);
router.put(
  "/",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.updateSystemConfig
);

// Auto-extend/time configs (Admin)
router.put(
  "/auto-extend-before",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.updateAutoExtendBefore
);
router.put(
  "/auto-extend-duration",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.updateAutoExtendDuration
);
router.put(
  "/latest-product-time",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.updateLatestProductTimeConfig
);
router.put(
  "/time-configs",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.updateTimeConfigs
);

// Admin can list, approve, reject
// ===== Hoang =====
router.get(
  "/seller-requests",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.listSellerRequests
);

router.put(
  "/seller-requests/:bidderId/approve",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.approveSellerRequest
);
router.delete(
  "/seller-requests/:bidderId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.rejectSellerRequest
);
// ===== Hoang =====

// Categories (Admin)

// GET /system/categories - Get product description by ID
router.get("/categories", SystemController.getCategories);

router.post(
  "/categories",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.addCategory
);
router.put(
  "/categories/:categoryId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.updateCategory
);
router.delete(
  "/categories/:categoryId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.removeCategory
);

router.get(
  "/users",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.listUsers
);

router.get(
  "/products",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.listProducts
);

router.delete(
  "/products/:productId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  SystemController.removeProduct
);

module.exports = router;

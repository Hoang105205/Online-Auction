const express = require("express");
const router = express.Router();

const {
  getUserBasicProfile,
  updateUserProfile,
  updateUserPassword,
  getFeedback,
  addToWatchList,
  removeFromWatchList,
  getWatchList,
  getParticipatingAuctions,
  getMyProducts,
} = require("../controllers/UserController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// Route: /api/users
router.get("/", verifyJWT, verifyRoles(ROLES_LIST.Bidder), getUserBasicProfile);

router.put(
  "/info",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  updateUserProfile
);

router.put(
  "/password",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  updateUserPassword
);

router.get("/feedback", verifyJWT, verifyRoles(ROLES_LIST.Bidder), getFeedback);

router.post(
  "/watchlist",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  addToWatchList
);

router.delete(
  "/watchlist",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  removeFromWatchList
);

router.get(
  "/watchlist",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  getWatchList
);

router.get(
  "/participating-auctions",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  getParticipatingAuctions
);

router.get(
  "/my-products",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  getMyProducts
);

module.exports = router;

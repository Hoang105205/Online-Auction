const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

const { placeBid } = require("../controllers/AuctionController");

// Route: /api/auction

router.post("/bid", verifyJWT, verifyRoles(ROLES_LIST.Bidder), placeBid);

module.exports = router;

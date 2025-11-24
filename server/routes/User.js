const express = require("express");
const router = express.Router();

const { getUserBasicProfile } = require("../controllers/UserController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// Route: /api/users
router.get("/", verifyJWT, verifyRoles(ROLES_LIST.Bidder), getUserBasicProfile);

module.exports = router;

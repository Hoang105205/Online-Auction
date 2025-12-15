const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

const { updateRatingDraft } = require("../controllers/OrderController");

router.put('/:productId/rating-draft', verifyJWT, verifyRoles(ROLES_LIST.Bidder), updateRatingDraft);

module.exports = router;
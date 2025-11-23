const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");

// GET /products/:id - Get basic details of a product by ID
router.get("/:id", ProductController.getProductBasicDetails);

// GET /products/:id/description - Get product description by ID
router.get("/:id/description", ProductController.getProductDescription);

// PUT /products/:id/description - Update product description by ID
router.put("/:id/description", ProductController.updateDescription);

// GET /products/:id/qa - Get product Q&A by ID
router.get("/:id/qa", ProductController.getProductQA);

// POST /products/:id/qa - Add a new Q entry for a product by ID
router.post("/:id/qa", ProductController.addQuestion);

// POST /products/:id/qa/reply/:chatId - Add a new A entry for a product by ID
router.post("/:id/qa/:chatId/reply", ProductController.addReply);

// GET /products/:id/auction-history - Get auction history details for a product by ID
router.get("/:id/auction-history", ProductController.getAuctionHistory);

// GET /products/:id/related - Get related product by ID
router.get("/:id/related", ProductController.getRelatedProduct);

// GET /products/:id/time-remaining - Caculate product remaining auction time by ID
router.get("/:id/time-remaining", ProductController.getTimeRemaining);

module.exports = router;

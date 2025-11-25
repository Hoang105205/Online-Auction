const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");

// GET /products/description/:id - Get product description by ID
router.get("/description/:id", ProductController.getProductDescription);

// PUT /products/description/:id - Update product description by ID
router.put("/description/:id", ProductController.updateDescription);

// GET /products/qa/:id - Get product Q&A by ID
router.get("/qa/:id", ProductController.getProductQA);

// POST /products/qa/:id - Add a new Q entry for a product by ID
router.post("/qa/:id", ProductController.addQuestion);

// POST /products/qa/:id/reply/:chatId - Add a new A entry for a product by ID
router.post("/qa/:id/reply/:chatId", ProductController.addReply);

// GET /products/auction-history/:id - Get auction history details for a product by ID
router.get("/auction-history/:id", ProductController.getAuctionHistory);

// GET /products/related/:id - Get related product by ID
router.get("/related/:id", ProductController.getRelatedProduct);

// GET /products/:id - Get basic details of a product by ID
router.get("/:id", ProductController.getProductBasicDetails);

module.exports = router;

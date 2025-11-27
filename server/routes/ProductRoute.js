const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");

// POST /products - Create product (mock implementation for now)
router.post("/", async (req, res) => {
  try {
    // Create a mock product id and echo back basic info
    const id = String(Date.now());
    const product = {
      _id: id,
      name: req.body.name || "(Tên sản phẩm mẫu)",
      startingPrice: req.body.startingPrice || 0,
      step: req.body.step || 0,
      category: req.body.category || null,
      subcategory: req.body.subcategory || null,
      endDate: req.body.endDate || null,
      description: req.body.description || "",
      images: [],
    };

    return res.status(201).json({ _id: id, product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

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

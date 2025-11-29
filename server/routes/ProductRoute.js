const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = require("../config/cloudinaryStorage");
const upload = multer({ storage });

const ProductController = require("../controllers/ProductController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

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


// GET /products/description/:id - Get product description by ID
router.get("/description/:id", ProductController.getProductDescription); // public 

// PUT /products/description/:id - Update product description by ID
router.put("/description/:id", ProductController.updateDescription); // protected (seller only)

// GET /products/auction/:id - Get auction details of a product by ID
router.get("/auction/:id", ProductController.getProductAuction); // protected (bidder only)

// GET /products/qa/:id - Get product Q&A by ID
router.get("/qa/:id", ProductController.getProductQA); // public

// POST /products/qa/:id - Add a new Q entry for a product by ID
router.post("/qa/:id", ProductController.addQuestion); // protected (bidder only)

// POST /products/qa/:id/reply/:chatId - Add a new A entry for a product by ID
router.post("/qa/:id/reply/:chatId", ProductController.addReply); // protected (seller only)

// GET /products/auction-history/:id - Get auction history details for a product by ID
router.get("/auction-history/:id", ProductController.getAuctionHistory); // protected (bidder only)

// GET /products/related/:id - Get related product by ID
router.get("/related/:id", ProductController.getRelatedProduct); // public

// GET /products/:id - Get basic details of a product by ID
router.get("/:id", ProductController.getProductBasicDetails); // public

router.post(
  "/:id/image",
  verifyJWT,
  verifyRoles(ROLES_LIST.Seller),
  upload.single("image"),
  ProductController.uploadImage
);

module.exports = router;

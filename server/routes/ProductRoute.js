const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = require("../config/cloudinaryStorage");
const upload = multer({ storage });
// memory upload for creating product so we can upload to Cloudinary after productId exists
const memoryUpload = multer({ storage: multer.memoryStorage() });

const ProductController = require("../controllers/ProductController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// POST /products - Create product with optional images upload
router.post(
  "/",
  verifyJWT,
  verifyRoles(ROLES_LIST.Seller),
  memoryUpload.array("images", 10),
  ProductController.createProduct
);

// GET /products/description/:id - Get product description by ID
router.get("/description/:id", ProductController.getProductDescription); // public

// PUT /products/description/:id - Update product description by ID
router.put(
  "/description/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Seller),
  ProductController.updateDescription
); // protected (seller only)

// GET /products/auction/:id - Get auction details of a product by ID
router.get("/auction/:id", ProductController.getProductAuction); // public

// GET /products/qa/:id - Get product Q&A by ID
router.get("/qa/:id", ProductController.getProductQA); // public

// POST /products/qa/:id - Add a new Q entry for a product by ID
router.post(
  "/qa/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder, ROLES_LIST.Seller),
  ProductController.addQuestion
); // protected (bidder only)

// POST /products/qa/:id/reply/:chatId - Add a new A entry for a product by ID
router.post(
  "/qa/:id/reply/:chatId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Seller),
  ProductController.addReply
); // protected (seller only)

// GET /products/auction-history/:id - Get auction history details for a product by ID
router.get(
  "/auction-history/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Bidder),
  ProductController.getAuctionHistory
); // protected (bidder only)

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

// GET /products - Get first 5 products
router.get("/", ProductController.getFirstProducts);

module.exports = router;

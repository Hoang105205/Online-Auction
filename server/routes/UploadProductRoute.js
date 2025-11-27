const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = require("../config/cloudinaryStorage");
const upload = multer({ storage });
const UploadProductController = require("../controllers/UploadProductController");

// POST /products/:id/image - upload one image for product to Cloudinary
router.post(
  "/:id/image",
  upload.single("image"),
  UploadProductController.uploadImage
);

module.exports = router;

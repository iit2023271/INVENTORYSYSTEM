// ============================================================
// productRoutes.js — PRODUCT ROUTES
// ============================================================
// PURPOSE:
//   Defines all endpoints related to product management.
//   This is the most complex route file because products have
//   many operations: add, view, update name/category/image,
//   soft-delete, restore, enable, disable.
//
// SPECIAL MIDDLEWARE — upload.single("image"):
//   For routes that accept an image file (add product, update image),
//   we add Multer's upload middleware BEFORE the controller.
//   It intercepts the request, uploads the file to Cloudinary,
//   and stores the result in req.file for the controller to use.
//
//   upload.single("image") means:
//     "Process ONE file from the form field named 'image'"
//   The field name must match what the frontend sends in FormData.
//
// MIDDLEWARE CHAIN (for image upload routes):
//   Request → authMiddleware → upload.single("image") → controller
//   1. authMiddleware checks the JWT token
//   2. upload.single uploads the image to Cloudinary
//   3. controller saves the Cloudinary URL to MongoDB
//
// ⚠️ IMPORTANT — ROUTE ORDER MATTERS IN EXPRESS:
//   GET "/deleted" MUST be defined BEFORE GET "/:id" (if it existed).
//   If "/:id" came first, Express would match "/deleted" as an id
//   (treating "deleted" as a MongoDB _id string) and it would fail.
//   Always put specific routes before dynamic ones.
//   Similarly, GET "/" (public) is placed LAST so it doesn't shadow other GETs.
//
// ACCESS CONTROL:
//   OWNER ONLY (protected): all POST, PUT, DELETE routes
//   PUBLIC: GET "/" (customers need to browse products)
//
// MOUNTED AT (in server.js):
//   app.use("/api/products", productRoutes)
// ============================================================

const express = require("express");
const {
  addProduct,
  getProducts,
  deleteProduct,
  getDeletedProducts,
  restoreProduct,
  updateProductName,
  updateProductImage,
  disableProduct,
  enableProduct,
  updateProductCategory,
} = require("../controllers/productController");

const authMiddleware       = require("../middleware/authMiddleware");
const { upload }           = require("../middleware/cloudinaryConfig"); // Multer + Cloudinary

const router = express.Router();

// ── OWNER-ONLY ROUTES (all protected with authMiddleware) ─────────

// GET /api/products/deleted
// ⚠️ Must come BEFORE any dynamic /:id routes to avoid "deleted" being
// treated as an ID. Returns all soft-deleted (archived) products.
router.get("/deleted", authMiddleware, getDeletedProducts);

// PUT /api/products/:id/restore
// Restore a soft-deleted product (sets isDeleted=false, isActive=true)
router.put("/:id/restore", authMiddleware, restoreProduct);

// PUT /api/products/:id/disable
// Disable a product (isActive=false) — hides it from customers temporarily
router.put("/:id/disable", authMiddleware, disableProduct);

// PUT /api/products/:id/enable
// Re-enable a disabled product (isActive=true)
router.put("/:id/enable", authMiddleware, enableProduct);

// PUT /api/products/:id/name
// Update just the product's name
router.put("/:id/name", authMiddleware, updateProductName);

// PUT /api/products/:id/category
// Update just the product's category
router.put("/:id/category", authMiddleware, updateProductCategory);

// PUT /api/products/:id/image
// Update the product image:
//   authMiddleware → verifies the owner's token
//   upload.single("image") → uploads new image to Cloudinary, deletes old one
//   updateProductImage → saves the new Cloudinary URL to MongoDB
router.put(
  "/:id/image",
  authMiddleware,
  upload.single("image"),    // Multer middleware: processes 1 file from "image" field
  updateProductImage
);

// DELETE /api/products/:id
// Soft-delete a product (isDeleted=true) + delete its image from Cloudinary
router.delete("/:id", authMiddleware, deleteProduct);

// POST /api/products
// Add a new product with an optional image:
//   authMiddleware → verifies owner
//   upload.single("image") → uploads image to Cloudinary
//   addProduct → saves product + Cloudinary URL to MongoDB
router.post(
  "/",
  authMiddleware,
  upload.single("image"),    // optional: product can be created without an image
  addProduct
);

// ── PUBLIC ROUTE ──────────────────────────────────────────────────

// GET /api/products
// ⚠️ Placed LAST so it doesn't accidentally match before the specific routes above.
// Customers use this to browse available products (isDeleted=false).
router.get("/", getProducts);

module.exports = router;
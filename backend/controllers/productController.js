// ============================================================
// productController.js — MANAGE PRODUCTS
// ============================================================
// PURPOSE:
//   Full CRUD + soft-delete + image management for products.
//
// KEY CONCEPTS:
//
//   CLOUDINARY:
//     A cloud image hosting service. Instead of storing images
//     on our own server (which would use up disk space and break
//     on deploys), we upload them to Cloudinary and store just
//     the URL + the image's "public_id" in our database.
//     The public_id lets us delete the image from Cloudinary later.
//
//   SOFT DELETE vs. HARD DELETE:
//     Hard delete = permanently remove the document from MongoDB. ❌
//     Soft delete = set isDeleted: true and keep the document.   ✅
//     Why soft delete? We might need order history that references
//     this product. Deleting it would break those references.
//
//   isActive vs. isDeleted:
//     isDeleted: true  → product is "archived", hidden from all views
//     isActive: false  → product exists but is temporarily out of stock
//                        (customers can't order it right now)
//
//   req.file:
//     The multer middleware (configured in cloudinaryConfig.js)
//     intercepts file uploads and uploads them to Cloudinary
//     BEFORE this controller runs. The result is stored in req.file.
//       req.file.path     = the Cloudinary image URL
//       req.file.filename = the Cloudinary public_id (used for deletion)
// ============================================================

const Product = require("../models/Product");
const { cloudinary } = require("../middleware/cloudinaryConfig");

// ============================================================
// ADD A PRODUCT (with optional image upload)
// Route: POST /api/products
// Body: form-data { name, category, lowStockLevel, image (file) }
// ============================================================
exports.addProduct = async (req, res) => {
  try {
    const { name, category, lowStockLevel } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!name || !category) {
      return res.status(400).json({ message: "Name & category required" });
    }

    // ── Build and save the product ────────────────────────────
    // If an image was uploaded, req.file will be populated by multer.
    // If no image → store empty string (product still created).
    const product = new Product({
      name,
      category,
      lowStockLevel: Number(lowStockLevel) || 5, // default low-stock alert threshold = 5
      image: req.file ? req.file.path : "", // Cloudinary URL
      cloudinaryId: req.file ? req.file.filename : "", // Cloudinary public_id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GET ALL PRODUCTS (active + inactive, but not deleted)
// Route: GET /api/products
// ============================================================
exports.getProducts = async (req, res) => {
  try {
    // Fetch all products that have NOT been soft-deleted.
    // This includes both active (in-stock) and inactive (out-of-stock) products.
    // The owner needs to see all of them to manage stock.
    const products = await Product.find({ isDeleted: false });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// UPDATE PRODUCT IMAGE
// Route: PATCH /api/products/:id/image
// Body: form-data { image (file) }
// ============================================================
exports.updateProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ── Require an image file to proceed ─────────────────────
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // ── Delete the OLD image from Cloudinary first ────────────
    // If we don't delete it, old images pile up and waste storage.
    // We use the cloudinaryId (public_id) we saved when the product was created.
    if (product.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
        // Even if deletion fails, we continue — a broken old image
        // shouldn't block updating to a new one.
      }
    }

    // ── Save the new image details ────────────────────────────
    product.image = req.file.path; // new Cloudinary URL
    product.cloudinaryId = req.file.filename; // new public_id for future deletion
    await product.save();

    res.json(product);
  } catch (err) {
    console.error("UPDATE IMAGE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// SOFT DELETE A PRODUCT (also removes image from Cloudinary)
// Route: DELETE /api/products/:id
// ============================================================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ── Delete the product image from Cloudinary ──────────────
    // No point keeping the image if the product is deleted.
    if (product.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
        // Continue with soft-delete even if Cloudinary fails.
        // We don't want a Cloudinary error to block the delete operation.
      }
    }

    // ── Soft delete: mark as deleted and deactivate ───────────
    // We do NOT call product.remove() — that would permanently erase it.
    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GET DELETED (ARCHIVED) PRODUCTS
// Route: GET /api/products/deleted
// ============================================================
exports.getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// RESTORE A SOFT-DELETED PRODUCT
// Route: PATCH /api/products/:id/restore
// ============================================================
exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Flip both flags back to their active state
    product.isDeleted = false;
    product.isActive = true;
    await product.save();

    res.json({ message: "Product restored" });
  } catch (err) {
    console.error("RESTORE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// UPDATE PRODUCT NAME
// Route: PATCH /api/products/:id/name
// Body: { name: "New Name" }
// ============================================================
exports.updateProductName = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate: name must be non-empty after trimming whitespace
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Product name required" });
    }

    // findByIdAndUpdate(id, update, { new: true })
    //   → finds by ID, applies update, and returns the UPDATED document.
    //   Without { new: true }, Mongoose returns the OLD document.
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() }, // .trim() removes leading/trailing spaces
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("UPDATE NAME ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// DISABLE A PRODUCT (temporarily hide from customers)
// Route: PATCH /api/products/:id/disable
// ============================================================
exports.disableProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // isActive: false → product won't appear in the customer ordering menu.
    // The product still EXISTS in the DB (not deleted).
    product.isActive = false;
    await product.save();

    res.json({ message: "Product disabled" });
  } catch (err) {
    console.error("DISABLE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to disable product" });
  }
};

// ============================================================
// ENABLE A PRODUCT (make it available to customers again)
// Route: PATCH /api/products/:id/enable
// ============================================================
exports.enableProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = true;
    await product.save();

    res.json({ message: "Product enabled" });
  } catch (err) {
    console.error("ENABLE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to enable product" });
  }
};

// ============================================================
// UPDATE PRODUCT CATEGORY
// Route: PATCH /api/products/:id/category
// Body: { category: "Sweets" }
// ============================================================
exports.updateProductCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Category required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { category: category.trim() },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Failed to update category" });
  }
};

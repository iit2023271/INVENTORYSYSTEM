// ============================================================
// rawMaterialRoutes.js — RAW MATERIAL ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for managing the list of raw materials
//   (ingredients/supplies like Sugar, Milk, Ghee, etc.).
//
// ACCESS CONTROL:
//   All routes are PROTECTED — only the owner manages raw materials.
//   Customers never interact with raw materials directly.
//
// SOFT DELETE PATTERN REFLECTED IN ROUTES:
//   DELETE /:id        → soft-delete (sets isActive=false, keeps document)
//   GET /deleted       → view all soft-deleted materials
//   PUT /:id/restore   → restore a soft-deleted material (sets isActive=true)
//
// ⚠️ ROUTE ORDER MATTERS:
//   GET "/deleted" MUST come BEFORE any potential GET "/:id" route.
//   If "/:id" existed and came first, Express would match the string
//   "deleted" as a MongoDB _id parameter, causing a CastError.
//   Always define specific static routes before dynamic :param routes.
//
// MOUNTED AT (in server.js):
//   app.use("/api/raw-materials", rawMaterialRoutes)
//
// FULL URLS:
//   POST   /api/raw-materials           → Add (or restore) a raw material
//   GET    /api/raw-materials           → Get all active raw materials
//   GET    /api/raw-materials/deleted   → Get all soft-deleted materials
//   DELETE /api/raw-materials/:id       → Soft-delete a raw material
//   PUT    /api/raw-materials/:id/restore → Restore a soft-deleted material
// ============================================================

const express = require("express");
const {
  addRawMaterial,
  getRawMaterials,
  deleteRawMaterial,
  getDeletedRawMaterials,
  restoreRawMaterial
} = require("../controllers/rawMaterialController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/raw-materials
// PROTECTED — Add a new raw material (or restore if previously soft-deleted).
router.post("/", authMiddleware, addRawMaterial);

// GET /api/raw-materials/deleted
// PROTECTED — View all soft-deleted (archived) raw materials.
// ⚠️ Must be defined BEFORE /:id routes to avoid "deleted" being parsed as an ID.
router.get("/deleted", authMiddleware, getDeletedRawMaterials);

// GET /api/raw-materials
// PROTECTED — View all currently active raw materials.
router.get("/", authMiddleware, getRawMaterials);

// DELETE /api/raw-materials/:id
// PROTECTED — Soft-delete a raw material (sets isActive=false).
// The document stays in the database to preserve purchase history integrity.
router.delete("/:id", authMiddleware, deleteRawMaterial);

// PUT /api/raw-materials/:id/restore
// PROTECTED — Restore a previously soft-deleted raw material.
router.put("/:id/restore", authMiddleware, restoreRawMaterial);

module.exports = router;
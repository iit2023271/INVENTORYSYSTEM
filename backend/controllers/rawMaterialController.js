// ============================================================
// rawMaterialController.js — MANAGE RAW MATERIALS
// ============================================================
// PURPOSE:
//   Raw materials are the ingredients or supplies used to make
//   products (e.g., Sugar, Milk, Ghee, Flour).
//
//   The owner can:
//     - Add a new raw material
//     - Get all active raw materials
//     - Soft delete a raw material
//     - Restore a soft-deleted material
//     - Get all deleted materials
//
// SMART ADD (Restore if previously deleted):
//   If a material with the same name already exists but is inactive,
//   instead of rejecting with "already exists", we RESTORE it.
//   This prevents duplicates while handling the common case of
//   re-adding a previously removed material.
//
// UNIT:
//   Each raw material has a unit (e.g., "kg", "litre", "piece")
//   so purchases can be recorded with the correct measurement.
// ============================================================

const RawMaterial = require("../models/RawMaterial");


// ============================================================
// ADD RAW MATERIAL (or restore if previously deleted)
// Route: POST /api/raw-materials
// Body: { name: "Sugar", unit: "kg" }
// Returns: Full list of active raw materials
// ============================================================
exports.addRawMaterial = async (req, res) => {
  try {

    const { name, unit } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!name || !unit) {
      return res.status(400).json({ message: "Name and unit required" });
    }

    // ── Check if this material already exists (any status) ────
    const existing = await RawMaterial.findOne({ name });

    if (existing) {
      // If it exists but was soft-deleted → restore it instead of creating a duplicate.
      // This handles the case: "We used Sugar before, deleted it, now we need it again."
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unit     = unit; // update unit in case it changed
        await existing.save();

        // Return the full updated list of active materials
        const materials = await RawMaterial.find({ isActive: true });
        return res.json(materials);
      }

      // If it exists and is already active → it's a true duplicate.
      return res.status(400).json({ message: "Raw material already exists" });
    }

    // ── Create new raw material ───────────────────────────────
    await RawMaterial.create({ name, unit });

    // Return the full updated list of active materials (not just the new one).
    // This is convenient for frontends that display the full list after any change.
    const materials = await RawMaterial.find({ isActive: true });
    res.status(201).json(materials);

  } catch (error) {
    console.error("ADD RAW MATERIAL ERROR:", error);
    res.status(500).json({ message: "Failed to add raw material" });
  }
};


// ============================================================
// GET ALL ACTIVE RAW MATERIALS
// Route: GET /api/raw-materials
// ============================================================
exports.getRawMaterials = async (req, res) => {
  try {

    // Only return materials that are currently active (not soft-deleted).
    const materials = await RawMaterial.find({ isActive: true });
    res.json(materials);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch raw materials" });
  }
};


// ============================================================
// SOFT DELETE A RAW MATERIAL
// Route: DELETE /api/raw-materials/:id
// ============================================================
exports.deleteRawMaterial = async (req, res) => {
  try {

    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Raw material not found" });
    }

    // Soft delete: just flip isActive to false.
    // The document stays in the DB — purchase history that references
    // this material remains intact and queryable.
    material.isActive = false;
    await material.save();

    res.json({ message: "Raw material deleted" });

  } catch (error) {
    console.error("DELETE RAW MATERIAL ERROR:", error);
    res.status(500).json({ message: "Failed to delete raw material" });
  }
};


// ============================================================
// GET ALL DELETED (ARCHIVED) RAW MATERIALS
// Route: GET /api/raw-materials/deleted
// ============================================================
exports.getDeletedRawMaterials = async (req, res) => {
  try {

    // Return materials where isActive = false (soft-deleted)
    const materials = await RawMaterial.find({ isActive: false });
    res.json(materials);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch deleted materials" });
  }
};


// ============================================================
// RESTORE A SOFT-DELETED RAW MATERIAL
// Route: PATCH /api/raw-materials/:id/restore
// ============================================================
exports.restoreRawMaterial = async (req, res) => {
  try {

    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Flip isActive back to true — material is active again.
    material.isActive = true;
    await material.save();

    res.json({ message: "Raw material restored" });

  } catch (err) {
    res.status(500).json({ message: "Failed to restore material" });
  }
};
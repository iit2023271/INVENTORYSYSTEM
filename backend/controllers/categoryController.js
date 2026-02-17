// ============================================================
// categoryController.js — MANAGE PRODUCT CATEGORIES
// ============================================================
// PURPOSE:
//   Categories group products (e.g., "Sweets", "Snacks", "Drinks").
//   This controller lets the owner:
//     - Add a new category
//     - Fetch all active categories
//
// NOTE:
//   We check for duplicates before creating so the same category
//   name can't be added twice (e.g., two entries for "Sweets").
// ============================================================

const Category = require("../models/Category");

// ============================================================
// CREATE A NEW CATEGORY
// Route: POST /api/categories
// Body: { name: "Sweets" }
// ============================================================
exports.createCategory = async (req, res) => {
  try {

    // ── STEP 1: Read category name from request body ──────────
    const { name } = req.body;

    // ── STEP 2: Validate — name must be provided ─────────────
    if (!name) {
      return res.status(400).json({ message: "Category name required" });
      // 400 = Bad Request (the client sent incomplete data)
    }

    // ── STEP 3: Check if this category already exists ─────────
    // findOne() searches for a single matching document.
    // If found → don't create a duplicate, return an error.
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
      // 409 = Conflict (trying to create something that already exists)
    }

    // ── STEP 4: Create and save the category in MongoDB ───────
    // Category.create() is a shorthand for:
    //   new Category({ name }) and then .save()
    const category = await Category.create({ name });

    // ── STEP 5: Return the newly created category ─────────────
    res.status(201).json(category);
    // 201 = Created

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================
// GET ALL ACTIVE CATEGORIES
// Route: GET /api/categories
// Returns: Array of active categories sorted A-Z
// ============================================================
exports.getCategories = async (req, res) => {
  try {

    // Find only categories where isActive = true (not soft-deleted).
    // .sort({ name: 1 }) → sorts alphabetically (1 = ascending, -1 = descending).
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.json(categories); // 200 OK (default when you just call res.json)

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ============================================================
// categoryRoutes.js — CATEGORY ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for creating and fetching product categories.
//
// ACCESS CONTROL — TWO LEVELS:
//   Some routes are PUBLIC (anyone can access them).
//   Some routes are PROTECTED (only the authenticated owner can access them).
//
//   Protection is added using authMiddleware — a function that
//   checks if the request has a valid JWT token before letting it through.
//
//   Route definition format:
//     router.METHOD("path", authMiddleware, controllerFn)
//                              ↑
//                     This is the guard. If the token is
//                     invalid/missing, the request is blocked
//                     here and never reaches the controller.
//
// MOUNTED AT (in server.js):
//   app.use("/api/categories", categoryRoutes)
//
// FULL URLS:
//   POST /api/categories  → Create category (owner only)
//   GET  /api/categories  → Get all active categories (public)
// ============================================================

const express = require("express");
const {
  createCategory,
  getCategories
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/categories
// PROTECTED — only the authenticated owner can create categories.
// authMiddleware runs first; if token is invalid → request is blocked.
router.post("/", authMiddleware, createCategory);

// GET /api/categories
// PUBLIC — customers and the owner can both see available categories.
// No authMiddleware here, so anyone can call this endpoint.
router.get("/", getCategories);

module.exports = router;
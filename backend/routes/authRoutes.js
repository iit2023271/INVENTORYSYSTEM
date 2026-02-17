// ============================================================
// authRoutes.js — AUTHENTICATION ROUTES
// ============================================================
// PURPOSE:
//   Defines the URL endpoints for user registration and login.
//   These are PUBLIC routes — no token/authentication required
//   to access them (makes sense: you need to login to GET a token).
//
// HOW EXPRESS ROUTER WORKS:
//   Instead of defining all routes in one giant file (server.js),
//   we use express.Router() to create "mini routers" per feature.
//   This keeps code organized and modular.
//
//   In server.js, this router is mounted like:
//     app.use("/api/auth", authRoutes);
//   So the full URLs become:
//     POST /api/auth/register
//     POST /api/auth/login
//
// ROUTE STRUCTURE:
//   router.METHOD("path", ...middlewares, controllerFunction)
//   • METHOD     → HTTP verb (get, post, put, delete, patch)
//   • path       → URL path relative to where the router is mounted
//   • controller → the function that handles the request & sends response
// ============================================================

const express = require("express");
const { register, login } = require("../controllers/authController");

// Create a new Router instance (a mini Express app for just these routes)
const router = express.Router();

// POST /api/auth/register
// Creates the one-time owner account (protected by a secret header in the controller)
router.post("/register", register);

// POST /api/auth/login
// Verifies credentials and returns a JWT token
router.post("/login", login);

// Export so server.js can mount it with: app.use("/api/auth", authRoutes)
module.exports = router;
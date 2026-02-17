// ============================================================
// server.js — MAIN APPLICATION ENTRY POINT
// ============================================================
// PURPOSE:
//   This is the heart of the backend. When you run "node server.js"
//   (or "npm start"), this file:
//     1. Creates the Express application
//     2. Connects to MongoDB
//     3. Registers all middleware
//     4. Mounts all route files to their URL prefixes
//     5. Sets up a global error handler
//     6. Starts listening for incoming HTTP requests
//
// EXECUTION ORDER (important to understand):
//   Imports → app creation → middleware → routes → error handler → listen
//   Express processes each request through this chain TOP TO BOTTOM.
//
// WHAT IS EXPRESS?
//   Express is a web framework for Node.js. It simplifies:
//     • Routing (mapping URLs to handler functions)
//     • Middleware (running code between request and response)
//     • Sending responses (res.json, res.send, etc.)
//
// WHAT IS MIDDLEWARE?
//   Middleware = functions that run BEFORE your route handlers.
//   They process the request (req) and can modify it before it
//   reaches the controller. They follow this pattern:
//     (req, res, next) => { /* do something */ next(); }
//   Calling next() passes control to the next middleware/handler.
//
// ENVIRONMENT VARIABLES (.env file):
//   Sensitive config (DB URI, JWT secret, Cloudinary keys, PORT) is
//   stored in a .env file (not committed to Git).
//   require("dotenv").config() loads those values into process.env
//   so the rest of the code can access them via process.env.VARIABLE_NAME.
// ============================================================

const express = require("express");
const cors    = require("cors");       // handles Cross-Origin Resource Sharing
const path    = require("path");       // Node.js built-in module for file paths
const multer  = require("multer");     // needed for the global error handler
require("dotenv").config();            // loads .env file into process.env

const connectDB = require("./config/db"); // our MongoDB connection function

// ── CREATE THE EXPRESS APP ────────────────────────────────────────
// app is the core Express instance. All middleware and routes are
// attached to this object.
const app = express();


// ============================================================
// GLOBAL MIDDLEWARE
// These run on EVERY incoming request before hitting any route.
// ============================================================

// cors() — Cross-Origin Resource Sharing
//   Browsers block requests from one domain to another by default (security).
//   cors() adds response headers that tell the browser:
//   "It's OK to accept requests from other origins (our frontend URL)."
//   Without this, your React frontend would be blocked from calling this API.
app.use(cors());

// express.json() — Body Parser
//   Parses incoming requests with JSON bodies.
//   Without this, req.body would be undefined when the frontend
//   sends JSON data (e.g., login credentials, order details).
//   After this middleware, JSON body data is available at req.body.
app.use(express.json());


// ============================================================
// STATIC FILE SERVING
// ============================================================
// express.static() serves files from a folder as public URLs.
// path.join(__dirname, "uploads") builds the absolute path to
// the "uploads" folder in the same directory as server.js.
//
// Example: A file at /uploads/photo.jpg
//          becomes accessible at: http://localhost:5000/uploads/photo.jpg
//
// NOTE: With Cloudinary integration, images are stored in the cloud,
// not in this folder. This is kept for backward compatibility.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ============================================================
// TEST ROUTE (Health Check)
// ============================================================
// A simple GET route to verify the server is running.
// Useful for checking deployment status or API availability.
// No middleware, no controller — just a quick response.
app.get("/", (req, res) => {
  res.send("MY SHOP Bakery Backend is Running");
});


// ============================================================
// DATABASE CONNECTION
// ============================================================
// connectDB() attempts to connect to MongoDB using the URI
// from process.env.MONGO_URI (set in .env).
// If the connection fails, the process exits with code 1.
// We call this BEFORE registering routes so the DB is ready
// by the time the first request arrives.
connectDB();


// ============================================================
// ROUTE MOUNTING
// ============================================================
// app.use(prefix, routerFile) mounts a router at a URL prefix.
// Every route inside that file is relative to the prefix.
//
// Example:
//   authRoutes has: router.post("/login", ...)
//   Mounted at "/api/auth"
//   Full URL: POST /api/auth/login
//
// This pattern keeps server.js clean — it just delegates to
// the individual route files for the actual route definitions.
app.use("/api/auth",            require("./routes/authRoutes"));
app.use("/api/products",        require("./routes/productRoutes"));
app.use("/api/orders",          require("./routes/orderRoutes"));
app.use("/api/custom-orders",   require("./routes/customOrderRoutes"));
app.use("/api/raw-purchases",   require("./routes/rawPurchaseRoutes"));
app.use("/api/raw-materials",   require("./routes/rawMaterialRoutes"));
app.use("/api/expense-reports", require("./routes/expenseReportRoutes"));
app.use("/api/profit-reports",  require("./routes/profitReportRoutes"));
app.use("/api/categories",      require("./routes/categoryRoutes"));
app.use("/api/prices",          require("./routes/productPriceRoutes"));
app.use("/api/stock",           require("./routes/stockRoutes"));
app.use("/api/customers",       require("./routes/customerRoutes"));


// ============================================================
// PROTECTED TEST ROUTE
// ============================================================
// This route is for testing authMiddleware during development.
// If you hit GET /api/test with a valid JWT token in the
// Authorization header, it returns the decoded user info.
// If the token is invalid/missing, authMiddleware blocks it.
const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/test", authMiddleware, (req, res) => {
  // req.user is set by authMiddleware after verifying the JWT token
  res.json({
    message: "You are logged in",
    user: req.user  // contains: { id, role } from the decoded token
  });
});


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
// This is a SPECIAL Express middleware for error handling.
// It has 4 parameters: (err, req, res, next)
// Express identifies it as an error handler because of the
// extra "err" parameter at the start.
//
// When does this run?
//   If any middleware or route calls next(error) or throws an error,
//   Express skips all regular middleware and jumps to here.
//
// WHY IS THIS CRITICAL FOR MULTER?
//   When multer rejects a file (wrong type, too large, etc.),
//   it throws a MulterError. Without this handler, the error
//   would crash the server or send an unformatted 500 response.
//   Here we catch it and send a clean 400 response instead.
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  // Handle Multer-specific errors (file upload errors)
  // e.g., file too large, wrong file type
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message // e.g., "File too large"
    });
  }

  // Handle all other errors (DB errors, validation errors, etc.)
  if (err) {
    return res.status(500).json({
      message: err.message || "Server error"
    });
  }

  // If somehow we reach here with no error, continue
  next();
});


// ============================================================
// START THE SERVER
// ============================================================
// process.env.PORT is set by hosting platforms (Render, Railway, Heroku, etc.)
// If not set (local development), we fall back to port 5000.
// app.listen() starts the server and begins accepting connections.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
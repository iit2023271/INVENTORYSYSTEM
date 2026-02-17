// ============================================================
// authMiddleware.js — JWT AUTHENTICATION MIDDLEWARE
// ============================================================
// PURPOSE:
//   This middleware protects private routes. Before a request
//   reaches a controller, it passes through here first.
//   If the user doesn't have a valid JWT token → request is blocked.
//   If the token is valid → request continues to the controller.
//
// WHAT IS MIDDLEWARE?
//   Middleware is a function that sits between the request and the
//   response. In Express, it follows this signature:
//     (req, res, next) => { ... }
//   Calling next() passes control to the next function in the chain.
//
// WHAT IS JWT?
//   JWT (JSON Web Token) is a way to securely transmit user identity.
//   When a user logs in, we give them a token (a long encoded string).
//   On every future request, they send this token in the header so
//   we know who they are — without checking the database every time.
//
// TOKEN FORMAT (in HTTP header):
//   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// ============================================================

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  // Step 1: Read the Authorization header from the incoming request.
  // The header looks like: "Bearer <token>"
  const authHeader = req.headers.authorization;

  // If there's no Authorization header at all, block the request immediately.
  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied" });
    // 401 = Unauthorized (not logged in)
  }

  // Step 2: Extract just the token part.
  // authHeader = "Bearer abc123xyz"
  // split(" ") = ["Bearer", "abc123xyz"]
  // [1] = "abc123xyz" ← the actual token
  const token = authHeader.split(" ")[1];

  try {
    // Step 3: Verify the token using our secret key (stored in .env).
    // jwt.verify() decodes the token AND checks it hasn't been tampered with.
    // If valid, it returns the payload we stored when we created the token
    // (e.g., { id: "user123", role: "admin" }).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach the decoded user info to the request object.
    // Now any controller that runs after this middleware can access
    // req.user.id or req.user.role without hitting the database again.
    req.user = decoded;

    // Step 5: Call next() to pass control to the actual route handler.
    next();

  } catch (error) {
    // If the token is expired, forged, or invalid → block the request.
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Export so it can be used in route files like:
//   router.get("/protected", authMiddleware, controller.someFunction);
module.exports = authMiddleware;
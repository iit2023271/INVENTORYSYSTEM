// ============================================================
// authController.js — OWNER REGISTRATION & LOGIN
// ============================================================
// PURPOSE:
//   Handles two things:
//   1. REGISTER  → Creates one and only one "admin/owner" account.
//   2. LOGIN     → Verifies credentials and returns a JWT token.
//
// SECURITY DESIGN DECISIONS:
//   • Only ONE owner account can ever exist (enforced in code).
//   • Registration requires a secret header (x-owner-secret) so
//     random people can't create admin accounts.
//   • Passwords are never stored as plain text — they are hashed
//     with bcrypt before saving.
//   • On login, we return a JWT token (not a session/cookie).
// ============================================================

const User    = require("../models/User");
const bcrypt  = require("bcryptjs");  // Used to hash & compare passwords
const jwt     = require("jsonwebtoken"); // Used to create & verify tokens

// ============================================================
// REGISTER OWNER (ONE-TIME, SECURE)
// Route: POST /api/auth/register
// Header required: x-owner-secret: <value from .env>
// ============================================================
exports.register = async (req, res) => {
  try {

    // ── STEP 1: Check the secret header ──────────────────────
    // This is a custom header only the real owner knows.
    // If it's missing or wrong → block the request immediately.
    const secret = req.headers["x-owner-secret"];
    if (!secret || secret !== process.env.OWNER_SECRET) {
      return res.status(401).json({ message: "Unauthorized owner creation" });
      // 401 = Unauthorized
    }

    // ── STEP 2: Block if any user already exists ──────────────
    // We only allow ONE owner account in the entire system.
    // findOne({}) with no filter finds the very first user in the DB.
    const anyUser = await User.findOne({});
    if (anyUser) {
      return res.status(403).json({ message: "Owner already exists" });
      // 403 = Forbidden (you're authenticated but not allowed to do this)
    }

    // ── STEP 3: Get data from request body ───────────────────
    const { name, email, password } = req.body;

    // ── STEP 4: Hash the password ─────────────────────────────
    // NEVER store plain text passwords.
    // bcrypt.hash(password, saltRounds) — saltRounds=10 means bcrypt
    // runs the hashing algorithm 2^10 = 1024 times. Slower = harder to crack.
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── STEP 5: Create the owner account ─────────────────────
    await User.create({
      name,
      email,
      password: hashedPassword, // store the HASHED version, never the plain one
      role: "admin"             // hardcoded — only admins can be registered here
    });

    res.status(201).json({ message: "Owner registered securely" });
    // 201 = Created successfully

  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
    // 500 = Internal Server Error (something broke on our side)
  }
};


// ============================================================
// LOGIN OWNER
// Route: POST /api/auth/login
// Body: { email, password }
// Returns: JWT token + user info
// ============================================================
exports.login = async (req, res) => {
  try {

    // ── STEP 1: Read credentials from request body ────────────
    const { email, password } = req.body;

    // ── STEP 2: Find the user by email in the database ───────
    const user = await User.findOne({ email });

    // If no user found with that email → return generic error.
    // We say "Invalid credentials" instead of "Email not found"
    // to prevent attackers from guessing valid emails.
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ── STEP 3: Compare entered password with stored hash ────
    // bcrypt.compare() hashes the entered password the same way
    // and checks if it matches the stored hash. Returns true/false.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ── STEP 4: Create a JWT token ────────────────────────────
    // jwt.sign(payload, secretKey, options)
    //   payload   = data we embed inside the token (user id and role)
    //   secretKey = used to sign/verify — only our server knows this
    //   expiresIn = token is only valid for 1 day ("1d")
    const token = jwt.sign(
      { id: user._id, role: user.role }, // payload (don't put sensitive info here)
      process.env.JWT_SECRET,            // secret from .env
      { expiresIn: "1d" }               // token expires after 1 day
    );

    // ── STEP 5: Send the token and basic user info back ───────
    // The frontend stores this token (usually in localStorage or a cookie)
    // and sends it in the Authorization header on every future request.
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // Note: we deliberately exclude password and role from the response
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
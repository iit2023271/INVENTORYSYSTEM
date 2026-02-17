// ============================================================
// User.js — USER MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Defines the structure of a "User" document in MongoDB.
//   In this app, there is only ONE user — the bakery owner (admin).
//   The registration logic enforces this single-user constraint.
//
// KEY FIELDS:
//
//   name     → Owner's display name
//
//   email    → Used as the login identifier. unique: true means
//              no two accounts can share the same email (DB-level enforcement).
//
//   password → Stored as a bcrypt HASH, never as plain text.
//              The raw password is NEVER saved. bcrypt converts it to
//              an irreversible hash before it reaches this model.
//              Example stored value: "$2a$10$N9qo8uLOickgx2ZMRZoMy..."
//
//   role     → Describes what type of user this is.
//              In this app it's always "admin" (the owner), but having this
//              field makes it easy to add other roles in future
//              (e.g., "staff", "manager") without changing the schema.
//              Default: "admin" so every registered user is automatically an admin.
//
// SECURITY NOTES:
//   • The password field stores a HASH, not the original password.
//     bcrypt.hash() in authController converts it before saving.
//   • Email uniqueness is enforced at the DB level via unique: true index.
//   • This model does NOT include any token fields — JWT tokens are
//     stateless and generated/verified on-the-fly, not stored in the DB.
//
// TIMESTAMPS:
//   createdAt tells us when the owner account was created.
//   updatedAt tells us when the profile was last modified.
// ============================================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Owner's name (e.g., "Ravi Kumar")
    name: {
      type: String,
      required: true
    },

    // Login email address — must be unique across all users
    email: {
      type: String,
      required: true,
      unique: true // Creates a unique index in MongoDB — duplicate emails are rejected
    },

    // bcrypt-hashed password. The raw password is never stored.
    // The controller hashes it before calling User.create().
    password: {
      type: String,
      required: true
    },

    // User role — defaults to "admin" (the bakery owner)
    // Having a role field makes the system extensible for future staff accounts
    role: {
      type: String,
      default: "admin"
    }
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

// "User" → MongoDB collection: "users"
module.exports = mongoose.model("User", userSchema);
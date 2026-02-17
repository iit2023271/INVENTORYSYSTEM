// ============================================================
// cloudinaryConfig.js — IMAGE UPLOAD CONFIGURATION
// ============================================================
// PURPOSE:
//   Configures Cloudinary (cloud image storage) and Multer
//   (file upload middleware) so our app can accept image uploads
//   and automatically store them in the cloud.
//
// WHAT IS CLOUDINARY?
//   Cloudinary is a cloud-based media management service.
//   Instead of saving uploaded images to our server's disk
//   (which would break on serverless deploys and fill up storage),
//   we upload them to Cloudinary. Cloudinary returns a URL that
//   we store in MongoDB.
//
// WHAT IS MULTER?
//   Multer is Express middleware that handles multipart/form-data
//   — the content type used for file uploads via HTML forms.
//   Normally, Multer saves files to disk. But with multer-storage-cloudinary,
//   we redirect that upload directly to Cloudinary.
//
// HOW THE FLOW WORKS:
//   1. Client sends a POST request with an image file.
//   2. Multer intercepts the request and reads the file from the stream.
//   3. multer-storage-cloudinary uploads the file to Cloudinary.
//   4. Cloudinary responds with a URL + public_id.
//   5. Multer stores this in req.file.path (URL) and req.file.filename (public_id).
//   6. Our controller reads req.file and stores those values in MongoDB.
//
// ENVIRONMENT VARIABLES (set in .env):
//   CLOUDINARY_CLOUD_NAME  → Your Cloudinary account name
//   CLOUDINARY_API_KEY     → Your Cloudinary API key
//   CLOUDINARY_API_SECRET  → Your Cloudinary API secret
//   (Never hardcode these values in code — always use .env)
// ============================================================

const cloudinary            = require("cloudinary").v2;          // Cloudinary SDK
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Bridges Multer & Cloudinary
const multer                = require("multer");                  // File upload middleware


// ── STEP 1: Configure Cloudinary with credentials from .env ──────
// This must happen before any upload operations.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ── STEP 2: Configure where and how to store uploaded images ─────
// CloudinaryStorage is a Multer storage engine that uploads files
// directly to Cloudinary (not to local disk).
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // use the configured Cloudinary instance

  params: {
    folder: "sweets-shop/products", // Images go into this folder in Cloudinary.
                                    // Organizes uploads (like a subfolder).

    allowed_formats: ["jpg", "jpeg", "png", "webp"], // Only allow these image types.

    transformation: [
      // Transformation 1: Resize the image to max 800x800 pixels.
      // "limit" means: only resize IF it's larger than 800x800 (don't upscale).
      { width: 800, height: 800, crop: "limit" },

      // Transformation 2: Auto-optimize image quality.
      // Cloudinary picks the best quality/size trade-off automatically.
      { quality: "auto" }
    ]
  }
});


// ── STEP 3: File type validation ─────────────────────────────────
// This function is called BEFORE the file is uploaded.
// If it calls cb(null, true) → upload is allowed.
// If it calls cb(error, false) → upload is rejected with that error.
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // ✅ allowed
  } else {
    cb(new Error("Only images (JPEG, PNG, WEBP) are allowed"), false); // ❌ rejected
  }
};


// ── STEP 4: Create the Multer upload middleware ───────────────────
// This combines the CloudinaryStorage engine, file filter, and size limit.
const upload = multer({
  storage,              // where to store files (Cloudinary via the engine above)
  fileFilter,           // which file types to accept
  limits: {
    fileSize: 5 * 1024 * 1024 // max file size = 5MB (5 × 1024 × 1024 bytes)
                              // Prevents users from uploading huge files.
  }
});


// ── STEP 5: Export ────────────────────────────────────────────────
// We export:
//   upload    → the Multer middleware (used in routes as upload.single("image"))
//   cloudinary → the configured Cloudinary instance (used to DELETE images)
module.exports = { upload, cloudinary };
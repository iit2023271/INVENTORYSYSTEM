const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const setup = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({});
  if (existing) {
    console.log("❌ Owner already exists. Delete the user from DB first.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Shop Owner",
    email: "admin@shop.com",
    password: hashedPassword,
    role: "admin"
  });

  console.log("✅ Owner created successfully!");
  console.log("📧 Email: admin@shop.com");
  console.log("🔑 Password: admin123");
  console.log("👉 Login at: http://localhost:3000");

  process.exit();
};

setup();
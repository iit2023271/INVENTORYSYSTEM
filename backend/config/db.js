// ============================================================
// db.js — DATABASE CONNECTION FILE
// ============================================================
// PURPOSE:
//   This file is responsible for connecting our Node.js app
//   to MongoDB (our database) using a library called Mongoose.
//
// MONGOOSE:
//   Mongoose is an ODM (Object Data Modeling) library. It lets
//   us talk to MongoDB using JavaScript objects instead of raw
//   MongoDB queries. Think of it as a translator between JS and MongoDB.
//
// HOW IT WORKS:
//   We call connectDB() once when the server starts.
//   If the connection succeeds → app continues normally.
//   If it fails → we log the error and stop the app (process.exit).
// ============================================================

const mongoose = require("mongoose");

// connectDB is an async function because connecting to a database
// is a network operation — it takes time, so we use async/await.
const connectDB = async () => {
  try {
    // process.env.MONGO_URI reads the MongoDB connection string
    // from a .env file (e.g., mongodb://localhost:27017/mydb).
    // Keeping it in .env keeps sensitive info out of the code.
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected"); // ✅ Connection successful

  } catch (error) {
    // If connection fails (e.g., wrong URI, DB is down),
    // we log the error and exit the process with code 1.
    // Code 1 = something went wrong (code 0 = success).
    console.error("DB Connection Failed", error);
    process.exit(1);
  }
};

// Export the function so server.js (or app.js) can call it on startup.
module.exports = connectDB;
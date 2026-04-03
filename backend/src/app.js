require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ticket-triage";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/tickets", ticketRoutes);

// Health check - useful for docker
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Connect to DB then start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;

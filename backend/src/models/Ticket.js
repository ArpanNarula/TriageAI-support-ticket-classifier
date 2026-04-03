const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    category: {
      type: String,
      enum: ["billing", "technical", "account", "feature", "other"],
      required: true
    },
    priority: {
      type: String,
      enum: ["P0", "P1", "P2", "P3"],
      required: true
    },
    keywords: [String],
    urgencySignals: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    customRuleApplied: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);

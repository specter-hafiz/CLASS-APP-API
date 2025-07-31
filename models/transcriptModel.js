const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
  {
    audioUrl: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to a User model
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("Transcript", transcriptSchema);

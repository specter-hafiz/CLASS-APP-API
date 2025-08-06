const mongoose = require("mongoose");
const { id } = require("zod/v4/locales");

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    sharedLinkId: String,
    expiresAt: { type: String, default: true },
    duration: { type: String, required: true },
    accessPassword: { type: String, required: true },
    attempts: [
      {
        id: String,
        startedAt: Date,
      },
    ],
    responses: [
      {
        id: String,
        userId: String,
        answers: [{ questionId: String, answer: String }],
        score: Number,
        submittedAt: Date,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);

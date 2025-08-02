const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  sharedLinkId: String,
  expiresAt: { type: String, default: true },
  duration: { type: String, required: true },
  accessPassword: { type: String, required: true },
  attempts: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      startedAt: Date,
    },
  ],
  responses: [
    {
      studentEmail: String,
      answers: [{ questionId: String, answer: String }],
      submittedAt: Date,
    },
  ],
});

module.exports = mongoose.model("Assessment", assessmentSchema);

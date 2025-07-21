const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  sharedLinkId: String,
  expiresAt: { type: Date },
  duration: { type: Number },
  attempts: [
    {
      userId: String,
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

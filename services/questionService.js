const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const crypto = require("crypto");
const Question = require("../models/questionModel");
const Assessment = require("../models/assessmentModel");
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateMCQs(passage, numQuestions = 3) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Generate ${numQuestions} multiple-choice questions based on the following passage.
Use the format:

Q: [question]
A. [option A]
B. [option B]
C. [option C]
D. [option D]
Answer: [correct letter]

Passage:
"""
${passage}
"""`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return parseMCQs(text);
  } catch (error) {
    console.error("Gemini SDK Error:", error.message);
    return [];
  }
}

function parseMCQs(rawText) {
  const questions = [];
  const blocks = rawText.split(/Q:\s*/).slice(1);

  for (const block of blocks) {
    try {
      const lines = block.trim().split("\n");
      const question = lines[0];
      const options = {
        A: lines[1].slice(2).trim(),
        B: lines[2].slice(2).trim(),
        C: lines[3].slice(2).trim(),
        D: lines[4].slice(2).trim(),
      };
      const answerLetter = lines[5].split(":")[1].trim().toUpperCase();
      const answerText = options[answerLetter];

      questions.push({
        question,
        options: Object.values(options),
        answer: answerText,
      });
    } catch (err) {
      console.warn("Skipping malformed question block:", err.message);
    }
  }

  return questions;
}

const saveQuestions = async (questions, userId) => {
  try {
    const saved = await Question.insertMany(
      questions.map((q) => ({ ...q, createdBy: userId }))
    );

    const sharedLinkId = crypto.randomBytes(12).toString("base64url");
    const assessment = new Assessment({
      questions: saved.map((q) => q._id),
      sharedLinkId,
    });
    await assessment.save();

    return { message: "Saved and shared", linkId: sharedLinkId };
  } catch (err) {
    throw err;
  }
};

const getSharedQuestions = async (linkId, userId) => {
  const assessment = await Assessment.findOne({
    sharedLinkId: linkId,
  }).populate("questions");
  if (!assessment) throw { status: 404, message: "Assessment not found" };

  if (assessment.expiresAt && assessment.expiresAt < new Date())
    throw { status: 403, message: "Link expired" };

  const existing = assessment.attempts.find((a) => a.userId === userId);
  if (existing) {
    return {
      questions: assessment.questions,
      startedAt: existing.startedAt,
    };
  }

  const startedAt = new Date();
  assessment.attempts.push({ userId, startedAt });
  await assessment.save();

  return {
    questions: assessment.questions,
    startedAt,
  };
};

const submitAssessmentResponse = async (linkId, { studentEmail, answers }) => {
  const assessment = await Assessment.findOne({ sharedLinkId: linkId });
  if (!assessment) throw { status: 404, message: "Assessment not found" };

  const submittedAt = new Date();
  assessment.responses.push({ studentEmail, answers, submittedAt });
  await assessment.save();

  return { message: "Response recorded" };
};

module.exports = {
  generateMCQs,
  saveQuestions,
  getSharedQuestions,
  submitAssessmentResponse,
};

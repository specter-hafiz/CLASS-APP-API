const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const crypto = require("crypto");
const Question = require("../models/questionModel");
const Assessment = require("../models/assessmentModel");
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateMCQs(passage, numQuestions = 5) {
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

const saveQuestions = async (
  questions,
  userId,
  title,
  accessPassword,
  duration,
  expiresAt
) => {
  try {
    const saved = await Question.insertMany(
      questions.map((q) => ({ ...q, createdBy: userId }))
    );

    const sharedLinkId = crypto.randomBytes(6).toString("base64url");
    const assessment = new Assessment({
      createdBy: userId,
      questions: saved.map((q) => q._id),
      sharedLinkId,
      duration,
      expiresAt,
      title,
      accessPassword,
    });
    await assessment.save();

    return { message: "Saved and shared", linkId: sharedLinkId };
  } catch (err) {
    throw err;
  }
};

const getUserQuizzes = async (userId) => {
  try {
    const quizzes = await Assessment.find({ createdBy: userId })
      .populate("questions")
      .lean();

    return quizzes;
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || "Internal server error",
    };
  }
};

const getSharedQuestions = async (sharedLinkId, id, accessPassword) => {
  console.log("Fetching shared questions for link ID:", sharedLinkId);
  const assessment = await Assessment.findOne({
    sharedLinkId: sharedLinkId,
    accessPassword,
  }).populate("questions");
  if (!assessment) throw { status: 404, message: "Assessment not found" };
  console.log("Assessment found:", assessment);
  if (assessment.expiresAt && assessment.expiresAt < new Date().toISOString()) {
    console.log("Link expired for user:", id);
    throw { status: 403, message: "Link expired" };
  }
  const submitted = assessment.responses.find((r) => r.id === id);
  if (submitted) {
    throw {
      status: 403,
      message: "You have already submitted a response for this assessment.",
    };
  }
  console.log("Link is valid for user:", id);
  const existing = assessment.attempts.find((a) => a.id === id);
  if (existing) {
    console.log("Existing attempt found for user:", id);
    return {
      questions: assessment.questions,
      startedAt: existing.startedAt,
      sharedLinkId: assessment.sharedLinkId,
      duration: assessment.duration,
      id: existing.id,
    };
  }

  const startedAt = new Date();
  assessment.attempts.push({ id, startedAt });
  await assessment.save();
  console.log("New attempt recorded for user:", id);
  console.log("Assessment started at:", startedAt);
  console.log("Assessment duration:", assessment.duration);
  console.log("Questions available:", assessment.questions.length);
  console.log("Questions details:", assessment.questions);
  return {
    questions: assessment.questions,
    startedAt,
    sharedLinkId: assessment.sharedLinkId,
    duration: assessment.duration,
    id,
  };
};

const submitAssessmentResponse = async (linkId, userId, { id, answers }) => {
  const assessment = await Assessment.findOne({ sharedLinkId: linkId });
  if (!assessment) throw { status: 404, message: "Assessment not found" };
  console.log("Assessment found:", assessment);
  if (assessment.expiresAt && assessment.expiresAt < new Date())
    throw { status: 403, message: "Link expired" };
  console.log("Link is valid for user:", userId);
  if (assessment.responses.some((r) => r.id === id)) {
    throw { status: 403, message: "You have already submitted a response" };
  }
  console.log("Recording response for user:", userId);
  const submittedAt = new Date();
  assessment.responses.push({ id, answers, submittedAt, userId });
  await assessment.save();
  console.log("Response recorded successfully for user:", userId);
  return { message: "Response recorded" };
};

const fetchUserSubmittedResponses = async (userId) => {
  console.log("Fetching submitted responses for user:", userId);
  const userIdStr = userId.toString();
  const assessments = await Assessment.find({
    responses: { $elemMatch: { userId: userIdStr } },
  }).populate("questions");
  if (!assessments || assessments.length === 0)
    throw { status: 404, message: "No assessments found for this user" };
  console.log("Assessments found:", assessments.length);
  console.log("Assessments details:", assessments);
  return assessments.map((assessment) => {
    const response = assessment.responses.find((r) => r.userId === userIdStr);
    if (!response) throw { status: 404, message: "Response not found" };
    console.log("Response found for user:", userId);
    console.log("Response details:", response);
    return {
      response,
      questions: assessment.questions,
      title: assessment.title,
    };
  });
};

module.exports = {
  generateMCQs,
  saveQuestions,
  getSharedQuestions,
  fetchUserSubmittedResponses,
  getUserQuizzes,
  submitAssessmentResponse,
};

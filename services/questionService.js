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
Generate ${numQuestions} exact multiple-choice questions based on the following passage.
Use the format:

Q: [question]
A. [option A]
B. [option B]
C. [option C]
D. [option D]
Answer: [correct letter]

Answers should not have a pattern and should be varied.
Do not include any explanations or additional text.
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
    } catch (err) {}
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

    const sharedLinkId = crypto.randomBytes(4).toString("base64url");
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
      .sort({ createdAt: -1 })
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
  const assessment = await Assessment.findOne({
    sharedLinkId: sharedLinkId,
    accessPassword,
  })
    .populate("questions")
    .sort({ createdAt: -1 });
  if (!assessment) throw { status: 404, message: "Assessment not found" };
  if (assessment.expiresAt && assessment.expiresAt < new Date().toISOString()) {
    throw { status: 403, message: "Link expired" };
  }
  const submitted = assessment.responses.find((r) => r.id === id);
  if (submitted) {
    throw {
      status: 403,
      message: "You have already submitted a response for this assessment.",
    };
  }
  const existing = assessment.attempts.find((a) => a.id === id);
  if (existing) {
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

  return {
    questions: assessment.questions,
    startedAt,
    sharedLinkId: assessment.sharedLinkId,
    duration: assessment.duration,
    id,
  };
};
const submitAssessmentResponse = async (linkId, userId, { id, answers }) => {
  const assessment = await Assessment.findOne({
    sharedLinkId: linkId,
  }).populate("questions");
  if (!assessment) throw { status: 404, message: "Assessment not found" };

  if (assessment.expiresAt && new Date(assessment.expiresAt) < new Date())
    throw { status: 403, message: "Link expired" };

  if (assessment.responses.some((r) => r.id === id)) {
    throw { status: 403, message: "You have already submitted a response" };
  }

  // Step 1: Match questions and submitted answers
  const questionMap = {};
  for (const q of assessment.questions) {
    questionMap[q._id.toString()] = q.answer;
  }

  let correctCount = 0;

  // Step 2: Validate and score
  for (const a of answers) {
    const correctAnswer = questionMap[a.questionId];
    if (correctAnswer && a.answer === correctAnswer) {
      correctCount++;
    }
  }

  const totalQuestions = assessment.questions.length;
  const score = correctCount;

  const submittedAt = new Date();

  // Step 3: Save result
  assessment.responses.push({
    id,
    userId,
    answers,
    submittedAt,
    score,
  });

  await assessment.save();

  return {
    message: "Response recorded",
    score: score,
    totalQuestions,
    correctCount,
  };
};

const fetchUserSubmittedResponses = async (userId) => {
  const userIdStr = userId.toString();
  const assessments = await Assessment.find({
    responses: { $elemMatch: { userId: userIdStr } },
  })
    .populate("questions")
    .sort({ createdAt: -1 })
    .lean();
  if (!assessments || assessments.length === 0)
    throw { status: 404, message: "No assessments found for this user" };
  return assessments.map((assessment) => {
    const response = assessment.responses.find((r) => r.userId === userIdStr);
    if (!response) throw { status: 404, message: "Response not found" };
    return {
      response,
      questions: assessment.questions,
      title: assessment.title,
      score: response.score,
    };
  });
};

const fetchAnalytics = async (userId) => {
  const assessments = await Assessment.find({ createdBy: userId })
    .select("_id title responses")
    .sort({ createdAt: -1 })
    .lean();

  if (!assessments || assessments.length === 0) return [];
  return assessments.map((assessment) => ({
    id: assessment._id,
    title: assessment.title,
    totalResponses: assessment.responses.length,
  }));
};

const fetchQuizAnalytics = async (assessmentId) => {
  const assessment = await Assessment.findById(assessmentId)
    .populate("questions")
    .sort({ createdAt: -1 });

  if (!assessment) {
    return res
      .status(404)
      .json({ success: false, message: "Assessment not found" });
  }
  if (!assessment.responses || assessment.responses.length === 0) {
    return [];
  }

  const analytics = assessment.questions.map((question) => {
    let correctCount = 0;
    let wrongCount = 0;
    let totalCount = 0;

    assessment.responses.forEach((response) => {
      const answerObj = response.answers.find(
        (a) => a.questionId.toString() === question._id.toString()
      );

      if (answerObj) {
        totalCount++;
        if (answerObj.answer === question.answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    return {
      questionId: question._id,
      question: question.question,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      totalSubmissions: totalCount,
    };
  });
  return analytics;
};

const getResults = async (assessmentId) => {
  const assessment = await Assessment.findById(assessmentId).select(
    "responses"
  );

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const formattedResponses = assessment.responses.map((res) => ({
    id: res.id,
    score: res.score,
    submittedAt: res.submittedAt,
  }));

  return formattedResponses;
};
module.exports = {
  generateMCQs,
  saveQuestions,
  fetchAnalytics,
  fetchQuizAnalytics,
  getResults,
  getSharedQuestions,
  fetchUserSubmittedResponses,
  getUserQuizzes,
  submitAssessmentResponse,
};

const asyncHandler = require("../utils/asyncHandler");
const questionService = require("../services/questionService");

const generateQuestions = asyncHandler(async (req, res) => {
  const {
    transcript,
    numberOfQuestions,
    title,
    accessPassword,
    duration,
    expiresAt,
  } = req.body;

  const questions = await questionService.generateMCQs(
    transcript,
    numberOfQuestions
  );
  if (!questions) {
    throw Error("No questions generated. Try again.");
  }
  const { message, linkId } = await questionService.saveQuestions(
    questions,
    req.user._id,
    title,
    accessPassword,
    duration,
    expiresAt
  );

  res.json({ success: true, questions, message, linkId });
});

const fetchQuizzes = async (req, res) => {
  const userId = req.user._id;
  try {
    const quizzes = await questionService.getUserQuizzes(userId);
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getSharedQuestions = async (req, res) => {
  const sharedLinkId = req.params.id;
  const { id, accessPassword } = req.body;
  try {
    const result = await questionService.getSharedQuestions(
      sharedLinkId,
      id,
      accessPassword
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const fetchSubmittedResponses = async (req, res) => {
  const userId = req.user._id;
  try {
    const responses = await questionService.fetchUserSubmittedResponses(userId);
    res.json({ success: true, responses });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const result = await questionService.submitAssessmentResponse(
      req.params.id,
      req.user._id,
      req.body
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  const userId = req.user._id;
  console.log("Fetching analytics for user:", userId);
  try {
    const analytics = await questionService.fetchAnalytics(userId);
    console.log("Fetched analytics:", analytics);
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getQuizAnalytics = async (req, res) => {
  const quizId = req.params.id;
  console.log("Fetching analytics for quiz:", quizId);
  try {
    const analytics = await questionService.fetchQuizAnalytics(quizId);
    console.log("Fetched quiz analytics:", analytics);
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const fetchResults = async (req, res) => {
  const { id } = req.params;

  try {
    const responses = await questionService.getResults(id);
    return res.status(200).json({ success: true, responses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  generateQuestions,
  getQuizAnalytics,
  getSharedQuestions,
  fetchQuizzes,
  fetchResults,
  getAnalytics,
  submitAssessment,
  fetchSubmittedResponses,
};

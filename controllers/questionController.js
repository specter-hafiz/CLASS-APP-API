const asyncHandler = require("../utils/asyncHandler");
const questionService = require("../services/questionService");

const generateQuestions = asyncHandler(async (req, res) => {
  const {
    transcript,
    numQuestions,
    title,
    accessPassword,
    duration,
    expiresAt,
  } = req.body;
  console.log("User provided transcript:", transcript);
  console.log("User provided number of questions:", numQuestions);
  console.log("User provided title:", title);

  const questions = await questionService.generateMCQs(
    transcript,
    numQuestions
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
  console.log("Fetching quizzes for user:", userId);
  try {
    const quizzes = await questionService.getUserQuizzes(userId);
    console.log("Fetched quizzes:", quizzes);
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getSharedQuestions = async (req, res) => {
  const sharedLinkId = req.params.id;
  const { id, accessPassword } = req.body;
  console.log("Shared link ID:", sharedLinkId);
  console.log("User ID:", id);
  console.log("Access password provided:", accessPassword);

  try {
    const result = await questionService.getSharedQuestions(
      sharedLinkId,
      id,
      accessPassword
    );
    console.log("Shared questions fetched successfully:", result);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const fetchSubmittedResponses = async (req, res) => {
  const userId = req.user._id;
  console.log("Fetching submitted responses for user:", userId);
  try {
    const responses = await questionService.fetchUserSubmittedResponses(userId);
    console.log("Fetched submitted responses:", responses);
    res.json({ success: true, responses });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const submitAssessment = async (req, res) => {
  console.log("Submitting assessment response for user:", req.user._id);
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  try {
    const result = await questionService.submitAssessmentResponse(
      req.params.id,
      req.user._id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = {
  generateQuestions,
  getSharedQuestions,
  fetchQuizzes,
  submitAssessment,
  fetchSubmittedResponses,
};

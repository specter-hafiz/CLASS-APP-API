const asyncHandler = require("../utils/asyncHandler");
const questionService = require("../services/questionService");

const generateQuestions = asyncHandler(async (req, res) => {
  const { transcript, numQuestions } = req.body;

  const questions = await questionService.generateMCQs(
    transcript,
    numQuestions
  );
  if (!questions) {
    throw Error("No questions generated. Try again.");
  }
  const { message, linkId } = await questionService.saveQuestions(
    questions,
    req.user._id
  );

  res.json({ success: true, questions, message, linkId });
});

const getSharedQuestions = async (req, res) => {
  const userId = req.user._id;
  try {
    const result = await questionService.getSharedQuestions(
      req.params.id,
      userId
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const submitAssessmentResponse = async (req, res) => {
  try {
    const result = await questionService.submitAssessmentResponse(
      req.params.id,
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
  submitAssessmentResponse,
};

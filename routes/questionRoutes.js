const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const validate = require("../middlewares/validate");
const {
  generateQuestionsSchema,
  getQuestionsSchema,
  submitResponseSchema,
} = require("../validators/questionValidator");
const authenticate = require("../middlewares/authMiddleware");
router.post(
  "/generate",
  validate(generateQuestionsSchema),
  authenticate,
  questionController.generateQuestions
);
router.get(
  "/",
  authenticate,
  validate(getQuestionsSchema),
  questionController.fetchQuizzes
);
router.get(
  "/shared/:id",
  authenticate,
  validate(getQuestionsSchema),
  questionController.getSharedQuestions
);
router.post(
  "/response/:id",
  validate(submitResponseSchema),
  questionController.submitAssessmentResponse
);

module.exports = router;

// module.exports = router;

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
  // validate(generateQuestionsSchema),
  authenticate,
  questionController.generateQuestions
);
router.get("/fetch", authenticate, questionController.fetchQuizzes);
router.get("/analytics", authenticate, questionController.getAnalytics);
router.get("/analytics/:id", authenticate, questionController.getQuizAnalytics);
router.get("/:id/results", questionController.fetchResults);
router.get(
  "/fetch/responses",
  authenticate,
  questionController.fetchSubmittedResponses
);
router.get(
  "/shared/:id",
  authenticate,
  validate(getQuestionsSchema),
  questionController.getSharedQuestions
);
router.post(
  "/response/:id",
  authenticate,
  validate(submitResponseSchema),
  questionController.submitAssessment
);

module.exports = router;

// module.exports = router;

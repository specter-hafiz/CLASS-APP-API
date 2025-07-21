const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const validate = require("../middlewares/validate");
const { generateQuestionsSchema } = require("../validators/questionValidator");
const authenticate = require("../middlewares/authMiddleware");
router.post(
  "/generate",
  validate(generateQuestionsSchema),
  authenticate,
  questionController.generateQuestions
);
router.get("/shared/:id", authenticate, questionController.getSharedQuestions);
router.post("/respond/:id", questionController.submitAssessmentResponse);

module.exports = router;

// module.exports = router;

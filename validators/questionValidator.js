// validators/question.validator.js
const { z } = require("zod");

const generateQuestionsSchema = {
  body: z.object({
    transcript: z.string().min(1, "Transcript is required"),
    numQuestions: z
      .number()
      .int()
      .min(5, "Number of questions must be at least 5"),
  }),
};

// get shared questions schema
const getQuestionsSchema = {
  params: z.object({
    id: z.string().base64url().min(1, "Link ID is required"),
  }),
};

// submit assessment response schema
const submitResponseSchema = {
  params: z.object({
    id: z.string().base64url().min(1, "Link ID is required"),
  }),
  body: z.object({
    studentEmail: z.string().email("Invalid email format"),
    answers: z.array(
      z.object({
        questionId: z.string().min(1, "Question ID is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    ),
  }),
};
module.exports = {
  generateQuestionsSchema,
  getQuestionsSchema,
  submitResponseSchema,
};

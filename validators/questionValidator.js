// validators/question.validator.js
const { z } = require("zod");

const generateQuestionsSchema = {
  body: z.object({
    transcript: z.string(),
    numQuestions: z.number().int().optional(),
  }),
};

module.exports = { generateQuestionsSchema };

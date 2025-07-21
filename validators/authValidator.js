const { z } = require("zod");

// Signup schema
const signupSchema = {
  body: z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

// Login schema
const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

module.exports = {
  signupSchema,
  loginSchema,
};

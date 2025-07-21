// middlewares/validate.js
const { ZodError } = require("zod");

/**
 * schema should be an object like:
 * {
 *   body?: z.object(...),
 *   query?: z.object(...),
 *   params?: z.object(...),
 *   headers?: z.object(...)
 * }
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      if (schema.headers) req.headers = schema.headers.parse(req.headers);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}

module.exports = validate;

const AppError = require('../utils/AppError');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
function validateRequest(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError('Validation failed', 422, errors));
    }
    req[source] = result.data;
    return next();
  };
}

module.exports = validateRequest;

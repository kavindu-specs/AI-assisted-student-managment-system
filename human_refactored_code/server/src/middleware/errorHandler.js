const logger = require('../utils/logger');
const { fail } = require('../utils/responseFormatter');

function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return fail(res, err.message, err.statusCode || 400, err.errors);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 'A record with these details already exists', 409, err.errors?.map((e) => e.message));
  }
  if (err.name === 'SequelizeValidationError') {
    return fail(res, 'Validation failed', 422, err.errors?.map((e) => e.message));
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return fail(res, 'Related record not found', 400);
  }
  if (err.name === 'MulterError') {
    return fail(res, err.message, 400);
  }

  logger.error('Unhandled error:', err);
  return fail(res, 'Internal server error', 500);
}

module.exports = { notFound, errorHandler };

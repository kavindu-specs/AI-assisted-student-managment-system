const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication token missing', 401));
  }

  try {
    const payload = verifyToken(token);

    if (payload.preAuth) {
      return next(new AppError('Pre-auth token cannot access this resource', 401));
    }

    req.user = payload;
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
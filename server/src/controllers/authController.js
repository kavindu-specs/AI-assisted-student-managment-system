const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseFormatter');
const authService = require('../services/authService');
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function extractPreAuthPayload(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError('Pre-authentication token missing', 401);

  const payload = verifyToken(token);
  if (!payload.preAuth) throw new AppError('A pre-authentication token is required for this step', 401);
  return payload;
}

const studentLogin = asyncHandler(async (req, res) => {
  const { regNumber, password } = req.body;
  const result = await authService.studentLogin(regNumber, password);
  return success(res, result, 'Login successful');
});

const completeFirstLogin = asyncHandler(async (req, res) => {
  const payload = extractPreAuthPayload(req);
  const { newPassword } = req.body;
  const result = await authService.completeFirstLogin(payload, newPassword);
  return success(res, result, 'Password updated');
});

const adminLogin = asyncHandler(async (req, res) => {
  const { institutionalEmail, password } = req.body;
  const result = await authService.adminLogin(institutionalEmail, password);
  return success(res, result, 'Login successful');
});

const verifyAdminOtp = asyncHandler(async (req, res) => {
  const payload = extractPreAuthPayload(req);
  const { otp } = req.body;
  const result = await authService.verifyAdminOtp(payload, otp);
  return success(res, result, 'Verification successful');
});

const me = asyncHandler(async (req, res) => success(res, req.user, 'Current session'));

module.exports = {
  studentLogin, completeFirstLogin, adminLogin, verifyAdminOtp, me,
};

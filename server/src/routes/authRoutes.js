const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/authMiddleware');
const {
  studentLoginSchema, adminLoginSchema, otpVerifySchema, firstLoginSchema,
} = require('../validators/authValidators');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

router.post('/student/login', loginLimiter, validateRequest(studentLoginSchema), authController.studentLogin);
router.post('/student/first-login', validateRequest(firstLoginSchema), authController.completeFirstLogin);

router.post('/admin/login', loginLimiter, validateRequest(adminLoginSchema), authController.adminLogin);
router.post('/admin/verify-otp', validateRequest(otpVerifySchema), authController.verifyAdminOtp);

router.get('/me', authenticate, authController.me);

module.exports = router;

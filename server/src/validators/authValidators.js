const { z } = require('zod');

const studentLoginSchema = z.object({
  regNumber: z.string().min(1, 'Registration number is required'),
  password: z.string().min(1, 'Password is required'),
});

const adminLoginSchema = z.object({
  institutionalEmail: z.string().email('A valid institutional email is required'),
  password: z.string().min(1, 'Password is required'),
});

const otpVerifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const firstLoginSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

module.exports = {
  studentLoginSchema, adminLoginSchema, otpVerifySchema, firstLoginSchema,
};

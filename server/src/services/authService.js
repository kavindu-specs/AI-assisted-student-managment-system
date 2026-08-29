const { Op } = require('sequelize');
const { UserAccount, Student, Role } = require('../models');
const { hash, compare, generateOtp } = require('../utils/password');
const { signAccessToken, signPreAuthToken } = require('../utils/jwt');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const { ROLES, ACCOUNT_STATUS } = require('../config/constants');

// In-memory OTP store: userId -> { hash, expiresAt }
// The schema has no dedicated OTP table; OTPs are short-lived (minutes) so
// holding them in process memory is an acceptable simplification here.
// Swap for Redis if the API ever runs across multiple processes.
const otpStore = new Map();

async function loadRoles(userAccount) {
  const roles = await userAccount.getRoles();
  return roles.map((r) => r.role_name);
}

function assertAccountUsable(account) {
  if (account.account_status !== ACCOUNT_STATUS.ACTIVE) {
    throw new AppError('Account is not active. Contact the administration office.', 403);
  }
}

async function studentLogin(registrationNo, password) {
  const student = await Student.findOne({ where: { registration_no: registrationNo } });
  if (!student) throw new AppError('Invalid registration number or password', 401);

  const account = await UserAccount.findOne({ where: { student_id: student.student_id } });
  if (!account) throw new AppError('Invalid registration number or password', 401);

  const valid = await compare(password, account.password_hash);
  if (!valid) throw new AppError('Invalid registration number or password', 401);

  assertAccountUsable(account);

  const requiresFirstLogin = account.last_login_at === null;
  if (requiresFirstLogin) {
    const preAuthToken = signPreAuthToken({ userId: account.user_id, role: ROLES.STUDENT, step: 'first-login' });
    return { requiresFirstLogin: true, preAuthToken };
  }

  await account.update({ last_login_at: new Date() });
  const token = signAccessToken({ userId: account.user_id, studentId: student.student_id, role: ROLES.STUDENT });
  return { requiresFirstLogin: false, token, student };
}

async function completeFirstLogin(preAuthPayload, newPassword) {
  if (preAuthPayload.step !== 'first-login') throw new AppError('Invalid session for this action', 401);

  const account = await UserAccount.findByPk(preAuthPayload.userId);
  if (!account) throw new AppError('Account not found', 404);

  await account.update({ password_hash: await hash(newPassword), last_login_at: new Date() });
  await auditService.record({
    userId: account.user_id,
    entityType: 'user_account',
    entityId: account.user_id,
    action: 'FIRST_LOGIN_PASSWORD_RESET',
  });

  const token = signAccessToken({ userId: account.user_id, studentId: account.student_id, role: ROLES.STUDENT });
  return { token };
}

async function adminLogin(email, password) {
  if (!email.toLowerCase().endsWith(`@${env.adminEmailDomain.toLowerCase()}`)) {
    throw new AppError('Admin accounts must use the institutional email domain', 401);
  }

  const account = await UserAccount.findOne({ where: { email } });
  if (!account) throw new AppError('Invalid email or password', 401);

  const roles = await loadRoles(account);
  if (!roles.includes(ROLES.ADMIN)) throw new AppError('Invalid email or password', 401);

  const valid = await compare(password, account.password_hash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  assertAccountUsable(account);

  if (account.is_2fa_enabled) {
    const otp = generateOtp();
    const expiresAt = Date.now() + env.otpTtlMinutes * 60 * 1000;
    otpStore.set(account.user_id, { hash: await hash(otp), expiresAt });

    await notificationService.notify({
      userId: account.user_id,
      type: 'ADMIN_LOGIN_OTP',
      channel: 'Email',
      subject: 'Your login verification code',
      message: `Your one-time verification code is ${otp}. It expires in ${env.otpTtlMinutes} minutes.`,
      to: account.email,
    });

    const preAuthToken = signPreAuthToken({ userId: account.user_id, role: ROLES.ADMIN, step: 'otp' });
    return { requiresOtp: true, preAuthToken };
  }

  await account.update({ last_login_at: new Date() });
  const token = signAccessToken({ userId: account.user_id, role: ROLES.ADMIN });
  return { requiresOtp: false, token };
}

async function verifyAdminOtp(preAuthPayload, otp) {
  if (preAuthPayload.step !== 'otp') throw new AppError('Invalid session for this action', 401);

  const entry = otpStore.get(preAuthPayload.userId);
  if (!entry || entry.expiresAt < Date.now()) {
    throw new AppError('Verification code expired. Please log in again.', 401);
  }

  const valid = await compare(otp, entry.hash);
  if (!valid) throw new AppError('Incorrect verification code', 401);

  otpStore.delete(preAuthPayload.userId);

  const account = await UserAccount.findByPk(preAuthPayload.userId);
  await account.update({ last_login_at: new Date() });

  const token = signAccessToken({ userId: account.user_id, role: ROLES.ADMIN });
  return { token };
}

module.exports = {
  studentLogin,
  completeFirstLogin,
  adminLogin,
  verifyAdminOtp,
};

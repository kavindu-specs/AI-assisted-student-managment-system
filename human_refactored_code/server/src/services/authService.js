const {
  UserAccount, Student, StudentAccount, AdminUser, OtpChallenge,
} = require('../models');
const { hash, compare, generateOtp } = require('../utils/password');
const { signAccessToken, signPreAuthToken } = require('../utils/jwt');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const { ROLES, USER_ACCOUNT_STATUS } = require('../config/constants');

function assertAccountUsable(account) {
  if (account.status !== USER_ACCOUNT_STATUS.ACTIVE) {
    throw new AppError('Account is not active. Contact the administration office.', 403);
  }
}

async function studentLogin(regNumber, password) {
  const student = await Student.findOne({ where: { reg_number: regNumber } });
  if (!student) throw new AppError('Invalid registration number or password', 401);

  const account = await UserAccount.findByPk(student.student_id);
  if (!account) throw new AppError('Invalid registration number or password', 401);

  const valid = await compare(password, account.password_hash);
  if (!valid) throw new AppError('Invalid registration number or password', 401);

  assertAccountUsable(account);

  const studentAccount = await StudentAccount.findOne({ where: { student_id: student.student_id } });
  const requiresFirstLogin = !studentAccount || !studentAccount.login_completed;

  if (requiresFirstLogin) {
    const preAuthToken = signPreAuthToken({ userId: account.user_id, role: ROLES.STUDENT, step: 'first-login' });
    return { requiresFirstLogin: true, preAuthToken };
  }

  await account.update({ last_login: new Date() });
  const token = signAccessToken({ userId: account.user_id, studentId: student.student_id, role: ROLES.STUDENT });
  return { requiresFirstLogin: false, token, student };
}

async function completeFirstLogin(preAuthPayload, newPassword) {
  if (preAuthPayload.step !== 'first-login') throw new AppError('Invalid session for this action', 401);

  const account = await UserAccount.findByPk(preAuthPayload.userId);
  if (!account) throw new AppError('Account not found', 404);

  await account.update({ password_hash: await hash(newPassword), last_login: new Date() });

  const [studentAccount] = await StudentAccount.findOrCreate({
    where: { student_id: account.user_id },
    defaults: { student_id: account.user_id },
  });
  await studentAccount.update({ login_completed: true });

  await auditService.record({
    actorId: account.user_id,
    action: 'FIRST_LOGIN_PASSWORD_RESET',
    entityName: 'student_account',
    entityId: account.user_id,
  });

  const token = signAccessToken({ userId: account.user_id, studentId: account.user_id, role: ROLES.STUDENT });
  return { token };
}

async function adminLogin(institutionalEmail, password) {
  if (!institutionalEmail.toLowerCase().endsWith(`@${env.adminEmailDomain.toLowerCase()}`)) {
    throw new AppError('Admin accounts must use the institutional email domain', 401);
  }

  const adminUser = await AdminUser.findOne({ where: { institutional_email: institutionalEmail } });
  if (!adminUser) throw new AppError('Invalid email or password', 401);

  const account = await UserAccount.findByPk(adminUser.admin_id);
  if (!account) throw new AppError('Invalid email or password', 401);

  const valid = await compare(password, account.password_hash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  assertAccountUsable(account);

  // OTP is mandatory for every admin login (no per-account toggle in this schema).
  // Persisted in the DB (rather than in-process memory) so any worker in a
  // clustered deployment can validate an OTP a different worker issued.
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.otpTtlMinutes * 60 * 1000);
  const otpHash = await hash(otp);
  await OtpChallenge.upsert({ user_id: account.user_id, otp_hash: otpHash, expires_at: expiresAt });

  await notificationService.notify({
    userId: account.user_id,
    title: 'Your login verification code',
    message: `Your one-time verification code is ${otp}. It expires in ${env.otpTtlMinutes} minutes.`,
    email: account.email,
  });

  const preAuthToken = signPreAuthToken({ userId: account.user_id, role: ROLES.ADMIN, step: 'otp' });
  return { requiresOtp: true, preAuthToken };
}

async function verifyAdminOtp(preAuthPayload, otp) {
  if (preAuthPayload.step !== 'otp') throw new AppError('Invalid session for this action', 401);

  const entry = await OtpChallenge.findByPk(preAuthPayload.userId);
  if (!entry || entry.expires_at < new Date()) {
    throw new AppError('Verification code expired. Please log in again.', 401);
  }

  const valid = await compare(otp, entry.otp_hash);
  if (!valid) throw new AppError('Incorrect verification code', 401);

  await entry.destroy();

  const account = await UserAccount.findByPk(preAuthPayload.userId);
  await account.update({ last_login: new Date() });

  const token = signAccessToken({ userId: account.user_id, role: ROLES.ADMIN });
  return { token };
}

module.exports = {
  studentLogin,
  completeFirstLogin,
  adminLogin,
  verifyAdminOtp,
};

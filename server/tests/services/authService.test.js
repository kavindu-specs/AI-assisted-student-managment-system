jest.mock('../../src/models', () => ({
  UserAccount: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  StudentAccount: { findOne: jest.fn(), findOrCreate: jest.fn() },
  AdminUser: { findOne: jest.fn() },
  OtpChallenge: { upsert: jest.fn(), findByPk: jest.fn() },
}));
jest.mock('../../src/utils/password', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  generateOtp: jest.fn(),
}));
jest.mock('../../src/utils/jwt', () => ({
  signAccessToken: jest.fn(),
  signPreAuthToken: jest.fn(),
}));
jest.mock('../../src/services/notificationService', () => ({ notify: jest.fn() }));
jest.mock('../../src/services/auditService', () => ({ record: jest.fn() }));

const {
  UserAccount, Student, StudentAccount, AdminUser, OtpChallenge,
} = require('../../src/models');
const { hash, compare, generateOtp } = require('../../src/utils/password');
const { signAccessToken, signPreAuthToken } = require('../../src/utils/jwt');
const notificationService = require('../../src/services/notificationService');
const auditService = require('../../src/services/auditService');
const authService = require('../../src/services/authService');

function fakeAccount(overrides = {}) {
  return {
    user_id: 1,
    email: 'student@students.rjt.ac.lk',
    password_hash: 'hashed',
    status: 'Active',
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('studentLogin', () => {
  it('rejects with a generic message when no student has this reg_number', async () => {
    Student.findOne.mockResolvedValue(null);

    await expect(authService.studentLogin('AGRI-2026-0001', 'pw'))
      .rejects.toMatchObject({ statusCode: 401, message: 'Invalid registration number or password' });
  });

  it('rejects with the same generic message when the account record is missing', async () => {
    Student.findOne.mockResolvedValue({ student_id: 1 });
    UserAccount.findByPk.mockResolvedValue(null);

    await expect(authService.studentLogin('AGRI-2026-0001', 'pw')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects on a wrong password without revealing whether the account exists', async () => {
    Student.findOne.mockResolvedValue({ student_id: 1 });
    UserAccount.findByPk.mockResolvedValue(fakeAccount());
    compare.mockResolvedValue(false);

    await expect(authService.studentLogin('AGRI-2026-0001', 'wrong')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects with 403 when the account is not Active (e.g. still Inactive pending approval)', async () => {
    Student.findOne.mockResolvedValue({ student_id: 1 });
    UserAccount.findByPk.mockResolvedValue(fakeAccount({ status: 'Inactive' }));
    compare.mockResolvedValue(true);

    await expect(authService.studentLogin('AGRI-2026-0001', 'pw'))
      .rejects.toMatchObject({ statusCode: 403, message: expect.stringMatching(/not active/i) });
  });

  it('requires first login when there is no StudentAccount row yet', async () => {
    Student.findOne.mockResolvedValue({ student_id: 1 });
    UserAccount.findByPk.mockResolvedValue(fakeAccount());
    compare.mockResolvedValue(true);
    StudentAccount.findOne.mockResolvedValue(null);
    signPreAuthToken.mockReturnValue('pre-auth-jwt');

    const result = await authService.studentLogin('AGRI-2026-0001', 'pw');

    expect(result).toEqual({ requiresFirstLogin: true, preAuthToken: 'pre-auth-jwt' });
    expect(signPreAuthToken).toHaveBeenCalledWith({ userId: 1, role: 'student', step: 'first-login' });
  });

  it('requires first login when StudentAccount.login_completed is still false', async () => {
    Student.findOne.mockResolvedValue({ student_id: 1 });
    UserAccount.findByPk.mockResolvedValue(fakeAccount());
    compare.mockResolvedValue(true);
    StudentAccount.findOne.mockResolvedValue({ login_completed: false });
    signPreAuthToken.mockReturnValue('pre-auth-jwt');

    const result = await authService.studentLogin('AGRI-2026-0001', 'pw');
    expect(result.requiresFirstLogin).toBe(true);
  });

  it('logs a returning student in, updating last_login and signing a full access token', async () => {
    const account = fakeAccount();
    const student = { student_id: 1 };
    Student.findOne.mockResolvedValue(student);
    UserAccount.findByPk.mockResolvedValue(account);
    compare.mockResolvedValue(true);
    StudentAccount.findOne.mockResolvedValue({ login_completed: true });
    signAccessToken.mockReturnValue('access-jwt');

    const result = await authService.studentLogin('AGRI-2026-0001', 'pw');

    expect(account.update).toHaveBeenCalledWith({ last_login: expect.any(Date) });
    expect(signAccessToken).toHaveBeenCalledWith({ userId: 1, studentId: 1, role: 'student' });
    expect(result).toEqual({ requiresFirstLogin: false, token: 'access-jwt', student });
  });
});

describe('completeFirstLogin', () => {
  it('rejects a pre-auth payload whose step is not "first-login"', async () => {
    await expect(authService.completeFirstLogin({ step: 'otp', userId: 1 }, 'newpassword123'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('404s if the account no longer exists', async () => {
    UserAccount.findByPk.mockResolvedValue(null);
    await expect(authService.completeFirstLogin({ step: 'first-login', userId: 1 }, 'newpassword123'))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('hashes the new password, marks login_completed, audits, and returns a full token', async () => {
    const account = fakeAccount();
    UserAccount.findByPk.mockResolvedValue(account);
    hash.mockResolvedValue('new-hash');
    const studentAccount = { update: jest.fn().mockResolvedValue(undefined) };
    StudentAccount.findOrCreate.mockResolvedValue([studentAccount, false]);
    signAccessToken.mockReturnValue('access-jwt');

    const result = await authService.completeFirstLogin({ step: 'first-login', userId: 1 }, 'newpassword123');

    expect(hash).toHaveBeenCalledWith('newpassword123');
    expect(account.update).toHaveBeenCalledWith({ password_hash: 'new-hash', last_login: expect.any(Date) });
    expect(StudentAccount.findOrCreate).toHaveBeenCalledWith({
      where: { student_id: 1 },
      defaults: { student_id: 1 },
    });
    expect(studentAccount.update).toHaveBeenCalledWith({ login_completed: true });
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 1,
      action: 'FIRST_LOGIN_PASSWORD_RESET',
      entityName: 'student_account',
    }));
    expect(result).toEqual({ token: 'access-jwt' });
  });
});

describe('adminLogin', () => {
  it('rejects an email outside the institutional domain before touching the database', async () => {
    await expect(authService.adminLogin('someone@gmail.com', 'pw')).rejects.toMatchObject({ statusCode: 401 });
    expect(AdminUser.findOne).not.toHaveBeenCalled();
  });

  it('rejects with a generic message when no ADMIN_USER matches the email', async () => {
    AdminUser.findOne.mockResolvedValue(null);
    await expect(authService.adminLogin('nobody@agri.rjt.ac.lk', 'pw')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects on a wrong password', async () => {
    AdminUser.findOne.mockResolvedValue({ admin_id: 9 });
    UserAccount.findByPk.mockResolvedValue(fakeAccount({ user_id: 9 }));
    compare.mockResolvedValue(false);

    await expect(authService.adminLogin('registrar@agri.rjt.ac.lk', 'wrong')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects with 403 when the admin account is Locked/Inactive', async () => {
    AdminUser.findOne.mockResolvedValue({ admin_id: 9 });
    UserAccount.findByPk.mockResolvedValue(fakeAccount({ user_id: 9, status: 'Locked' }));
    compare.mockResolvedValue(true);

    await expect(authService.adminLogin('registrar@agri.rjt.ac.lk', 'pw')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('always issues an OTP on success - there is no per-account 2FA toggle in this schema', async () => {
    const account = fakeAccount({ user_id: 9, email: 'registrar@agri.rjt.ac.lk' });
    AdminUser.findOne.mockResolvedValue({ admin_id: 9 });
    UserAccount.findByPk.mockResolvedValue(account);
    compare.mockResolvedValue(true);
    generateOtp.mockReturnValue('654321');
    hash.mockResolvedValue('hashed-otp');
    signPreAuthToken.mockReturnValue('pre-auth-jwt');

    const result = await authService.adminLogin('registrar@agri.rjt.ac.lk', 'pw');

    expect(result).toEqual({ requiresOtp: true, preAuthToken: 'pre-auth-jwt' });
    expect(OtpChallenge.upsert).toHaveBeenCalledWith({
      user_id: 9, otp_hash: 'hashed-otp', expires_at: expect.any(Date),
    });
    expect(notificationService.notify).toHaveBeenCalledWith(expect.objectContaining({
      userId: 9,
      email: 'registrar@agri.rjt.ac.lk',
      message: expect.stringContaining('654321'),
    }));
    expect(signPreAuthToken).toHaveBeenCalledWith({ userId: 9, role: 'admin', step: 'otp' });
  });
});

describe('verifyAdminOtp', () => {
  it('rejects a pre-auth payload whose step is not "otp"', async () => {
    await expect(authService.verifyAdminOtp({ step: 'first-login', userId: 1 }, '123456'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects when no OTP was ever requested for this user (no row in otp_challenge)', async () => {
    OtpChallenge.findByPk.mockResolvedValue(null);
    await expect(authService.verifyAdminOtp({ step: 'otp', userId: 999 }, '123456'))
      .rejects.toMatchObject({ statusCode: 401, message: expect.stringMatching(/expired/i) });
  });

  it('rejects an expired OTP - this is what makes a second worker able to see an OTP the first worker issued', async () => {
    OtpChallenge.findByPk.mockResolvedValue({
      otp_hash: 'hashed-otp',
      expires_at: new Date(Date.now() - 1000), // a minute past its TTL
      destroy: jest.fn(),
    });

    await expect(authService.verifyAdminOtp({ step: 'otp', userId: 20 }, '111111'))
      .rejects.toMatchObject({ statusCode: 401, message: expect.stringMatching(/expired/i) });
  });

  it('rejects an incorrect OTP without deleting the still-valid challenge row', async () => {
    const entry = {
      otp_hash: 'hashed-otp',
      expires_at: new Date(Date.now() + 60_000),
      destroy: jest.fn(),
    };
    OtpChallenge.findByPk.mockResolvedValue(entry);
    compare.mockResolvedValue(false);

    await expect(authService.verifyAdminOtp({ step: 'otp', userId: 21 }, '000000')).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringMatching(/incorrect/i),
    });
    expect(entry.destroy).not.toHaveBeenCalled();
  });

  it('on success, consumes (destroys) the challenge row and returns an access token', async () => {
    const entry = {
      otp_hash: 'hashed-otp',
      expires_at: new Date(Date.now() + 60_000),
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    OtpChallenge.findByPk.mockResolvedValue(entry);
    compare.mockResolvedValue(true);
    const account = fakeAccount({ user_id: 22 });
    UserAccount.findByPk.mockResolvedValue(account);
    signAccessToken.mockReturnValue('access-jwt');

    const result = await authService.verifyAdminOtp({ step: 'otp', userId: 22 }, '333333');

    expect(compare).toHaveBeenCalledWith('333333', 'hashed-otp');
    expect(entry.destroy).toHaveBeenCalled();
    expect(account.update).toHaveBeenCalledWith({ last_login: expect.any(Date) });
    expect(signAccessToken).toHaveBeenCalledWith({ userId: 22, role: 'admin' });
    expect(result).toEqual({ token: 'access-jwt' });
  });

  it('a retry after the row was consumed fails, since findByPk now returns nothing', async () => {
    OtpChallenge.findByPk.mockResolvedValue(null); // simulates the row having been destroy()ed already
    await expect(authService.verifyAdminOtp({ step: 'otp', userId: 22 }, '333333'))
      .rejects.toMatchObject({ statusCode: 401, message: expect.stringMatching(/expired/i) });
  });
});

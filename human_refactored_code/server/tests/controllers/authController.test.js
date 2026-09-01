jest.mock('../../src/services/authService', () => ({
  studentLogin: jest.fn(),
  completeFirstLogin: jest.fn(),
  adminLogin: jest.fn(),
  verifyAdminOtp: jest.fn(),
}));
jest.mock('../../src/utils/jwt', () => ({ verifyToken: jest.fn() }));

const authService = require('../../src/services/authService');
const { verifyToken } = require('../../src/utils/jwt');
const authController = require('../../src/controllers/authController');

// asyncHandler's `wrapped()` does not return the inner promise chain (see
// tests/utils/asyncHandler.test.js), so tests flush the microtask queue via
// a macrotask boundary before asserting on res/next.
function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('studentLogin', () => {
  it('extracts regNumber/password from the body and returns the service result', async () => {
    authService.studentLogin.mockResolvedValue({ requiresFirstLogin: false, token: 'jwt' });
    const req = { body: { regNumber: 'AGRI-2026-0001', password: 'pw' } };
    const res = mockRes();
    const next = jest.fn();

    authController.studentLogin(req, res, next);
    await flush();

    expect(authService.studentLogin).toHaveBeenCalledWith('AGRI-2026-0001', 'pw');
    expect(res.json).toHaveBeenCalledWith({
      success: true, message: 'Login successful', data: { requiresFirstLogin: false, token: 'jwt' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a service error to next() with its status/message intact', async () => {
    const AppError = require('../../src/utils/AppError');
    authService.studentLogin.mockRejectedValue(new AppError('Invalid registration number or password', 401));
    const req = { body: { regNumber: 'bad', password: 'bad' } };
    const res = mockRes();
    const next = jest.fn();

    authController.studentLogin(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('adminLogin', () => {
  it('extracts institutionalEmail/password from the body', async () => {
    authService.adminLogin.mockResolvedValue({ requiresOtp: true, preAuthToken: 'pre-auth' });
    const req = { body: { institutionalEmail: 'a@agri.rjt.ac.lk', password: 'pw' } };
    const res = mockRes();

    authController.adminLogin(req, res, jest.fn());
    await flush();

    expect(authService.adminLogin).toHaveBeenCalledWith('a@agri.rjt.ac.lk', 'pw');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { requiresOtp: true, preAuthToken: 'pre-auth' },
    }));
  });
});

describe('completeFirstLogin / verifyAdminOtp (pre-auth token extraction)', () => {
  it('rejects with 401 when there is no Authorization header at all', async () => {
    const req = { headers: {}, body: { newPassword: 'x', confirmPassword: 'x' } };
    const res = mockRes();
    const next = jest.fn();

    authController.completeFirstLogin(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(authService.completeFirstLogin).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the token is not flagged preAuth (a full access token was used instead)', async () => {
    verifyToken.mockReturnValue({ userId: 1, role: 'student' }); // no preAuth flag
    const req = { headers: { authorization: 'Bearer full-access-token' }, body: { newPassword: 'x', confirmPassword: 'x' } };
    const res = mockRes();
    const next = jest.fn();

    authController.completeFirstLogin(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(authService.completeFirstLogin).not.toHaveBeenCalled();
  });

  it('passes the decoded pre-auth payload and newPassword through to the service on success', async () => {
    verifyToken.mockReturnValue({ userId: 1, role: 'student', preAuth: true, step: 'first-login' });
    authService.completeFirstLogin.mockResolvedValue({ token: 'full-jwt' });
    const req = {
      headers: { authorization: 'Bearer pre-auth-token' },
      body: { newPassword: 'longenough', confirmPassword: 'longenough' },
    };
    const res = mockRes();

    authController.completeFirstLogin(req, res, jest.fn());
    await flush();

    expect(authService.completeFirstLogin).toHaveBeenCalledWith(
      { userId: 1, role: 'student', preAuth: true, step: 'first-login' },
      'longenough',
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { token: 'full-jwt' } }));
  });

  it('verifyAdminOtp passes the decoded payload and otp through to the service', async () => {
    verifyToken.mockReturnValue({ userId: 9, role: 'admin', preAuth: true, step: 'otp' });
    authService.verifyAdminOtp.mockResolvedValue({ token: 'admin-jwt' });
    const req = { headers: { authorization: 'Bearer pre-auth-token' }, body: { otp: '123456' } };
    const res = mockRes();

    authController.verifyAdminOtp(req, res, jest.fn());
    await flush();

    expect(authService.verifyAdminOtp).toHaveBeenCalledWith(
      { userId: 9, role: 'admin', preAuth: true, step: 'otp' },
      '123456',
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { token: 'admin-jwt' } }));
  });
});

describe('me', () => {
  it('returns the already-decoded req.user as-is (no service call)', async () => {
    const req = { user: { userId: 1, role: 'student' } };
    const res = mockRes();

    authController.me(req, res, jest.fn());
    await flush();

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { userId: 1, role: 'student' } }));
  });
});

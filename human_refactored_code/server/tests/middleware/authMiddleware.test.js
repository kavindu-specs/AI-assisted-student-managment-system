jest.mock('../../src/utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

const { verifyToken } = require('../../src/utils/jwt');
const { authenticate, requireRole } = require('../../src/middleware/authMiddleware');

function mockReq(headers = {}) {
  return { headers };
}

describe('authenticate', () => {
  it('rejects a request with no Authorization header', () => {
    const next = jest.fn();
    authenticate(mockReq(), {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, message: 'Authentication token missing' }));
  });

  it('rejects a header that is not a Bearer token', () => {
    const next = jest.fn();
    authenticate(mockReq({ authorization: 'Basic abc123' }), {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejects an invalid/expired token', () => {
    verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });
    const next = jest.fn();

    authenticate(mockReq({ authorization: 'Bearer bad-token' }), {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401, message: 'Invalid or expired token' }));
  });

  it('rejects a pre-auth token (it must only be used for its one follow-up endpoint)', () => {
    verifyToken.mockReturnValue({ userId: 1, role: 'student', preAuth: true, step: 'first-login' });
    const next = jest.fn();

    authenticate(mockReq({ authorization: 'Bearer pre-auth-token' }), {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: 'Pre-auth token cannot access this resource',
    }));
  });

  it('attaches the decoded payload to req.user and calls next() with no error', () => {
    verifyToken.mockReturnValue({ userId: 7, role: 'admin' });
    const req = mockReq({ authorization: 'Bearer good-token' });
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(req.user).toEqual({ userId: 7, role: 'admin' });
    expect(next).toHaveBeenCalledWith();
  });
});

describe('requireRole', () => {
  it('calls next() when req.user.role is in the allowed list', () => {
    const req = { user: { role: 'admin' } };
    const next = jest.fn();

    requireRole('admin', 'student')(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects with 403 when req.user.role is not allowed', () => {
    const req = { user: { role: 'student' } };
    const next = jest.fn();

    requireRole('admin')(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, message: 'Insufficient permissions' }));
  });

  it('rejects with 403 when req.user is missing entirely', () => {
    const next = jest.fn();
    requireRole('admin')({}, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

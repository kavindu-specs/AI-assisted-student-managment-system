const jsonwebtoken = require('jsonwebtoken');
const {
  signAccessToken, signPreAuthToken, verifyToken,
} = require('../../src/utils/jwt');

describe('jwt utils', () => {
  it('signAccessToken produces a token verifyToken can decode with the original payload', () => {
    const token = signAccessToken({ userId: 1, role: 'student', studentId: 1 });
    const decoded = verifyToken(token);

    expect(decoded).toMatchObject({ userId: 1, role: 'student', studentId: 1 });
    expect(decoded.preAuth).toBeUndefined();
  });

  it('signPreAuthToken flags the token as preAuth', () => {
    const token = signPreAuthToken({ userId: 2, role: 'admin', step: 'otp' });
    const decoded = verifyToken(token);

    expect(decoded.preAuth).toBe(true);
    expect(decoded.step).toBe('otp');
  });

  it('verifyToken throws on a tampered/invalid token', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });

  it('verifyToken throws on an expired token', () => {
    const env = require('../../src/config/env');
    const expired = jsonwebtoken.sign({ userId: 3 }, env.jwt.secret, { expiresIn: -10 });
    expect(() => verifyToken(expired)).toThrow(/expired/i);
  });

  it('verifyToken throws when signed with a different secret', () => {
    const forged = jsonwebtoken.sign({ userId: 4, role: 'admin' }, 'someone-elses-secret');
    expect(() => verifyToken(forged)).toThrow();
  });
});

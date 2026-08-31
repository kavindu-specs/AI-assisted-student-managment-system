const {
  hash, compare, generateTempPassword, generateOtp,
} = require('../../src/utils/password');

describe('password utils', () => {
  describe('hash/compare', () => {
    it('produces a hash that compare() verifies as matching', async () => {
      const hashed = await hash('correct-horse-battery-staple');
      expect(hashed).not.toBe('correct-horse-battery-staple');

      await expect(compare('correct-horse-battery-staple', hashed)).resolves.toBe(true);
    });

    it('rejects an incorrect plaintext password', async () => {
      const hashed = await hash('the-real-password');
      await expect(compare('a-wrong-guess', hashed)).resolves.toBe(false);
    });

    it('salts each hash differently even for the same input', async () => {
      const [a, b] = await Promise.all([hash('same-password'), hash('same-password')]);
      expect(a).not.toBe(b);
    });
  });

  describe('generateTempPassword', () => {
    it('defaults to a 10-character password', () => {
      expect(generateTempPassword()).toHaveLength(10);
    });

    it('respects a custom length', () => {
      expect(generateTempPassword(16)).toHaveLength(16);
    });

    it('never includes visually-ambiguous characters (0/1/O/o/I/i/L/l)', () => {
      for (let i = 0; i < 50; i += 1) {
        expect(generateTempPassword(20)).not.toMatch(/[01OoIiLl]/);
      }
    });
  });

  describe('generateOtp', () => {
    it('always returns a 6-digit numeric string', () => {
      for (let i = 0; i < 50; i += 1) {
        const otp = generateOtp();
        expect(otp).toMatch(/^\d{6}$/);
      }
    });
  });
});

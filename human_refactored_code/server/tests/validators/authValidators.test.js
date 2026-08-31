const {
  studentLoginSchema, adminLoginSchema, otpVerifySchema, firstLoginSchema,
} = require('../../src/validators/authValidators');

describe('studentLoginSchema', () => {
  it('accepts a regNumber and password', () => {
    expect(studentLoginSchema.safeParse({ regNumber: 'AGRI-2026-0001', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty regNumber', () => {
    const result = studentLoginSchema.safeParse({ regNumber: '', password: 'x' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing password', () => {
    expect(studentLoginSchema.safeParse({ regNumber: 'AGRI-2026-0001' }).success).toBe(false);
  });
});

describe('adminLoginSchema', () => {
  it('accepts a well-formed email', () => {
    expect(adminLoginSchema.safeParse({ institutionalEmail: 'a@agri.rjt.ac.lk', password: 'x' }).success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = adminLoginSchema.safeParse({ institutionalEmail: 'not-an-email', password: 'x' });
    expect(result.success).toBe(false);
  });

  it('does not itself enforce the institutional domain (that check lives in authService)', () => {
    // any syntactically valid email passes the schema - the @agri.rjt.ac.lk
    // domain restriction is a business rule enforced in authService.adminLogin.
    expect(adminLoginSchema.safeParse({ institutionalEmail: 'a@gmail.com', password: 'x' }).success).toBe(true);
  });
});

describe('otpVerifySchema', () => {
  it('accepts exactly 6 characters', () => {
    expect(otpVerifySchema.safeParse({ otp: '123456' }).success).toBe(true);
  });

  it('rejects shorter or longer codes', () => {
    expect(otpVerifySchema.safeParse({ otp: '12345' }).success).toBe(false);
    expect(otpVerifySchema.safeParse({ otp: '1234567' }).success).toBe(false);
  });
});

describe('firstLoginSchema', () => {
  it('accepts matching passwords of at least 8 characters', () => {
    expect(firstLoginSchema.safeParse({ newPassword: 'longenough', confirmPassword: 'longenough' }).success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(firstLoginSchema.safeParse({ newPassword: 'short', confirmPassword: 'short' }).success).toBe(false);
  });

  it('rejects mismatched passwords, attaching the error to confirmPassword', () => {
    const result = firstLoginSchema.safeParse({ newPassword: 'longenough', confirmPassword: 'different' });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    expect(result.error.issues[0].message).toBe('Passwords do not match');
  });
});

const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  it('defaults to statusCode 400 and null errors', () => {
    const err = new AppError('Something went wrong');

    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(400);
    expect(err.errors).toBeNull();
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  it('carries a custom status code and errors payload', () => {
    const errors = [{ path: 'email', message: 'Required' }];
    const err = new AppError('Validation failed', 422, errors);

    expect(err.statusCode).toBe(422);
    expect(err.errors).toBe(errors);
  });

  it('captures a stack trace', () => {
    const err = new AppError('boom');
    expect(typeof err.stack).toBe('string');
    expect(err.stack.length).toBeGreaterThan(0);
  });
});

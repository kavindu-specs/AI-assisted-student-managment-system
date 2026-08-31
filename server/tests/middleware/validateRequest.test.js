const { z } = require('zod');
const validateRequest = require('../../src/middleware/validateRequest');

const schema = z.object({
  email: z.string().email('A valid email is required'),
  age: z.number().int().positive().optional(),
});

describe('validateRequest', () => {
  it('calls next() with no error and replaces req.body with the parsed data on success', () => {
    const req = { body: { email: 'a@b.com', age: 21 } };
    const next = jest.fn();

    validateRequest(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ email: 'a@b.com', age: 21 });
  });

  it('calls next(AppError) with a 422 and a field-level errors array on failure', () => {
    const req = { body: { email: 'not-an-email' } };
    const next = jest.fn();

    validateRequest(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 422,
      message: 'Validation failed',
      errors: [{ path: 'email', message: 'A valid email is required' }],
    }));
  });

  it('joins nested paths with a dot', () => {
    const nested = z.object({ user: z.object({ name: z.string().min(1) }) });
    const req = { body: { user: { name: '' } } };
    const next = jest.fn();

    validateRequest(nested)(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.errors[0].path).toBe('user.name');
  });

  it('validates req.query instead of req.body when source is "query"', () => {
    const querySchema = z.object({ page: z.string() });
    const req = { query: { page: '2' } };
    const next = jest.fn();

    validateRequest(querySchema, 'query')(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ page: '2' });
  });

  it('strips unknown fields not defined in the schema by default (zod strips unless .passthrough())', () => {
    const req = { body: { email: 'a@b.com', extra: 'not in schema' } };
    const next = jest.fn();

    validateRequest(schema)(req, {}, next);

    expect(req.body).toEqual({ email: 'a@b.com' });
  });
});

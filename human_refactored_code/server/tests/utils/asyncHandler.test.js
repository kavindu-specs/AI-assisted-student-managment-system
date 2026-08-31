const asyncHandler = require('../../src/utils/asyncHandler');

describe('asyncHandler', () => {
  it('calls the wrapped function with req, res, next', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a thrown/rejected error to next() instead of throwing', async () => {
    const error = new Error('db exploded');
    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(fn);
    const next = jest.fn();

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('forwards a throw on the handler\'s very first line (before any await)', async () => {
    // Every real call site wraps an `async` function (see src/controllers/*.js),
    // so a throw here is a promise rejection under the hood, not a
    // synchronous throw out of `wrapped` - asyncHandler only needs to handle
    // the async-function case, not a plain synchronous function.
    const error = new Error('sync boom');
    const fn = jest.fn(async () => { throw error; });
    const wrapped = asyncHandler(fn);
    const next = jest.fn();

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

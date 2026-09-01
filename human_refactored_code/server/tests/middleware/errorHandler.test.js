jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

const logger = require('../../src/utils/logger');
const AppError = require('../../src/utils/AppError');
const { notFound, errorHandler } = require('../../src/middleware/errorHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('notFound', () => {
  it('responds 404 with the method and original URL in the message', () => {
    const res = mockRes();
    notFound({ method: 'GET', originalUrl: '/api/nope' }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Route not found: GET /api/nope',
    }));
  });
});

describe('errorHandler', () => {
  it('maps an AppError (isOperational) to its own status/message/errors', () => {
    const res = mockRes();
    const err = new AppError('Nope', 403, ['detail']);

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Nope', errors: ['detail'] });
  });

  it('defaults an AppError with no statusCode set to 400', () => {
    const res = mockRes();
    const err = { isOperational: true, message: 'Bad thing' };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('maps SequelizeUniqueConstraintError to 409 with per-field messages', () => {
    const res = mockRes();
    const err = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'nic must be unique' }],
    };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: ['nic must be unique'] }));
  });

  it('maps SequelizeValidationError to 422', () => {
    const res = mockRes();
    const err = { name: 'SequelizeValidationError', errors: [{ message: 'invalid' }] };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('maps SequelizeForeignKeyConstraintError to 400', () => {
    const res = mockRes();
    errorHandler({ name: 'SequelizeForeignKeyConstraintError' }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Related record not found' }));
  });

  it('maps a MulterError to 400 using its own message', () => {
    const res = mockRes();
    errorHandler({ name: 'MulterError', message: 'File too large' }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'File too large' }));
  });

  it('falls back to a logged 500 for anything unrecognized', () => {
    const res = mockRes();
    const err = new Error('totally unexpected');

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    expect(logger.error).toHaveBeenCalledWith('Unhandled error:', err);
  });
});

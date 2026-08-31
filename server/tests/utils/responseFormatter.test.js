const { success, created, fail } = require('../../src/utils/responseFormatter');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('responseFormatter', () => {
  it('success() defaults to 200 with the given data/message', () => {
    const res = mockRes();
    success(res, { id: 1 }, 'Loaded');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Loaded', data: { id: 1 } });
  });

  it('success() allows a custom status code', () => {
    const res = mockRes();
    success(res, null, 'Accepted', 202);
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('created() always uses 201', () => {
    const res = mockRes();
    created(res, { id: 5 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Created', data: { id: 5 } });
  });

  it('fail() defaults to 400 with success:false', () => {
    const res = mockRes();
    fail(res, 'Bad input');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Bad input', errors: null });
  });

  it('fail() carries a custom status and errors array', () => {
    const res = mockRes();
    const errors = [{ path: 'email', message: 'Invalid' }];
    fail(res, 'Validation failed', 422, errors);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Validation failed', errors });
  });
});

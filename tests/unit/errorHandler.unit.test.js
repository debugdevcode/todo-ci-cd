/**
 * Unit tests for errorHandler middleware
 * Tests each error branch in isolation — no HTTP server needed.
 */
const { errorHandler, asyncHandler } = require('../../src/middleware/errorHandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = () => ({});
const mockNext = () => jest.fn();

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = mockNext();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 400 for CastError (invalid MongoDB ObjectId)', () => {
    const err = { name: 'CastError', stack: '' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid ID format' });
  });

  it('returns 400 for Mongoose ValidationError with joined messages', () => {
    const err = {
      name: 'ValidationError',
      stack: '',
      errors: {
        title: { message: 'Title is required' },
        priority: { message: 'Priority must be low, medium, or high' },
      },
    };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toContain('Title is required');
    expect(body.message).toContain('Priority must be low, medium, or high');
  });

  it('returns 400 for duplicate key error (code 11000)', () => {
    const err = { code: 11000, stack: '' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Duplicate field value' });
  });

  it('returns err.status when set on the error object', () => {
    const err = { status: 422, message: 'Unprocessable', stack: '' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unprocessable' });
  });

  it('returns 500 as default when no specific error type matches', () => {
    const err = { message: 'Something exploded', stack: '' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Something exploded' });
  });

  it('returns 500 with generic message when err.message is absent', () => {
    const err = { stack: '' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
  });
});

describe('asyncHandler wrapper', () => {
  it('calls the wrapped function with req, res, next', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    await asyncHandler(fn)(req, res, next);
    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it('calls next() with the error when the wrapped function rejects', async () => {
    const err = new Error('async failure');
    const fn = jest.fn().mockRejectedValue(err);
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    await asyncHandler(fn)(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

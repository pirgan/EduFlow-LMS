import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/User.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import { protect } from './authMiddleware.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('protect middleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('returns 401 when no Authorization header', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorised, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'Basic sometoken';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user is not found after token decode', async () => {
    req.headers.authorization = 'Bearer valid_token';
    jwt.verify.mockReturnValue({ id: 'uid1' });
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next on valid token', async () => {
    req.headers.authorization = 'Bearer valid_token';
    const fakeUser = { _id: 'uid1', name: 'Alice', role: 'student' };
    jwt.verify.mockReturnValue({ id: 'uid1' });
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });

    await protect(req, res, next);

    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

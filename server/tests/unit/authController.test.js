import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules before importing the controller
vi.mock('../../src/models/User.js');
vi.mock('jsonwebtoken');

import { register, login, getMe } from '../../src/controllers/authController.js';
import User from '../../src/models/User.js';
import jwt from 'jsonwebtoken';

// Helper: build a minimal res mock
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET     = 'test-secret';
  process.env.JWT_EXPIRES_IN = '7d';
  jwt.sign.mockReturnValue('mock-token');
});

// ─── register ────────────────────────────────────────────────────────────────

describe('register', () => {
  it('creates a user and returns 201 with a JWT and safe user payload', async () => {
    const fakeUser = { _id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'student' };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(fakeUser);

    const req = { body: { name: 'Alice', email: 'alice@test.com', password: 'pass123', role: 'student' } };
    const res = mockRes();
    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.token).toBe('mock-token');
    expect(payload.user).toMatchObject({ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'student' });
    expect(payload.user.password).toBeUndefined();
  });

  it('returns 400 when email is already in use', async () => {
    User.findOne.mockResolvedValue({ email: 'existing@test.com' });

    const req = { body: { name: 'Bob', email: 'existing@test.com', password: 'pass123' } };
    const res = mockRes();
    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('passes the raw password to User.create — hashing is the model pre-save hook responsibility', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'u2', name: 'Carol', email: 'carol@test.com', role: 'student' });

    const req = { body: { name: 'Carol', email: 'carol@test.com', password: 'plaintext' } };
    const res = mockRes();
    await register(req, res);

    // Controller should not hash — that is the model's job
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'plaintext' })
    );
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe('login', () => {
  it('returns 200 with JWT and user payload (no password) on correct credentials', async () => {
    const fakeUser = {
      _id: 'u3', name: 'Dave', email: 'dave@test.com', role: 'instructor',
      matchPassword: vi.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });

    const req = { body: { email: 'dave@test.com', password: 'correct' } };
    const res = mockRes();
    await login(req, res);

    expect(res.status).not.toHaveBeenCalledWith(401);
    const payload = res.json.mock.calls[0][0];
    expect(payload.token).toBe('mock-token');
    expect(payload.user).toMatchObject({ id: 'u3', name: 'Dave', email: 'dave@test.com', role: 'instructor' });
    expect(payload.user.password).toBeUndefined();
  });

  it('returns 401 when password is wrong', async () => {
    const fakeUser = {
      _id: 'u4', name: 'Eve', email: 'eve@test.com', role: 'student',
      matchPassword: vi.fn().mockResolvedValue(false),
    };
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });

    const req = { body: { email: 'eve@test.com', password: 'wrong' } };
    const res = mockRes();
    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('returns 401 when email is not found', async () => {
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

    const req = { body: { email: 'nobody@test.com', password: 'any' } };
    const res = mockRes();
    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('calls User.findOne with the correct email', async () => {
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

    const req = { body: { email: 'check@test.com', password: 'x' } };
    const res = mockRes();
    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'check@test.com' });
  });
});

// ─── getMe ───────────────────────────────────────────────────────────────────

describe('getMe', () => {
  it('returns the user attached to req by the protect middleware', async () => {
    const fakeUser = { _id: 'u5', name: 'Frank', email: 'frank@test.com', role: 'admin' };
    const req = { user: fakeUser };
    const res = mockRes();
    await getMe(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });
});

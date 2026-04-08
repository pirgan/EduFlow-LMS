import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/User.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock_token'),
    verify: vi.fn(),
  },
}));

import { register, login, getMe, updateProfile } from './authController.js';
import User from '../models/User.js';

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
    req = { body: {}, user: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('register', () => {
    it('returns 400 when email already in use', async () => {
      req.body = { name: 'Alice', email: 'alice@test.com', password: 'pass123' };
      User.findOne.mockResolvedValue({ _id: 'existing' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });

    it('creates user and responds 201 with token and user payload', async () => {
      req.body = { name: 'Bob', email: 'bob@test.com', password: 'pass123' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'uid1',
        name: 'Bob',
        email: 'bob@test.com',
        role: 'student',
      });

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith({
        name: 'Bob',
        email: 'bob@test.com',
        password: 'pass123',
        role: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock_token',
        user: { id: 'uid1', name: 'Bob', email: 'bob@test.com', role: 'student' },
      });
    });
  });

  describe('login', () => {
    it('returns 401 when user not found', async () => {
      req.body = { email: 'nobody@test.com', password: 'pass' };
      User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('returns 401 when password does not match', async () => {
      req.body = { email: 'alice@test.com', password: 'wrong' };
      const fakeUser = { matchPassword: vi.fn().mockResolvedValue(false) };
      User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns token and user on valid credentials', async () => {
      req.body = { email: 'alice@test.com', password: 'correct' };
      const fakeUser = {
        _id: 'uid1',
        name: 'Alice',
        email: 'alice@test.com',
        role: 'student',
        matchPassword: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mock_token',
        user: { id: 'uid1', name: 'Alice', email: 'alice@test.com', role: 'student' },
      });
    });
  });

  describe('getMe', () => {
    it('returns req.user', async () => {
      req.user = { _id: 'uid1', name: 'Alice', email: 'alice@test.com' };

      await getMe(req, res);

      expect(res.json).toHaveBeenCalledWith(req.user);
    });
  });

  describe('updateProfile', () => {
    it('updates user and returns the updated document', async () => {
      req.body = { name: 'Updated Name', bio: 'My bio', avatar: 'https://example.com/avatar.jpg' };
      req.user = { _id: 'uid1' };
      const updatedUser = { _id: 'uid1', name: 'Updated Name' };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await updateProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'uid1',
        { name: 'Updated Name', bio: 'My bio', avatar: 'https://example.com/avatar.jpg' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });
  });
});

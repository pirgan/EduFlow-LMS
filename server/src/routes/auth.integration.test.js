/**
 * Integration tests for /api/auth routes.
 * Uses mongodb-memory-server so no Atlas connection is needed.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import authRoutes from './authRoutes.js';

// Build a minimal Express app — no connectDB, no cron, no email
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  process.env.JWT_SECRET = 'integration_test_secret';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clear all collections between tests to avoid state bleed
  const collections = mongoose.connection.collections;
  for (const col of Object.values(collections)) {
    await col.deleteMany({});
  }
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns 201 with a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user.role).toBe('student');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 400 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'dup@test.com',
      password: 'pass123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Again',
      email: 'dup@test.com',
      password: 'pass123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already in use');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'correct_password',
    });
  });

  it('returns token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com',
      password: 'correct_password',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('bob@test.com');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com',
      password: 'wrong_password',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@test.com',
      password: 'pass',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the authenticated user profile', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Carol',
      email: 'carol@test.com',
      password: 'pass123',
    });
    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('carol@test.com');
    expect(res.body).not.toHaveProperty('password');
  });
});

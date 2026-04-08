/**
 * Integration: complete student learning flow
 *
 * Spins up mongodb-memory-server, creates a real Express app (no cron, no
 * email, no Anthropic), and exercises the auth → course → enrolment → review
 * pipeline end-to-end against an in-memory MongoDB instance.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Routes (import after env vars are set so JWT_SECRET is available)
import authRoutes      from '../../src/routes/authRoutes.js';
import courseRoutes    from '../../src/routes/courseRoutes.js';
import enrolmentRoutes from '../../src/routes/enrolmentRoutes.js';
import reviewRoutes    from '../../src/routes/reviewRoutes.js';

// ─── Test environment setup ───────────────────────────────────────────────────

let mongod;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET        = 'integration-test-secret';
  process.env.JWT_EXPIRES_IN    = '1h';
  process.env.ANTHROPIC_API_KEY = 'test';
  // Nodemailer will fail to connect but email is fire-and-forget so it won't
  // block the HTTP response.
  process.env.EMAIL_USER        = 'test@example.com';

  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/auth',       authRoutes);
  app.use('/api/courses',    courseRoutes);
  app.use('/api/enrolments', enrolmentRoutes);
  app.use('/api/reviews',    reviewRoutes);

  // Simple error handler so controllers that throw don't cause supertest to hang
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Wipe all collections between tests for isolation
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({});
  }
});

// ─── Full learning flow ───────────────────────────────────────────────────────

describe('Student learning flow', () => {
  it('completes the full flow: register → create course → enrol → complete lessons → review', async () => {

    // 1. Register a student
    const studentReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student Sam', email: 'student@test.com', password: 'pass1234', role: 'student' });
    expect(studentReg.status).toBe(201);
    const studentToken = studentReg.body.token;
    expect(studentToken).toBeTruthy();

    // 2. Student logs in and gets a fresh JWT
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'pass1234' });
    expect(studentLogin.status).toBe(200);
    expect(studentLogin.body.token).toBeTruthy();

    // 3. Register an instructor
    const instrReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Instructor Ivy', email: 'instructor@test.com', password: 'pass1234', role: 'instructor' });
    expect(instrReg.status).toBe(201);
    const instrToken = instrReg.body.token;

    // 4. Instructor creates a course with 3 lessons (starts as draft)
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instrToken}`)
      .send({
        title:       'Integration Test Course',
        description: 'A course created during integration testing.',
        category:    'Programming',
        difficulty:  'beginner',
        price:       0,
        lessons: [
          { title: 'Lesson 1', videoUrl: 'https://vimeo.com/1', duration: 10, order: 1 },
          { title: 'Lesson 2', videoUrl: 'https://vimeo.com/2', duration: 12, order: 2 },
          { title: 'Lesson 3', videoUrl: 'https://vimeo.com/3', duration: 15, order: 3 },
        ],
      });
    expect(courseRes.status).toBe(201);
    const courseId = courseRes.body._id;
    const lessonIds = courseRes.body.lessons.map((l) => l._id);
    expect(lessonIds).toHaveLength(3);

    // 5. Instructor publishes the course
    const publishRes = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instrToken}`)
      .send({ status: 'published' });
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.status).toBe('published');

    // 6. Student searches for the course (GET /api/courses returns published courses)
    const listRes = await request(app).get('/api/courses');
    expect(listRes.status).toBe(200);
    expect(listRes.body.total).toBeGreaterThanOrEqual(1);
    const found = listRes.body.courses.find((c) => c._id === courseId);
    expect(found).toBeDefined();
    expect(found.title).toBe('Integration Test Course');

    // 7. Student enrols
    const enrolRes = await request(app)
      .post(`/api/enrolments/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(enrolRes.status).toBe(201);
    expect(enrolRes.body.course.toString()).toBe(courseId);

    // 8. Student marks lesson 1 complete
    const complete1 = await request(app)
      .patch(`/api/enrolments/${courseId}/lessons/${lessonIds[0]}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(complete1.status).toBe(200);

    // 9. Verify progressPercent ≈ 33 (1 of 3 lessons)
    const progress1 = await request(app)
      .get(`/api/enrolments/${courseId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(progress1.status).toBe(200);
    expect(progress1.body.progressPercent).toBe(33);
    expect(progress1.body.completedLessons).toHaveLength(1);

    // 10. Student marks lessons 2 and 3 complete
    await request(app)
      .patch(`/api/enrolments/${courseId}/lessons/${lessonIds[1]}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);
    await request(app)
      .patch(`/api/enrolments/${courseId}/lessons/${lessonIds[2]}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);

    // 11. Verify progressPercent = 100 and completedAt is set
    const progress2 = await request(app)
      .get(`/api/enrolments/${courseId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(progress2.status).toBe(200);
    expect(progress2.body.progressPercent).toBe(100);
    expect(progress2.body.completedAt).not.toBeNull();
    expect(progress2.body.completedLessons).toHaveLength(3);

    // 12. Student posts a review
    const reviewRes = await request(app)
      .post(`/api/reviews/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 5, comment: 'Great!' });
    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.rating).toBe(5);
    expect(reviewRes.body.comment).toBe('Great!');
  });
});

// ─── Auth edge cases ──────────────────────────────────────────────────────────

describe('Auth edge cases', () => {
  it('rejects login with wrong password (401)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@test.com', password: 'correct', role: 'student' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects duplicate email on register', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Carol', email: 'carol@test.com', password: 'pass1234', role: 'student' });

    const dup = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Carol2', email: 'carol@test.com', password: 'pass5678', role: 'student' });
    expect(dup.status).toBe(400);
  });

  it('rejects protected routes without a token (401)', async () => {
    const res = await request(app).get('/api/enrolments');
    expect(res.status).toBe(401);
  });
});

// ─── Enrolment guard edge cases ───────────────────────────────────────────────

describe('Enrolment guards', () => {
  it('prevents double-enrolment (400)', async () => {
    const { body: { token } } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dave', email: 'dave@test.com', password: 'pass1234', role: 'student' });

    const { body: { token: instrToken } } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ivy', email: 'ivy@test.com', password: 'pass1234', role: 'instructor' });

    const { body: course } = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instrToken}`)
      .send({ title: 'Course X', description: 'desc', category: 'Programming', difficulty: 'beginner', price: 0, status: 'published' });

    await request(app)
      .put(`/api/courses/${course._id}`)
      .set('Authorization', `Bearer ${instrToken}`)
      .send({ status: 'published' });

    await request(app)
      .post(`/api/enrolments/${course._id}`)
      .set('Authorization', `Bearer ${token}`);

    const dup = await request(app)
      .post(`/api/enrolments/${course._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(dup.status).toBe(400);
  });
});

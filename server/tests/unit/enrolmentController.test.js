import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/models/Enrolment.js');
vi.mock('../../src/models/Course.js');
vi.mock('../../src/config/email.js', () => ({
  default: { sendMail: vi.fn().mockReturnValue({ catch: vi.fn() }) },
}));

import {
  enrolStudent,
  markLessonComplete,
  getProgress,
} from '../../src/controllers/enrolmentController.js';
import Enrolment from '../../src/models/Enrolment.js';
import Course from '../../src/models/Course.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => vi.clearAllMocks());

// ─── enrolStudent ─────────────────────────────────────────────────────────────

describe('enrolStudent', () => {
  const fakeStudent = { _id: 'student1', name: 'Alice', email: 'a@test.com' };
  const fakeCourse  = { _id: 'course1', title: 'React 101', status: 'published' };

  it('creates an enrolment and increments totalStudents on success (201)', async () => {
    Course.findById.mockResolvedValue(fakeCourse);
    Enrolment.findOne.mockResolvedValue(null);
    const fakeEnrolment = { _id: 'enrol1', student: 'student1', course: 'course1' };
    Enrolment.create.mockResolvedValue(fakeEnrolment);
    Course.findByIdAndUpdate.mockResolvedValue(fakeCourse);

    const req = { params: { courseId: 'course1' }, user: fakeStudent };
    const res = mockRes();
    await enrolStudent(req, res);

    expect(Enrolment.create).toHaveBeenCalledWith(expect.objectContaining({
      student: 'student1',
      course: 'course1',
    }));
    expect(Course.findByIdAndUpdate).toHaveBeenCalledWith('course1', { $inc: { totalStudents: 1 } });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeEnrolment);
  });

  it('returns 400 when the student is already enrolled', async () => {
    Course.findById.mockResolvedValue(fakeCourse);
    Enrolment.findOne.mockResolvedValue({ _id: 'existing' });

    const req = { params: { courseId: 'course1' }, user: fakeStudent };
    const res = mockRes();
    await enrolStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Already enrolled' });
    expect(Enrolment.create).not.toHaveBeenCalled();
  });

  it('returns 404 when the course does not exist', async () => {
    Course.findById.mockResolvedValue(null);

    const req = { params: { courseId: 'ghost' }, user: fakeStudent };
    const res = mockRes();
    await enrolStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Course not found' });
  });

  it('returns 404 when the course is not published (draft/archived)', async () => {
    Course.findById.mockResolvedValue({ _id: 'course2', status: 'draft' });

    const req = { params: { courseId: 'course2' }, user: fakeStudent };
    const res = mockRes();
    await enrolStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─── markLessonComplete ───────────────────────────────────────────────────────

describe('markLessonComplete', () => {
  const fakeStudent = { _id: 'student1' };

  const makeEnrolment = (completedLessons = []) => ({
    completedLessons: [...completedLessons],
    progressPercent: 0,
    lastWatched: null,
    completedAt: null,
    save: vi.fn().mockResolvedValue(true),
  });

  it('adds the lessonId to completedLessons and updates progressPercent', async () => {
    const enrolment = makeEnrolment([]);
    Enrolment.findOne.mockResolvedValue(enrolment);
    Course.findById.mockResolvedValue({ lessons: [{ _id: 'l1' }, { _id: 'l2' }] });

    const req = { params: { courseId: 'c1', lessonId: 'l1' }, user: fakeStudent };
    const res = mockRes();
    await markLessonComplete(req, res);

    expect(enrolment.completedLessons).toContain('l1');
    expect(enrolment.progressPercent).toBe(50); // 1 of 2 lessons
    expect(enrolment.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(enrolment);
  });

  it('is idempotent — does not add the same lessonId twice', async () => {
    const enrolment = makeEnrolment(['l1']); // already completed
    Enrolment.findOne.mockResolvedValue(enrolment);
    Course.findById.mockResolvedValue({ lessons: [{ _id: 'l1' }, { _id: 'l2' }] });

    const req = { params: { courseId: 'c1', lessonId: 'l1' }, user: fakeStudent };
    const res = mockRes();
    await markLessonComplete(req, res);

    const l1Count = enrolment.completedLessons.filter((id) => id === 'l1').length;
    expect(l1Count).toBe(1);
  });

  it('sets completedAt and progressPercent=100 when all lessons are done', async () => {
    const enrolment = makeEnrolment(['l1']); // 1 of 2 done; marking l2 completes course
    Enrolment.findOne.mockResolvedValue(enrolment);
    Course.findById.mockResolvedValue({ lessons: [{ _id: 'l1' }, { _id: 'l2' }] });

    const req = { params: { courseId: 'c1', lessonId: 'l2' }, user: fakeStudent };
    const res = mockRes();
    await markLessonComplete(req, res);

    expect(enrolment.progressPercent).toBe(100);
    expect(enrolment.completedAt).toBeInstanceOf(Date);
  });

  it('returns 404 when the student is not enrolled', async () => {
    Enrolment.findOne.mockResolvedValue(null);

    const req = { params: { courseId: 'c1', lessonId: 'l1' }, user: fakeStudent };
    const res = mockRes();
    await markLessonComplete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Enrolment not found' });
  });
});

// ─── getProgress ──────────────────────────────────────────────────────────────

describe('getProgress', () => {
  const fakeStudent = { _id: 'student1' };

  it('returns the enrolment document for an enrolled student', async () => {
    const fakeEnrolment = { progressPercent: 50, completedLessons: ['l1'], lastWatched: 'l1' };
    Enrolment.findOne.mockResolvedValue(fakeEnrolment);

    const req = { params: { courseId: 'c1' }, user: fakeStudent };
    const res = mockRes();
    await getProgress(req, res);

    expect(Enrolment.findOne).toHaveBeenCalledWith({ student: 'student1', course: 'c1' });
    expect(res.json).toHaveBeenCalledWith(fakeEnrolment);
  });

  it('returns 404 when the student is not enrolled in the course', async () => {
    Enrolment.findOne.mockResolvedValue(null);

    const req = { params: { courseId: 'c1' }, user: fakeStudent };
    const res = mockRes();
    await getProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Enrolment not found' });
  });
});

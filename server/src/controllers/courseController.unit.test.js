import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/Course.js', () => {
  const chain = {
    populate: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
  };
  // Make each chain method return itself so they can be chained
  Object.keys(chain).forEach((k) => {
    chain[k].mockReturnValue(chain);
  });

  return {
    default: {
      find: vi.fn(() => chain),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      create: vi.fn(),
      countDocuments: vi.fn(),
      _chain: chain,
    },
  };
});

import {
  getCourses,
  getById,
  createCourse,
  updateCourse,
  archiveCourse,
  getMyCourses,
  searchCourses,
} from './courseController.js';
import Course from '../models/Course.js';

describe('courseController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { _id: 'instructor1', role: 'instructor' } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Reset chain mock to return empty array by default
    const chain = Course._chain;
    chain.populate.mockReturnValue(chain);
    chain.sort.mockReturnValue(chain);
    chain.skip.mockReturnValue(chain);
    chain.limit.mockResolvedValue([]);
  });

  describe('getById', () => {
    it('returns 404 when course not found', async () => {
      req.params.id = 'nonexistent';
      Course.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue(null) });

      await getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Course not found' });
    });

    it('returns course when found', async () => {
      req.params.id = 'cid1';
      const fakeCourse = { _id: 'cid1', title: 'JS Basics' };
      Course.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue(fakeCourse) });

      await getById(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeCourse);
    });
  });

  describe('createCourse', () => {
    it('creates course with instructor forced to req.user._id', async () => {
      req.body = { title: 'New Course', description: 'Desc' };
      req.user._id = 'uid1';
      const created = { _id: 'cid1', title: 'New Course', instructor: 'uid1' };
      Course.create.mockResolvedValue(created);

      await createCourse(req, res);

      expect(Course.create).toHaveBeenCalledWith({ title: 'New Course', description: 'Desc', instructor: 'uid1' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });

  describe('updateCourse', () => {
    it('returns 404 when course not found', async () => {
      req.params.id = 'nonexistent';
      Course.findById.mockResolvedValue(null);

      await updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when non-owner instructor tries to update', async () => {
      req.params.id = 'cid1';
      req.user = { _id: 'uid2', role: 'instructor' };
      const fakeCourse = { instructor: { toString: () => 'uid1' } };
      Course.findById.mockResolvedValue(fakeCourse);

      await updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorised' });
    });

    it('updates when user is the owner', async () => {
      req.params.id = 'cid1';
      req.user = { _id: 'uid1', role: 'instructor' };
      req.body = { title: 'Updated' };
      const fakeCourse = { instructor: { toString: () => 'uid1' } };
      const updatedCourse = { _id: 'cid1', title: 'Updated' };
      Course.findById.mockResolvedValue(fakeCourse);
      Course.findByIdAndUpdate.mockResolvedValue(updatedCourse);

      await updateCourse(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedCourse);
    });

    it('allows admin to update any course', async () => {
      req.params.id = 'cid1';
      req.user = { _id: 'adminId', role: 'admin' };
      req.body = { title: 'Admin Updated' };
      const fakeCourse = { instructor: { toString: () => 'someoneElse' } };
      const updatedCourse = { _id: 'cid1', title: 'Admin Updated' };
      Course.findById.mockResolvedValue(fakeCourse);
      Course.findByIdAndUpdate.mockResolvedValue(updatedCourse);

      await updateCourse(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedCourse);
    });
  });

  describe('archiveCourse', () => {
    it('returns 404 when course not found', async () => {
      req.params.id = 'nonexistent';
      Course.findByIdAndUpdate.mockResolvedValue(null);

      await archiveCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('archives course and returns updated document', async () => {
      req.params.id = 'cid1';
      const archived = { _id: 'cid1', status: 'archived' };
      Course.findByIdAndUpdate.mockResolvedValue(archived);

      await archiveCourse(req, res);

      expect(Course.findByIdAndUpdate).toHaveBeenCalledWith('cid1', { status: 'archived' }, { new: true });
      expect(res.json).toHaveBeenCalledWith(archived);
    });
  });

  describe('searchCourses', () => {
    it('returns 400 when no query provided', async () => {
      req.query = {};

      await searchCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Query required' });
    });
  });
});

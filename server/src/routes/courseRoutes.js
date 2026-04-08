import { Router } from 'express';
import { getCourses, getById, createCourse, updateCourse, archiveCourse, getMyCourses, searchCourses } from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

// Mounted at /api/courses in src/index.js
// NOTE: /search and /my must be defined before /:id so Express does not
// treat the literal strings "search" and "my" as dynamic id parameters.
const router = Router();
router.get('/', getCourses);                                                          // public
router.get('/search', searchCourses);                                                 // public  — full-text search
router.get('/my', protect, requireRole('instructor', 'admin'), getMyCourses);         // instructor/admin — own courses
router.get('/:id', getById);                                                          // public  — course detail
router.post('/', protect, requireRole('instructor', 'admin'), createCourse);          // instructor/admin — new course
router.put('/:id', protect, requireRole('instructor', 'admin'), updateCourse);        // instructor/admin — edit course
router.patch('/:id/archive', protect, requireRole('instructor', 'admin'), archiveCourse); // instructor/admin — soft-delete
export default router;

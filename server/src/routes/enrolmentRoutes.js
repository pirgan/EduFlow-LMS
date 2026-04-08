import { Router } from 'express';
import { enrolStudent, getMyEnrolments, markLessonComplete, getProgress, generateCertificate } from '../controllers/enrolmentController.js';
import { protect } from '../middleware/authMiddleware.js';

// Mounted at /api/enrolments in src/index.js
// All routes require authentication — router.use(protect) applies the JWT
// middleware to every route in this file without repeating it per-route.
const router = Router();
router.use(protect);
router.post('/:courseId', enrolStudent);                                    // enrol in a course
router.get('/', getMyEnrolments);                                           // list own enrolments
router.get('/:courseId/progress', getProgress);                             // progress for one course
router.patch('/:courseId/lessons/:lessonId/complete', markLessonComplete);  // tick a lesson done
router.post('/:courseId/certificate', generateCertificate);                 // claim certificate (100% only)
export default router;

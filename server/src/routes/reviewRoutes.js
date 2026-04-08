import { Router } from 'express';
import { createReview, getCourseReviews, replyToReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

// Mounted at /api/reviews in src/index.js
// NOTE: /reply/:reviewId must be defined before /:courseId to avoid Express
// treating the literal "reply" as a courseId parameter.
const router = Router();
router.patch('/reply/:reviewId', protect, replyToReview);   // instructor — reply to a review
router.get('/:courseId', getCourseReviews);                 // public    — list course reviews
router.post('/:courseId', protect, createReview);           // student   — submit a review
export default router;

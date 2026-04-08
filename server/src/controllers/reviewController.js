import Review from '../models/Review.js';
import Course from '../models/Course.js';

// POST /api/reviews/:courseId  (student)
// Submits a star rating and comment for a course.
// One review per student per course is enforced by a unique compound index on
// the Review schema — we check first to return a friendly 400 instead of a 500.
// After saving the review we recompute the course's aggregate rating by fetching
// all reviews for that course. This is intentionally simple (no incremental
// update) because review volume is low and correctness is more important than
// the marginal performance gain of an incremental approach.
export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const existing = await Review.findOne({ course: req.params.courseId, student: req.user._id });
  if (existing) return res.status(400).json({ message: 'Already reviewed' });

  const review = await Review.create({ course: req.params.courseId, student: req.user._id, rating, comment });

  // Recompute and persist the course's average rating and review count
  const reviews = await Review.find({ course: req.params.courseId });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Course.findByIdAndUpdate(req.params.courseId, { rating: { average: avg, count: reviews.length } });

  res.status(201).json(review);
};

// GET /api/reviews/:courseId
// Public endpoint. Returns all reviews for a course sorted newest-first,
// with the reviewer's name and avatar populated for display.
export const getCourseReviews = async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('student', 'name avatar')
    .sort('-createdAt');
  res.json(reviews);
};

// PATCH /api/reviews/reply/:reviewId  (instructor)
// Allows the course instructor to post a public reply to a review.
// We verify that the authenticated user is the instructor of the course the
// review belongs to — not just any instructor — before writing the reply.
// Only one reply is supported per review (overwriting is allowed).
export const replyToReview = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  const course = await Course.findById(review.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the instructor can reply' });
  }
  review.instructorReply = req.body.reply;
  await review.save();
  res.json(review);
};

import mongoose from 'mongoose';

// One review per student per course. The unique index enforces this at the DB
// level; reviewController.createReview also checks first for a friendlier error.
const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  instructorReply: { type: String, default: '' },  // written via reviewController.replyToReview
}, { timestamps: true });

// Unique compound index: one review per (student, course) pair
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;

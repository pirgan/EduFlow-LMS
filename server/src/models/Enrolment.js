import mongoose from 'mongoose';

// Represents a student's purchase and progress record for a single course.
// One document per (student, course) pair — enforced by the unique index below.
const enrolmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  // Array of lesson _ids (from the embedded lessons array on Course) that the
  // student has marked complete. Used to calculate progressPercent.
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  progressPercent: { type: Number, default: 0 },
  completedAt: { type: Date },         // set automatically when progressPercent hits 100
  certificateUrl: { type: String, default: '' },  // Cloudinary PDF URL
  lastWatched: { type: mongoose.Schema.Types.ObjectId },  // lesson _id for resume playback
  paymentRef: { type: String, default: '' },  // simulated; replace with Stripe session id
}, { timestamps: true });

// Unique compound index prevents a student from enrolling in the same course twice
// and makes enrolment lookups by (student, course) fast.
enrolmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrolment = mongoose.model('Enrolment', enrolmentSchema);
export default Enrolment;

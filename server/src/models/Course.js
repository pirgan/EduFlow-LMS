import mongoose from 'mongoose';

// Lessons are embedded in the Course document rather than stored as a separate
// collection because they are always fetched together with the course and never
// queried independently. The order field drives the client-side lesson playlist.
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: '' },  // Cloudinary or external video URL
  duration: { type: Number, default: 0 },   // minutes
  order: { type: Number, required: true },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other'],
    required: true,
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  price: { type: Number, required: true, min: 0 },
  thumbnail: { type: String, default: '' },  // Cloudinary URL
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessons: [lessonSchema],
  // Lifecycle: draft → published → archived. Only published courses are visible
  // to students; archived courses are soft-deleted (enrolments are preserved).
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  totalStudents: { type: Number, default: 0 },  // denormalised counter; updated via $inc
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  aiSummary: { type: String, default: '' },  // cached Claude-generated summary
}, { timestamps: true });

// Compound text index enables $text search in courseController.searchCourses
// and is also used by the RAG pipeline in scripts/ingestContent.js.
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);
export default Course;

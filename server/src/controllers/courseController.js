import Course from '../models/Course.js';

// GET /api/courses
// Public endpoint. Returns a paginated list of published courses.
// Supports optional ?category= and ?difficulty= query filters.
// The response shape includes pagination metadata (total, page, pages)
// so the client can render a page navigator without a second request.
export const getCourses = async (req, res) => {
  const { category, difficulty, page = 1, limit = 12 } = req.query;
  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  const sortOrder = req.query.sort === 'popular' ? '-totalStudents -createdAt' : '-createdAt';
  const courses = await Course.find(filter)
    .populate('instructor', 'name avatar')
    .sort(sortOrder)
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Course.countDocuments(filter);
  res.json({ courses, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// GET /api/courses/:id
// Public endpoint. Returns a single course by its MongoDB _id, including
// the instructor's bio so the course detail page can render an author section.
export const getById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name avatar bio');
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
};

// POST /api/courses  (instructor | admin)
// Creates a new course in draft status (the model default).
// The instructor field is forced to the authenticated user's id so an
// instructor cannot create a course attributed to someone else.
export const createCourse = async (req, res) => {
  const course = await Course.create({ ...req.body, instructor: req.user._id });
  res.status(201).json(course);
};

// PUT /api/courses/:id  (instructor | admin)
// Updates course fields. Instructors can only edit their own courses;
// admins can edit any course. We do an ownership check before the update
// rather than relying solely on the role middleware so that one instructor
// cannot overwrite another's course.
export const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorised' });
  }
  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// PATCH /api/courses/:id/archive  (instructor | admin)
// Soft-deletes a course by flipping its status to 'archived'.
// Archived courses are excluded from the public listing and search
// but remain in the database so existing enrolments are not broken.
export const archiveCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
};

// GET /api/courses/my  (instructor | admin)
// Returns all courses created by the authenticated instructor, regardless
// of status (draft, published, archived) — used for the instructor dashboard.
export const getMyCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
  res.json(courses);
};

// GET /api/courses/search?q=<query>
// Full-text search over the title and description fields using MongoDB's
// $text operator (backed by the compound text index on the Course schema).
// Only published courses are returned. Limited to 20 results — no pagination
// because search results are expected to be consumed immediately.
export const searchCourses = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Query required' });
  const courses = await Course.find({ $text: { $search: q }, status: 'published' })
    .populate('instructor', 'name avatar')
    .limit(20);
  res.json(courses);
};

import Enrolment from '../models/Enrolment.js';
import Course from '../models/Course.js';
import transporter from '../config/email.js';

// POST /api/enrolments/:courseId  (student)
// Enrols the authenticated student in the specified course.
// Guards:
//   - Course must exist and be published (draft/archived courses are not purchasable).
//   - The unique index on {student, course} prevents double-enrolment at the DB
//     level, but we check first to return a friendly 400 instead of a 500.
// After creating the enrolment record:
//   - The course's totalStudents counter is incremented atomically with $inc.
//   - A confirmation email is fired and forgotten (.catch(() => {})) so a mail
//     failure never blocks the HTTP response.
// paymentRef is a simulated payment token; replace with a real payment gateway
// (e.g. Stripe checkout session id) in production.
export const enrolStudent = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || course.status !== 'published') {
    return res.status(404).json({ message: 'Course not found' });
  }
  const existing = await Enrolment.findOne({ student: req.user._id, course: course._id });
  if (existing) return res.status(400).json({ message: 'Already enrolled' });

  const enrolment = await Enrolment.create({
    student: req.user._id,
    course: course._id,
    paymentRef: `SIM-${Date.now()}`,
  });
  await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });

  // Fire-and-forget confirmation email — errors are swallowed intentionally
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: req.user.email,
    subject: `Enrolled: ${course.title}`,
    text: `Hi ${req.user.name}, you are now enrolled in "${course.title}". Happy learning!`,
  }).catch(() => {});

  res.status(201).json(enrolment);
};

// GET /api/enrolments  (student)
// Returns all enrolment records for the authenticated student, with the
// course's title, thumbnail, instructor ref, and difficulty populated.
// Used to render the student's "My Courses" dashboard.
export const getMyEnrolments = async (req, res) => {
  const enrolments = await Enrolment.find({ student: req.user._id })
    .populate('course', 'title thumbnail instructor difficulty');
  res.json(enrolments);
};

// PATCH /api/enrolments/:courseId/lessons/:lessonId/complete  (student)
// Marks a single lesson as completed for the current student.
// The completedLessons array is treated as a set — we only push the lessonId
// if it is not already present, making this endpoint idempotent.
// Progress is recalculated as a percentage of total lessons each time.
// If progress reaches 100% the completedAt timestamp is set automatically,
// which is the trigger for the certificate generation endpoint.
export const markLessonComplete = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const enrolment = await Enrolment.findOne({ student: req.user._id, course: courseId });
  if (!enrolment) return res.status(404).json({ message: 'Enrolment not found' });

  // Idempotent push — do not add the same lesson twice
  if (!enrolment.completedLessons.includes(lessonId)) {
    enrolment.completedLessons.push(lessonId);
  }
  const course = await Course.findById(courseId);
  enrolment.lastWatched = lessonId;
  enrolment.progressPercent = Math.round(
    (enrolment.completedLessons.length / (course.lessons.length || 1)) * 100
  );
  // Auto-stamp completion date when all lessons are done
  if (enrolment.progressPercent >= 100) enrolment.completedAt = new Date();
  await enrolment.save();
  res.json(enrolment);
};

// GET /api/enrolments/:courseId/progress  (student)
// Returns the full enrolment record for a specific course, giving the client
// access to completedLessons, progressPercent, lastWatched, and certificateUrl.
export const getProgress = async (req, res) => {
  const enrolment = await Enrolment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrolment) return res.status(404).json({ message: 'Enrolment not found' });
  res.json(enrolment);
};

// POST /api/enrolments/:courseId/certificate  (student)
// Issues a completion certificate only when progressPercent === 100.
// Currently generates a placeholder URL; a production implementation would:
//   1. Render an HTML/PDF certificate with the student name and course title.
//   2. Upload the PDF to Cloudinary.
//   3. Store the resulting secure URL on the enrolment document.
// The certificate URL is also persisted so it survives across sessions.
export const generateCertificate = async (req, res) => {
  const enrolment = await Enrolment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrolment) return res.status(404).json({ message: 'Enrolment not found' });
  if (enrolment.progressPercent < 100) {
    return res.status(400).json({ message: 'Course not completed yet' });
  }
  // TODO: generate PDF → upload to Cloudinary → store real URL
  const certificateUrl = `https://eduflow.example.com/certificates/${enrolment._id}`;
  enrolment.certificateUrl = certificateUrl;
  await enrolment.save();
  res.json({ certificateUrl });
};

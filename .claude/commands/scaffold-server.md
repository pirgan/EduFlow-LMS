
---
description: Scaffold the complete Express backend with all models, controllers, routes, email, and RAG pipeline
allowed-tools: Bash, Write
---

You are a backend engineer. Create the full server/ directory structure for a MERN Learning Management System:

1. Run: mkdir server && cd server && npm init -y
2. Run: npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer
         cloudinary multer-storage-cloudinary @anthropic-ai/sdk nodemailer node-cron
3. Run: npm install -D vitest supertest mongodb-memory-server nodemon @vitest/coverage-v8

4. Add to server/package.json scripts:
   "dev": "nodemon src/index.js"
   "start": "node src/index.js"
   "test": "vitest run"
   "test:unit": "vitest run --testPathPattern=unit"
   "test:coverage": "vitest run --coverage"

5. Create all files in this structure:
   server/src/
     config/db.js              — mongoose.connect using process.env.MONGODB_URI
     config/cloudinary.js      — cloudinary v2 config using env vars
     config/anthropic.js       — Anthropic SDK singleton: export { anthropic }
     config/email.js           — Nodemailer transporter using Gmail SMTP
     models/User.js            — name, email, password (bcrypt), role (student/instructor/admin),
                                  avatar (Cloudinary URL), bio, enrolledCourses[{course ref, enrolledAt, progress}],
                                  isActive, timestamps
     models/Course.js          — title, description, category (enum), difficulty (beginner/intermediate/advanced),
                                  price (Number), thumbnail (Cloudinary URL), instructor ref,
                                  lessons[{title, videoUrl, duration, order}],
                                  status (draft/published/archived),
                                  totalStudents, rating{average, count},
                                  aiSummary (cached), $text index on title+description
     models/Enrolment.js       — student ref, course ref, enrolledAt, completedLessons[lesson ids],
                                  progressPercent, completedAt (Date), certificateUrl, lastWatched,
                                  paymentRef (simulated)
     models/Review.js          — course ref, student ref, rating (1-5), comment,
                                  instructorReply, createdAt, updatedAt
     models/ContentChunk.js    — source (course title), section (lesson title),
                                  chunkIndex, content, wordCount, courseId ref, createdAt
     controllers/authController.js
     controllers/courseController.js     — getCourses, getById, createCourse, updateCourse,
                                            archiveCourse, getMyCourses, searchCourses
     controllers/enrolmentController.js  — enrolStudent, getMyEnrolments, markLessonComplete,
                                            getProgress, generateCertificate
     controllers/reviewController.js     — createReview, getCourseReviews, replyToReview
     controllers/aiController.js         — summariseCourse, generateQuiz, recommendCourses,
                                            adaptLearningPath, explainConcept, contentChat
     routes/authRoutes.js
     routes/courseRoutes.js
     routes/enrolmentRoutes.js
     routes/reviewRoutes.js
     routes/aiRoutes.js
     middleware/authMiddleware.js         — JWT protect: sets req.user
     middleware/roleMiddleware.js         — requireRole(...roles): 403 if role not in list
     middleware/rateLimit.js             — express-rate-limit: 10 req/min per user for /api/ai/*
     scripts/ingestContent.js            — reads all published Course documents, extracts lesson
                                            titles and descriptions, chunks into ~500-word blocks,
                                            upserts ContentChunk collection, creates $text index
     index.js                            — Express app, mounts all routes, starts cron jobs
   server/tests/
     unit/
     integration/
   server/.env.example

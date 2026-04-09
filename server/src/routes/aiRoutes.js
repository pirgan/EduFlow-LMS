import { Router } from 'express';
import { summariseCourse, generateQuiz, recommendCourses, adaptLearningPath, explainConcept, contentChat, contentChatStream } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimit } from '../middleware/rateLimit.js';

// Mounted at /api/ai in src/index.js
// All routes require authentication AND are rate-limited to 10 requests/minute
// per user (see middleware/rateLimit.js) to control Anthropic API costs.
const router = Router();
router.use(protect, aiRateLimit);
router.get('/summarise/:courseId', summariseCourse);  // cached Claude course summary
router.get('/quiz/:courseId', generateQuiz);          // 5-question MCQ from course content
router.post('/recommend', recommendCourses);          // personalised course recommendations
router.post('/adapt/:courseId', adaptLearningPath);   // adaptive study plan for weak topics
router.post('/explain', explainConcept);              // plain-language concept explainer
router.post('/chat', contentChat);                    // RAG chatbot grounded in course content
router.post('/content-chat', contentChatStream);      // SSE streaming RAG chatbot with citations
export default router;

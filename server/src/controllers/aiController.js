import { anthropic } from '../config/anthropic.js';
import Course from '../models/Course.js';
import ContentChunk from '../models/ContentChunk.js';

// All handlers in this file call the Anthropic Claude API server-side.
// The SDK singleton is imported from config/anthropic.js.
// All routes are protected by the aiRateLimit middleware (10 req/min per user)
// defined in middleware/rateLimit.js to prevent runaway API costs.

// GET /api/ai/summarise/:courseId  (authenticated)
// Generates a 3-4 sentence marketing-style summary of a course aimed at a
// prospective student. The result is cached in the Course.aiSummary field so
// subsequent requests for the same course return instantly without a Claude call.
// The cache is intentionally never invalidated automatically — if the course
// content changes significantly the instructor should clear aiSummary manually.
export const summariseCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // Return cached summary if it exists — avoids redundant API calls
  if (course.aiSummary) return res.json({ summary: course.aiSummary });

  const lessonText = course.lessons.map((l) => `- ${l.title}`).join('\n');
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Summarise this course in 3-4 sentences for a prospective student.\n\nTitle: ${course.title}\nDescription: ${course.description}\nLessons:\n${lessonText}`,
    }],
  });

  const summary = msg.content[0].text;
  // Persist the summary so future requests are served from the DB
  await Course.findByIdAndUpdate(course._id, { aiSummary: summary });
  res.json({ summary });
};

// GET /api/ai/quiz/:courseId  (authenticated)
// Asks Claude to generate 5 multiple-choice questions based on the course title
// and description. The response is Claude's raw text (expected to be a JSON
// array) — the client is responsible for parsing and rendering the quiz UI.
// Note: quiz questions are not persisted; each request regenerates them.
export const generateQuiz = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate 5 multiple-choice quiz questions (with 4 options each, mark the correct one) for this course. Return JSON array.\n\nTitle: ${course.title}\nDescription: ${course.description}`,
    }],
  });

  res.json({ quiz: msg.content[0].text });
};

// POST /api/ai/recommend  (authenticated)
// Body: { interests: string, completedIds: string[] }
// Fetches up to 30 published courses the student has not already completed,
// passes them along with the student's stated interests to Claude, and asks
// for the top 5 recommendations with a reason for each.
// completedIds allows the client to exclude courses the student has already
// finished so recommendations stay fresh as their library grows.
export const recommendCourses = async (req, res) => {
  const { interests, completedIds = [] } = req.body;
  const courses = await Course.find({ status: 'published', _id: { $nin: completedIds } })
    .select('title description category difficulty')
    .limit(30);

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Student interests: ${interests}\n\nAvailable courses:\n${JSON.stringify(courses)}\n\nRecommend the top 5 courses by returning their _id values as a JSON array with a one-sentence reason for each.`,
    }],
  });

  res.json({ recommendations: msg.content[0].text });
};

// POST /api/ai/adapt/:courseId  (authenticated)
// Body: { progressPercent: number, weakTopics: string }
// Takes the student's current progress and self-reported weak areas and asks
// Claude to produce a tailored study plan for the remaining lessons.
// The lesson titles are extracted from the course document and sent as context
// so Claude can reference them by name in the plan.
export const adaptLearningPath = async (req, res) => {
  const { courseId } = req.params;
  const { progressPercent, weakTopics } = req.body;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `A student is ${progressPercent}% through "${course.title}" and struggles with: ${weakTopics}.\nSuggest an adapted study plan for the remaining lessons: ${JSON.stringify(course.lessons.map((l) => l.title))}.`,
    }],
  });

  res.json({ plan: msg.content[0].text });
};

// POST /api/ai/explain  (authenticated)
// Body: { concept: string, context?: string }
// General-purpose concept explainer. The optional context field lets the client
// scope the explanation to the course the student is currently viewing
// (e.g. "in the context of: React hooks") without requiring a courseId lookup.
export const explainConcept = async (req, res) => {
  const { concept, context } = req.body;
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Explain "${concept}" simply${context ? ` in the context of: ${context}` : ''}.`,
    }],
  });
  res.json({ explanation: msg.content[0].text });
};

// POST /api/ai/chat  (authenticated)
// Body: { question: string, courseId?: string }
// RAG (Retrieval-Augmented Generation) chatbot grounded in actual course content.
//
// Pipeline:
//   1. RETRIEVE — Run a MongoDB $text search against the ContentChunk collection
//      (populated by scripts/ingestContent.js). Chunks are scored by relevance
//      and the top 5 are selected. If courseId is supplied the search is scoped
//      to that course only, making answers more precise when a student is inside
//      a specific course.
//   2. AUGMENT  — The retrieved chunks are formatted into a context block that
//      labels each passage with its source course and lesson section, giving
//      Claude clear provenance to cite.
//   3. GENERATE — Claude is instructed (via the system prompt) to answer using
//      only the provided content and to admit uncertainty rather than hallucinate.
//
// The response includes a sources array so the client can show "Answer based on:
// [course title — lesson name]" attribution beneath the chatbot reply.
export const contentChat = async (req, res) => {
  const { question, courseId } = req.body;

  // Step 1: retrieve the most relevant content chunks via full-text search
  const chunks = await ContentChunk.find(
    { $text: { $search: question }, ...(courseId ? { courseId } : {}) },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(5);

  // Step 2: format chunks into a labelled context block for the prompt
  const context = chunks.map((c) => `[${c.source} — ${c.section}]\n${c.content}`).join('\n\n---\n\n');

  // Step 3: ask Claude to answer using only the retrieved context
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 768,
    system: 'You are a helpful tutor. Answer using only the provided course content. If unsure, say so.',
    messages: [{
      role: 'user',
      content: `Course content:\n${context || 'No relevant content found.'}\n\nQuestion: ${question}`,
    }],
  });

  res.json({ answer: msg.content[0].text, sources: chunks.map((c) => ({ source: c.source, section: c.section })) });
};

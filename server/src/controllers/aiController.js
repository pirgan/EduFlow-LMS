import mongoose from 'mongoose';
import { anthropic } from '../config/anthropic.js';
import Course from '../models/Course.js';
import ContentChunk from '../models/ContentChunk.js';
import Review from '../models/Review.js';

// All handlers in this file call the Anthropic Claude API server-side.
// The SDK singleton is imported from config/anthropic.js.
// All routes are protected by the aiRateLimit middleware (10 req/min per user)
// defined in middleware/rateLimit.js to prevent runaway API costs.

// GET /api/ai/summarise/:courseId  (authenticated)
// Generates a 3-4 sentence summary of a course for prospective students.
// Incorporates student review comments (up to 5) so the summary reflects real
// learner feedback alongside the course content.
// The result is cached in Course.aiSummary. Pass ?regenerate=1 to bust the
// cache and re-generate with the latest reviews.
export const summariseCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // Serve from cache unless the caller explicitly asks for a fresh generation
  if (course.aiSummary && req.query.regenerate !== '1') {
    return res.json({ summary: course.aiSummary, reviewCount: course.rating?.count || 0 });
  }

  const lessonText = course.lessons.map((l) => `- ${l.title}`).join('\n');

  // Pull up to 5 reviews to enrich the summary with student perspectives
  const reviews = await Review.find({ course: course._id })
    .sort('-createdAt')
    .limit(5)
    .select('rating comment');

  const reviewBlock = reviews.length
    ? '\n\nStudent Reviews:\n' + reviews.map((r) => `- (${r.rating}/5) "${r.comment}"`).join('\n')
    : '';

  const prompt = `Summarise this course in 3-4 sentences for a prospective student.${
    reviews.length ? ' Weave in insights from the student reviews to give an honest, balanced view.' : ''
  }\n\nTitle: ${course.title}\nDescription: ${course.description}\nLessons:\n${lessonText}${reviewBlock}`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const summary = msg.content[0].text;
  await Course.findByIdAndUpdate(course._id, { aiSummary: summary });
  res.json({ summary, reviewCount: reviews.length });
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

// POST /api/ai/content-chat  (authenticated, SSE streaming)
// Body: { query: string, courseId: string | null, history: [{role, content}] }
//
// Three-step RAG pipeline with streaming output:
//   1. Keyword extraction via Haiku (non-streaming) — pulls 3-6 search terms from the query.
//   2. MongoDB $text search against ContentChunk collection using those keywords.
//   3. Answer synthesis via Sonnet (streaming) — grounded in the retrieved chunks,
//      with [Lesson: <title>] citations. Sources are extracted from the full response
//      and sent as a final SSE event before [DONE].
export const contentChatStream = async (req, res) => {
  const { query, courseId, history = [] } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'query is required' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Step 1 — Keyword extraction (Haiku, non-streaming)
  let keywords;
  try {
    const kwMsg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      system: 'Return ONLY a JSON array of 3-6 search keywords. No prose. Example: ["react","hooks","useState"]',
      messages: [{ role: 'user', content: `Extract search keywords from: "${query}"` }],
    });
    keywords = JSON.parse(kwMsg.content[0].text);
    if (!Array.isArray(keywords)) throw new Error('not array');
  } catch {
    keywords = query.trim().split(/\s+/);
  }

  // Step 2 — Chunk retrieval via $text search
  const textQuery = { $text: { $search: keywords.join(' ') } };
  if (courseId) textQuery.courseId = new mongoose.Types.ObjectId(courseId);

  const chunks = await ContentChunk.find(textQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

  if (!chunks.length) {
    res.write(`data: ${JSON.stringify({ chunk: "I couldn't find relevant information in the course content for that question. Try rephrasing, or check the lesson list for the topic." })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  // Step 3 — Answer synthesis (Sonnet, streaming)
  const contextBlock = chunks
    .map((c) => `[Source: ${c.source} | Lesson: ${c.section}]\n${c.content}`)
    .join('\n\n---\n\n');

  const messages = [
    ...history,
    { role: 'user', content: `${query}\n\nCourse Content:\n${contextBlock}` },
  ];

  let fullResponse = '';
  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are EduFlow's course assistant. Answer student questions ONLY using the provided course content excerpts. Always cite which lesson your answer comes from using [Lesson: <title>] notation. If the answer is not in the content, say so clearly and suggest the student check the lesson directly. Be encouraging and educational.`,
    messages,
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const delta = event.delta.text;
      fullResponse += delta;
      res.write(`data: ${JSON.stringify({ chunk: delta })}\n\n`);
    }
  }

  // Extract and deduplicate [Lesson: <title>] citations
  const citationRegex = /\[Lesson:\s*([^\]]+)\]/g;
  const seen = new Set();
  const citedLessons = [];
  for (const match of fullResponse.matchAll(citationRegex)) {
    const lessonTitle = match[1].trim();
    if (!seen.has(lessonTitle)) {
      seen.add(lessonTitle);
      const chunk = chunks.find((c) => c.section === lessonTitle);
      citedLessons.push({ lessonTitle, courseTitle: chunk?.source ?? '' });
    }
  }

  res.write(`data: ${JSON.stringify({ sources: citedLessons })}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
};

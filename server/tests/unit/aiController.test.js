import { describe, it, expect, vi, beforeEach } from 'vitest';

// IMPORTANT: Always mock @anthropic-ai/sdk — never call the real API in tests.
vi.mock('../../src/models/Course.js');
vi.mock('../../src/models/ContentChunk.js');
vi.mock('../../src/config/anthropic.js', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { summariseCourse, generateQuiz, contentChat } from '../../src/controllers/aiController.js';
import Course from '../../src/models/Course.js';
import ContentChunk from '../../src/models/ContentChunk.js';
import { anthropic } from '../../src/config/anthropic.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = 'test';
});

// ─── summariseCourse ──────────────────────────────────────────────────────────

describe('summariseCourse', () => {
  it('returns cached aiSummary without calling Anthropic (cache hit)', async () => {
    const fakeCourse = {
      _id: 'c1',
      title: 'React 101',
      aiSummary: 'This course teaches React fundamentals.',
      lessons: [],
    };
    Course.findById.mockResolvedValue(fakeCourse);

    const req = { params: { courseId: 'c1' } };
    const res = mockRes();
    await summariseCourse(req, res);

    expect(anthropic.messages.create).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ summary: 'This course teaches React fundamentals.' });
  });

  it('calls Anthropic, saves the result, and returns it (cache miss)', async () => {
    const fakeCourse = {
      _id: 'c1',
      title: 'React 101',
      description: 'Learn React from scratch.',
      aiSummary: null,
      lessons: [{ title: 'Intro' }, { title: 'Hooks' }],
    };
    Course.findById.mockResolvedValue(fakeCourse);
    Course.findByIdAndUpdate.mockResolvedValue(fakeCourse);
    anthropic.messages.create.mockResolvedValue({
      content: [{ text: 'A fresh AI summary.' }],
    });

    const req = { params: { courseId: 'c1' } };
    const res = mockRes();
    await summariseCourse(req, res);

    expect(anthropic.messages.create).toHaveBeenCalledOnce();
    const callArgs = anthropic.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-haiku-4-5-20251001');
    expect(callArgs.messages[0].content).toContain('React 101');

    expect(Course.findByIdAndUpdate).toHaveBeenCalledWith('c1', { aiSummary: 'A fresh AI summary.' });
    expect(res.json).toHaveBeenCalledWith({ summary: 'A fresh AI summary.' });
  });

  it('returns 404 when the course does not exist', async () => {
    Course.findById.mockResolvedValue(null);

    const req = { params: { courseId: 'ghost' } };
    const res = mockRes();
    await summariseCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Course not found' });
    expect(anthropic.messages.create).not.toHaveBeenCalled();
  });
});

// ─── generateQuiz ─────────────────────────────────────────────────────────────

describe('generateQuiz', () => {
  it('calls Anthropic with course content and returns the raw quiz text', async () => {
    const fakeCourse = { _id: 'c2', title: 'Node.js Deep Dive', description: 'Advanced Node concepts.' };
    Course.findById.mockResolvedValue(fakeCourse);
    anthropic.messages.create.mockResolvedValue({
      content: [{ text: '[{"question":"Q1","options":["A","B","C","D"],"answer":"A"}]' }],
    });

    const req = { params: { courseId: 'c2' } };
    const res = mockRes();
    await generateQuiz(req, res);

    expect(anthropic.messages.create).toHaveBeenCalledOnce();
    const callArgs = anthropic.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-haiku-4-5-20251001');
    expect(callArgs.messages[0].content).toContain('Node.js Deep Dive');
    expect(callArgs.messages[0].content).toContain('JSON array');

    const payload = res.json.mock.calls[0][0];
    expect(payload.quiz).toBeDefined();
  });

  it('returns 404 when the course is not found', async () => {
    Course.findById.mockResolvedValue(null);

    const req = { params: { courseId: 'ghost' } };
    const res = mockRes();
    await generateQuiz(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(anthropic.messages.create).not.toHaveBeenCalled();
  });
});

// ─── contentChat ──────────────────────────────────────────────────────────────

describe('contentChat', () => {
  it('retrieves content chunks via $text search and calls Anthropic for an answer', async () => {
    const fakeChunks = [
      { source: 'React 101', section: 'Hooks', content: 'useState is a hook...' },
      { source: 'React 101', section: 'Effects', content: 'useEffect runs after render...' },
    ];

    // Mock the ContentChunk.find() chaining: .find(...).sort(...).limit(...)
    ContentChunk.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(fakeChunks),
      }),
    });

    anthropic.messages.create.mockResolvedValue({
      content: [{ text: 'useState lets you add state to functional components.' }],
    });

    const req = { body: { question: 'What is useState?', courseId: 'c1' } };
    const res = mockRes();
    await contentChat(req, res);

    expect(ContentChunk.find).toHaveBeenCalledWith(
      expect.objectContaining({ $text: { $search: 'What is useState?' }, courseId: 'c1' }),
      expect.any(Object),
    );
    expect(anthropic.messages.create).toHaveBeenCalledOnce();

    const payload = res.json.mock.calls[0][0];
    expect(payload.answer).toBe('useState lets you add state to functional components.');
    expect(payload.sources).toHaveLength(2);
    expect(payload.sources[0]).toEqual({ source: 'React 101', section: 'Hooks' });
  });

  it('passes all retrieved chunks as context to Anthropic', async () => {
    const fakeChunks = [
      { source: 'JS Basics', section: 'Variables', content: 'let and const...' },
    ];
    ContentChunk.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(fakeChunks),
      }),
    });
    anthropic.messages.create.mockResolvedValue({
      content: [{ text: 'Variables are containers for values.' }],
    });

    const req = { body: { question: 'What are variables?', courseId: null } };
    const res = mockRes();
    await contentChat(req, res);

    const callArgs = anthropic.messages.create.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('let and const');
    expect(callArgs.messages[0].content).toContain('What are variables?');
  });

  it('falls back to "No relevant content found." when no chunks match', async () => {
    ContentChunk.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
    });
    anthropic.messages.create.mockResolvedValue({
      content: [{ text: "I'm not sure about that." }],
    });

    const req = { body: { question: 'something obscure' } };
    const res = mockRes();
    await contentChat(req, res);

    const callArgs = anthropic.messages.create.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('No relevant content found.');
  });
});

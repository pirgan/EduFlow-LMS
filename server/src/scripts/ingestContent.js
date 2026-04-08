// RAG ingestion pipeline — run once after seeding, and again whenever course
// content changes: node src/scripts/ingestContent.js
//
// What it does:
//   1. Fetches all published courses from MongoDB.
//   2. For each course, deletes its existing ContentChunk documents (full refresh).
//   3. Splits the course description and each lesson's text into ~500-word chunks.
//   4. Saves each chunk as a ContentChunk document with source/section metadata.
//
// The resulting ContentChunk collection is searched by aiController.contentChat
// using MongoDB $text to retrieve relevant passages before sending them to Claude.

import 'dotenv/config';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';
import ContentChunk from '../models/ContentChunk.js';

// Splits a string into an array of word-count-bounded chunks.
// Default is 500 words — large enough to give Claude useful context,
// small enough to stay well within token limits when 5 chunks are combined.
const chunkText = (text, maxWords = 500) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
};

const ingest = async () => {
  await connectDB();
  const courses = await Course.find({ status: 'published' });
  console.log(`Ingesting ${courses.length} published courses...`);

  for (const course of courses) {
    // Full refresh: delete old chunks before re-inserting so stale content
    // does not persist after a course description or lesson list is updated.
    await ContentChunk.deleteMany({ courseId: course._id });

    // Chunk the top-level course description under a synthetic "Course Overview" section
    const descChunks = chunkText(course.description);
    for (let i = 0; i < descChunks.length; i++) {
      await ContentChunk.create({
        source: course.title,
        section: 'Course Overview',
        chunkIndex: i,
        content: descChunks[i],
        wordCount: descChunks[i].split(/\s+/).length,
        courseId: course._id,
      });
    }

    // Chunk each lesson's title + description (if any).
    // Lesson descriptions are optional in this schema so we skip empty strings.
    for (const lesson of course.lessons) {
      const text = `${lesson.title}. ${lesson.description || ''}`.trim();
      if (!text) continue;
      const lessonChunks = chunkText(text);
      for (let i = 0; i < lessonChunks.length; i++) {
        await ContentChunk.create({
          source: course.title,
          section: lesson.title,
          chunkIndex: i,
          content: lessonChunks[i],
          wordCount: lessonChunks[i].split(/\s+/).length,
          courseId: course._id,
        });
      }
    }
    console.log(`  ✓ ${course.title}`);
  }

  console.log('Ingest complete.');
  process.exit(0);
};

ingest().catch((err) => { console.error(err); process.exit(1); });

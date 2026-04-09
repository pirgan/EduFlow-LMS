import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import ContentChunk from '../models/ContentChunk.js';

// Split text at paragraph boundaries when over 500 words; otherwise return as-is.
const splitChunks = (text, maxWords = 500) => {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return [text];

  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  const chunks = [];
  let current = [];
  let count = 0;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).length;
    if (count + paraWords > maxWords && current.length) {
      chunks.push(current.join('\n\n'));
      current = [];
      count = 0;
    }
    current.push(para);
    count += paraWords;
  }
  if (current.length) chunks.push(current.join('\n\n'));
  return chunks.length ? chunks : [text];
};

const ingest = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const courses = await Course.find({ status: 'published' });
  let totalChunks = 0;

  for (const course of courses) {
    for (const lesson of course.lessons) {
      const text = [lesson.title, lesson.description].filter(Boolean).join(' ');
      if (!text.trim()) continue;

      const chunks = splitChunks(text);
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        await ContentChunk.updateOne(
          { courseId: course._id, section: lesson.title, chunkIndex: i },
          {
            $set: {
              source: course.title,
              section: lesson.title,
              chunkIndex: i,
              content: chunkText,
              wordCount: chunkText.split(/\s+/).length,
              courseId: course._id,
            },
          },
          { upsert: true }
        );
        totalChunks++;
      }
    }
  }

  console.log(`Ingested ${totalChunks} chunks from ${courses.length} courses.`);
  await mongoose.disconnect();
  process.exit(0);
};

ingest().catch((err) => { console.error(err); process.exit(1); });

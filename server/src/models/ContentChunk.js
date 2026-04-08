import mongoose from 'mongoose';

// The RAG store. Each document holds a ~500-word chunk of course content
// produced by scripts/ingestContent.js. The $text index on content/source/section
// powers the MongoDB full-text retrieval step in aiController.contentChat.
const contentChunkSchema = new mongoose.Schema({
  source: { type: String, required: true },    // course title — used for attribution
  section: { type: String, required: true },   // lesson title — used for attribution
  chunkIndex: { type: Number, required: true }, // position within the lesson's chunks
  content: { type: String, required: true },   // raw text chunk sent to Claude as context
  wordCount: { type: Number, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound text index used by the $text search in aiController.contentChat.
// Re-running ingestContent.js drops and recreates all chunks for updated courses.
contentChunkSchema.index({ content: 'text', source: 'text', section: 'text' });

const ContentChunk = mongoose.model('ContentChunk', contentChunkSchema);
export default ContentChunk;

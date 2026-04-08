// Vercel serverless entry point — lives inside the server package so
// esbuild resolves all imports from server/node_modules/ correctly.
import connectDB from './src/config/db.js';
import app from './src/app.js';

let dbConnected = false;

export default async function handler(req, res) {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    return app(req, res);
  } catch (err) {
    console.error('[Vercel handler error]', err.message);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

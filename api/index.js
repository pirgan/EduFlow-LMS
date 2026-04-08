import 'dotenv/config';
import connectDB from '../server/src/config/db.js';
import app from '../server/src/app.js';

// Reuse the DB connection across warm invocations
let dbConnected = false;

export default async function handler(req, res) {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  return app(req, res);
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrolmentRoutes from './routes/enrolmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import transporter from './config/email.js';
import User from './models/User.js';
import Enrolment from './models/Enrolment.js';

await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrolments', enrolmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Weekly digest cron — every Monday 08:00
cron.schedule('0 8 * * 1', async () => {
  try {
    const students = await User.find({ role: 'student', isActive: true }).select('email name');
    for (const student of students) {
      const count = await Enrolment.countDocuments({ student: student._id });
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Your weekly EduFlow digest',
        text: `Hi ${student.name}, you are enrolled in ${count} course(s). Keep learning!`,
      }).catch(() => {});
    }
    console.log('Weekly digest sent');
  } catch (e) {
    console.error('Digest cron error:', e);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

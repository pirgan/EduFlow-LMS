import 'dotenv/config';
import cron from 'node-cron';
import connectDB from './config/db.js';
import app from './app.js';
import transporter from './config/email.js';
import User from './models/User.js';
import Enrolment from './models/Enrolment.js';

await connectDB();

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

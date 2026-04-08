import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Embedded sub-document tracking a student's high-level progress per course.
// _id is disabled because this is a value object, not an independently queryable entity.
const enrolledCourseSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // select:false keeps password out of every query by default.
  // Use .select('+password') only when you need to verify credentials.
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },  // Cloudinary URL
  bio: { type: String, default: '' },
  enrolledCourses: [enrolledCourseSchema],
  isActive: { type: Boolean, default: true },  // soft-disable without deleting the account
}, { timestamps: true });

// Hash password before insert or update. The isModified guard prevents
// re-hashing on unrelated saves (e.g. updating bio).
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method used by authController.login to verify the supplied password.
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

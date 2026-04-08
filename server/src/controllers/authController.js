import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Creates a signed JWT containing the user's MongoDB _id.
// The token is sent to the client and must be included in the
// Authorization header as "Bearer <token>" on every protected request.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
// Creates a new user account. Accepts name, email, password, and an optional
// role (defaults to 'student' at the model level). Rejects duplicate emails.
// Password hashing is handled by the pre-save hook on the User model.
// Returns the JWT and a safe user payload (no password field).
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// POST /api/auth/login
// Authenticates an existing user. We must explicitly opt-in to the password
// field with .select('+password') because it is excluded by default (select:false
// on the schema). matchPassword() uses bcrypt.compare internally.
// Returns the same JWT + user payload shape as register.
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// GET /api/auth/me  (protected)
// Returns the full user document for the currently authenticated user.
// req.user is populated by the protect middleware after JWT verification —
// no database hit needed here because the middleware already fetched the user.
export const getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/me  (protected)
// Allows a user to update their display name, bio, and avatar URL.
// { new: true } returns the updated document rather than the pre-update version.
// Password changes are intentionally not handled here to keep the surface small.
export const updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, bio, avatar }, { new: true });
  res.json(user);
};

import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Mounted at /api/auth in src/index.js
const router = Router();
router.post('/register', register);           // public  — create account
router.post('/login', login);                 // public  — get JWT
router.get('/me', protect, getMe);            // private — fetch own profile
router.put('/me', protect, updateProfile);    // private — update name/bio/avatar
export default router;

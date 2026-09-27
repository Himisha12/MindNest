import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  verifyEmail,
  resendVerificationCode
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-verification', protect, resendVerificationCode);

export default router;

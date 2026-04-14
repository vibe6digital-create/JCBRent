import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  sendOtp, verifyOtp,
  createOrUpdateUser, getProfile, updateOnlineStatus,
} from '../controllers/auth.controller';

const router = Router();

// Public — phone OTP flow for web
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Authenticated
router.post('/register', authenticate, createOrUpdateUser);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, createOrUpdateUser);
router.patch('/profile', authenticate, createOrUpdateUser);
router.patch('/online-status', authenticate, authorize('vendor'), updateOnlineStatus);

export default router;

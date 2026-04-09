import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createOrUpdateUser, getProfile, updateOnlineStatus } from '../controllers/auth.controller';

const router = Router();

router.post('/register', authenticate, createOrUpdateUser);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, createOrUpdateUser);
router.patch('/online-status', authenticate, authorize('vendor'), updateOnlineStatus);

export default router;

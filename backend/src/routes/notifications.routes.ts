import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notifications.controller';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markNotificationRead);
router.patch('/read-all', authenticate, markAllRead);

export default router;

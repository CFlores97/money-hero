import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { listNotifications, markAsRead, markAllAsRead } from './notifications.controller.js';

const router = Router();

router.get('/', authMiddleware, listNotifications);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;

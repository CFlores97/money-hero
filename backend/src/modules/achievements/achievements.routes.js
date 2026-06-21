import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { getAchievements } from './achievements.controller.js';

const router = Router();

router.get('/', authMiddleware, getAchievements);

export default router;
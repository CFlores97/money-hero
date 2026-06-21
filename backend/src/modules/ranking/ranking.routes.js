import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  getGlobalRanking,
  getFriendsRanking
} from './ranking.controller.js';

const router = Router();

router.get('/global', authMiddleware, getGlobalRanking);
router.get('/friends', authMiddleware, getFriendsRanking);

export default router;
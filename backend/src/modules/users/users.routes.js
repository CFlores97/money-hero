import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateProfileSchema } from './users.validators.js';
import { getMe, updateMe } from './users.controller.js';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, validate(updateProfileSchema), updateMe);

export default router;

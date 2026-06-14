import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

import {
  createGoalSchema,
  updateGoalProgressSchema
} from './goals.validators.js';

import {
  createGoal,
  updateGoalProgress
} from './goals.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  validate(createGoalSchema),
  createGoal
);

router.patch(
  '/:id/progress',
  authMiddleware,
  validate(updateGoalProgressSchema),
  updateGoalProgress
);

export default router;
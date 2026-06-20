import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createGoalSchema, updateGoalProgressSchema } from './goals.validators.js';
import { createGoal, deleteGoal, listGoals, updateGoalProgress } from './goals.controller.js';

const router = Router();

router.post('/', authMiddleware, validate(createGoalSchema), createGoal);
router.get('/', authMiddleware, listGoals);
router.delete('/:id', authMiddleware, deleteGoal);
router.patch('/:id/progress', authMiddleware, validate(updateGoalProgressSchema), updateGoalProgress);

export default router;

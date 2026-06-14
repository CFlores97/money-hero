import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

import { createBudgetSchema } from './budgets.validators.js';
import { createBudget } from './budgets.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  validate(createBudgetSchema),
  createBudget
);

export default router;
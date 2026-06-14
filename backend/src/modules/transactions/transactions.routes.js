import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

import { createTransactionSchema } from './transactions.validators.js';
import { createTransaction } from './transactions.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  validate(createTransactionSchema),
  createTransaction
);

export default router;
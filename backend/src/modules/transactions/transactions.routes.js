import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createTransactionSchema } from './transactions.validators.js';
import {
  createTransaction,
  listTransactions,
  deleteTransaction
} from './transactions.controller.js';

const router = Router();

router.post('/', authMiddleware, validate(createTransactionSchema), createTransaction);
router.get('/', authMiddleware, listTransactions);
router.delete('/:id', authMiddleware, deleteTransaction);

export default router;

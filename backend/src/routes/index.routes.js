import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import categoryRoutes from '../modules/categories/categories.routes.js';
import transactionRoutes from '../modules/transactions/transactions.routes.js';
import budgetRoutes from '../modules/budgets/budgets.routes.js';
import goalRoutes from '../modules/goals/goals.routes.js';
import notificationRoutes from '../modules/notifications/notifications.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/notifications', notificationRoutes);

export default router;

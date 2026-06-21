import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import categoryRoutes from '../modules/categories/categories.routes.js';
import transactionRoutes from '../modules/transactions/transactions.routes.js';
import budgetRoutes from '../modules/budgets/budgets.routes.js';
import goalRoutes from '../modules/goals/goals.routes.js';
import gamificationRoutes from '../modules/gamification/gamification.routes.js'
import missionRoutes from '../modules/missions/missions.routes.js'


const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/gamification', goalRoutes);
router.use('/missions', missionRoutes);

export default router;
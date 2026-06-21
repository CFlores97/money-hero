import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";

import {
  completeMission,
  getMissions
} from "./missions.controller.js";

const router = Router();

router.get('/', authMiddleware, getMissions);
router.post('/:id/complete', authMiddleware, completeMission);

export default router;

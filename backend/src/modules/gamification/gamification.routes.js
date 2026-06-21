import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getProgress } from "./gamification.controller.js";

const router = Router();

router.get('/progress', authMiddleware, getProgress);

export default router;
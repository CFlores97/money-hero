import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";

import { getMissions } from "./missions.service.js";

const router = Router();

router.get('/', authMiddleware, getMissions);

export default router;
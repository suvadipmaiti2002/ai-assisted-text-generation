import { Router } from "express";
import { handleClassify } from "../controllers/classify.controller.js";
import { validateBody, classifySchema } from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @route   POST /api/v1/classify
 * @desc    Classifies input text into Complaint, Query, Feedback, or Other
 * @access  Public
 */
router.post("/", validateBody(classifySchema), handleClassify);

export default router;

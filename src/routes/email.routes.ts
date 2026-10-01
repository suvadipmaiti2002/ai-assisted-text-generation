import { Router } from "express";
import { handleGenerateEmail } from "../controllers/email.controller.js";
import { validateBody, emailGenerateSchema } from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @route   POST /api/v1/email/generate
 * @desc    Generates customer-friendly email template based on purpose, recipient_name, and tone
 * @access  Public
 */
router.post("/generate", validateBody(emailGenerateSchema), handleGenerateEmail);

export default router;

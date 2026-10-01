import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const classifySchema = z.object({
  text: z
    .string({ required_error: "Field 'text' is required" })
    .trim()
    .min(1, "Field 'text' cannot be empty")
    .max(5000, "Field 'text' exceeds maximum length of 5000 characters"),
});

export const emailGenerateSchema = z.object({
  purpose: z
    .string({ required_error: "Field 'purpose' is required" })
    .trim()
    .min(1, "Field 'purpose' cannot be empty")
    .max(1000, "Field 'purpose' is too long"),
  recipient_name: z
    .string({ required_error: "Field 'recipient_name' is required" })
    .trim()
    .min(1, "Field 'recipient_name' cannot be empty")
    .max(200, "Field 'recipient_name' is too long"),
  tone: z
    .string({ required_error: "Field 'tone' is required" })
    .trim()
    .min(1, "Field 'tone' cannot be empty")
    .max(100, "Field 'tone' is too long"),
});

export function validateBody(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: issues,
        });
        return;
      }
      next(error);
    }
  };
}

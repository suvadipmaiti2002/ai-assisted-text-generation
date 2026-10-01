import { Request, Response, NextFunction } from "express";
import { generateEmailTemplate } from "../services/email.service.js";

export async function handleGenerateEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { purpose, recipient_name, tone } = req.body;
    const result = await generateEmailTemplate({
      purpose,
      recipient_name,
      tone,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

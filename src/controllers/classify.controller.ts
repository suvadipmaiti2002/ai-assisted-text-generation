import { Request, Response, NextFunction } from "express";
import { classifyText } from "../services/classify.service.js";

export async function handleClassify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text } = req.body;
    const result = await classifyText(text);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

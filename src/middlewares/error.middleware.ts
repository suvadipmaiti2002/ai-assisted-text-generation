import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || (err.status && typeof err.status === "number" ? err.status : 500);

  res.status(statusCode).json({
    status: "error",
    message: err.message || "An internal server error occurred.",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

import express, { Express } from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export function createApp(): Express {
  const app = express();

  // middleware to enable CORS and parse JSON and URL-encoded data
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for visibility
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // API routes
  app.use("/api/v1", apiRouter);

  // Handle 404 errors for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global error handling middleware
  app.use(errorHandler);

  return app;
}

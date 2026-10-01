import { Router } from "express";
import classifyRouter from "./classify.routes.js";
import emailRouter from "./email.routes.js";

const apiRouter = Router();

apiRouter.use("/classify", classifyRouter);
apiRouter.use("/email", emailRouter);

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;

import { createApp } from "./app.js";
import { env, validateEnv } from "./config/env.js";

validateEnv();

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
  console.log(`Configured models: ${env.GEMINI_MODELS.join(", ")}`);
});

process.on("SIGINT", () => {
  console.log("\nGracefully shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

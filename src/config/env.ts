import dotenv from "dotenv";

dotenv.config();

const rawModels = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: rawModels, // Original raw string for compatibility
  GEMINI_MODELS: rawModels
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0),
};

export function validateEnv(): void {
  if (!env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in the environment variables.");
    process.exit(1);
  }
}


import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

let aiInstance: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please set it in your .env file."
      );
    }
    aiInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export interface GenerateContentOptions {
  contents: string;
  config?: any;
}

export interface GenerateContentResult {
  text: string;
  modelUsed: string;
}

/**
 * Checks whether an error from the Google GenAI API is retryable / transient.
 * Typical retryable errors:
 * - 429 Too Many Requests (Rate limits / Quota exhausted)
 * - 503 Service Unavailable (Model overloaded)
 * - 500 / 502 / 504 Transient server issues
 */
function isRetryableError(error: any): boolean {
  const status = error?.status || error?.statusCode || error?.response?.status;
  if ([429, 500, 502, 503, 504].includes(status)) return true;

  const message = (error?.message || "").toLowerCase();
  const retryablePhrases = [
    "rate limit",
    "quota",
    "resource_exhausted",
    "overloaded",
    "unavailable",
    "timeout",
    "429",
    "503",
    "temporarily unavailable",
    "deadline exceeded",
  ];

  return retryablePhrases.some((phrase) => message.includes(phrase));
}

/**
 * Calls Gemini models with automatic fallback across the configured models.
 * If the primary model encounters a retryable or capacity error, it seamlessly
 * switches to the next fallback model in the list.
 */
export async function generateContentWithFallback(
  options: GenerateContentOptions
): Promise<GenerateContentResult> {
  const ai = getAIClient();
  const models = env.GEMINI_MODELS;

  if (models.length === 0) {
    throw new Error("No Gemini models configured in GEMINI_MODEL.");
  }

  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      console.log(
        `[AI Request] Attempting generation with model: '${currentModel}' (Attempt ${i + 1}/${models.length})`
      );

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: options.contents,
        config: options.config,
      });

      return {
        text: response.text?.trim() || "",
        modelUsed: currentModel,
      };
    } catch (error: any) {
      lastError = error;
      const retryable = isRetryableError(error);
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      console.warn(
        `[AI Warning] Model '${currentModel}' failed (retryable: ${retryable}): ${error.message || error}`
      );

      if (!retryable || i === models.length - 1) {
        break;
      }

      console.log(
        `[AI Fallback] Retrying with next model in chain: '${models[i + 1]}'...`
      );
    }
  }

  throw new Error(
    `All configured Gemini models failed. Last error from '${models[models.length - 1]}': ${lastError?.message || lastError}`
  );
}

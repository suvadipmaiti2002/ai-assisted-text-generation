import { generateContentWithFallback } from "./ai.service.js";
import {
  ClassificationCategory,
  ClassifyResponse,
} from "../types/classify.types.js";

const VALID_CATEGORIES: ClassificationCategory[] = [
  "Complaint",
  "Query",
  "Feedback",
  "Other",
];

export async function classifyText(text: string): Promise<ClassifyResponse> {
  const prompt = `
You are an expert customer text classification system. Analyze the given text and classify it into exactly one of the following categories:
- Complaint: The customer is expressing dissatisfaction, reporting a defect, problem, or delay.
- Query: The customer is asking a question, seeking information, or requesting assistance.
- Feedback: The customer is sharing their opinion, praise, suggestions, or general impressions.
- Other: Text that does not cleanly fit the above categories, or is generic/unrelated.

Calculate a confidence score between 0.00 and 1.00 indicating how certain you are in this classification based on linguistic cues.

Input text:
"${text}"

You MUST respond strictly with valid JSON.
`;

  const { text: responseText, modelUsed } = await generateContentWithFallback({
    contents: prompt.trim(),
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: VALID_CATEGORIES,
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
          },
          explanation: {
            type: "string",
          },
        },
        required: ["category", "confidence", "explanation"],
      },
    },
  });

  try {
    const parsed = JSON.parse(responseText);

    let category: ClassificationCategory = "Other";
    const matchedCategory = VALID_CATEGORIES.find(
      (c) => c.toLowerCase() === (parsed.category || "").toLowerCase()
    );
    if (matchedCategory) {
      category = matchedCategory;
    }

    // Ensure confidence is a number between 0 and 1
    let confidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0.85;
    confidence = Math.max(0, Math.min(1, Math.round(confidence * 100) / 100));
    
    console.log(
      `[AI Call Completed] Text classified as '${category}' with confidence ${confidence} using model '${modelUsed}'`
    );

    return {
      category,
      confidence,
      explanation:
        parsed.explanation ||
        `Classified as ${category} based on semantic analysis.`,
      model_used: modelUsed,
    };
  } catch {
    // If parsing fails, return a default response indicating an error in classification
    return {
      category: "Other",
      confidence: 0.5,
      explanation: "Unable to parse model output into structured JSON format.",
      model_used: modelUsed,
    };
  }
}

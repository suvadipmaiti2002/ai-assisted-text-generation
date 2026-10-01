import { generateContentWithFallback } from "./ai.service.js";
import {
  EmailGenerateRequest,
  EmailGenerateResponse,
} from "../types/email.types.js";

export async function generateEmailTemplate(
  data: EmailGenerateRequest
): Promise<EmailGenerateResponse> {
  const { purpose, recipient_name, tone } = data;

  const prompt = `
You are an expert communication assistant. Generate a short, customer-friendly email template based on the following specifications:
- Recipient Name: "${recipient_name}"
- Email Purpose: "${purpose}"
- Desired Tone: "${tone}" (e.g. professional, empathetic, friendly, apologetic, urgent)

Guidelines:
1. Provide an engaging, clear Subject line.
2. Provide a well-structured body containing an appropriate greeting for ${recipient_name}, concise and customer-focused message body, and a courteous sign-off.
3. Keep the email short and customer-friendly.

You MUST respond strictly with valid JSON.
`;

  const startTime = Date.now();
  console.log(
    `[AI Call Started] Generating email template for '${recipient_name}' at ${new Date(startTime).toISOString()}`
  );

  const { text: responseText, modelUsed } = await generateContentWithFallback({
    contents: prompt.trim(),
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
        },
        required: ["subject", "body"],
      },
    },
  });

  const endTime = Date.now();
  const executionTimeMs = endTime - startTime;
  console.log(
    `[AI Call Completed] Generation took ${executionTimeMs}ms using model '${modelUsed}'`
  );

  let subject = `Update regarding ${purpose}`;
  let body = `Dear ${recipient_name},\n\nWe are writing to you regarding ${purpose}.\n\nBest regards,\nCustomer Support Team`;

  try {
    const parsed = JSON.parse(responseText);
    if (parsed.subject) subject = parsed.subject;
    if (parsed.body) body = parsed.body;
  } catch {
    if (responseText) {
      body = responseText;
    }
  }

  return {
    subject,
    body,
    execution_time_ms: executionTimeMs,
    metadata: {
      recipient_name,
      purpose,
      tone,
      generated_at: new Date(endTime).toISOString(),
      model_used: modelUsed,
    },
  };
}

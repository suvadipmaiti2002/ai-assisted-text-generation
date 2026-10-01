export type ClassificationCategory = "Complaint" | "Query" | "Feedback" | "Other";

export interface ClassifyRequest {
  text: string;
}

export interface ClassifyResponse {
  category: ClassificationCategory;
  confidence: number;
  explanation: string;
  model_used?: string;
}

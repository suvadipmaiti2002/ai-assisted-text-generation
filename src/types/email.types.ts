export interface EmailGenerateRequest {
  purpose: string;
  recipient_name: string;
  tone: string;
}

export interface EmailGenerateResponse {
  subject: string;
  body: string;
  execution_time_ms: number;
  metadata: {
    recipient_name: string;
    purpose: string;
    tone: string;
    generated_at: string;
    model_used?: string;
  };
}

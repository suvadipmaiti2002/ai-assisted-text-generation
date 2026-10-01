# AI Assisted Text Generation Services

Backend service built with Node.js, Express, TypeScript, and Google Gemini SDK (`@google/genai`).

This project implements two REST APIs:
1. **Text Classification API**: Classifies incoming customer text into `Complaint`, `Query`, `Feedback`, or `Other` and returns a confidence score.
2. **Email Template Generator**: Generates concise, customer-friendly email templates based on purpose, recipient name, and tone, while measuring AI response latency.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **SDK**: `@google/genai`
- **Validation**: Zod
- **Development**: `tsx` (watch mode)

---

## Project Structure

```
ai-assisted-text-generation/
├── src/
│   ├── config/
│   │   └── env.ts                 # Loads and validates environment variables
│   ├── controllers/
│   │   ├── classify.controller.ts # Classification request handler
│   │   └── email.controller.ts    # Email generator request handler
│   ├── middlewares/
│   │   ├── error.middleware.ts    # Error handling middleware
│   │   └── validate.middleware.ts # Zod request validation
│   ├── routes/
│   │   ├── classify.routes.ts     # /api/v1/classify
│   │   ├── email.routes.ts        # /api/v1/email
│   │   └── index.ts               # Router aggregator & health check
│   ├── services/
│   │   ├── ai.service.ts          # Gemini client with fallback logic
│   │   ├── classify.service.ts    # Classification prompt logic
│   │   └── email.service.ts       # Email generation logic with timing
│   ├── types/
│   │   ├── classify.types.ts
│   │   └── email.types.ts
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Server entry point
├── postman/
│   └── ai_services.postman_collection.json # Exported Postman collection
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file based on `.env.example`:
```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash,gemini-3.5-flash,gemini-3.1-flash-lite
```

### 4. Run the Project

Development mode:
```bash
npm run dev
```

Build and run production:
```bash
npm run build
npm start
```

---

## API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/v1/health`
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

---

### 2. Text Classification
- **Endpoint**: `POST /api/v1/classify`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "text": "My package was supposed to arrive yesterday, but tracking says it is lost. Can someone help?"
}
```

#### cURL
```bash
curl -X POST http://localhost:4000/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "My package was supposed to arrive yesterday, but tracking says it is lost. Can someone help?"}'
```

#### Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "category": "Complaint",
    "confidence": 0.95,
    "explanation": "Customer is reporting a lost delivery and requesting resolution.",
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### 3. Email Template Generator
- **Endpoint**: `POST /api/v1/email/generate`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "purpose": "Apologizing for late shipment and offering 15% discount",
  "recipient_name": "Alex Morgan",
  "tone": "polite and professional"
}
```

#### cURL
```bash
curl -X POST http://localhost:4000/api/v1/email/generate \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "Apologizing for late shipment and offering 15% discount",
    "recipient_name": "Alex Morgan",
    "tone": "polite and professional"
  }'
```

#### Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "subject": "Update on your order shipment",
    "body": "Hi Alex,\n\nWe apologize for the delay in shipping your order. We are working to get it delivered to you as quickly as possible. As an apology for the delay, please enjoy 15% off your next order with code SAVE15.\n\nThank you for your patience.\n\nBest regards,\nSupport Team",
    "execution_time_ms": 780,
    "metadata": {
      "recipient_name": "Alex Morgan",
      "purpose": "Apologizing for late shipment and offering 15% discount",
      "tone": "polite and professional",
      "generated_at": "2026-10-01T10:15:30.120Z",
      "model_used": "gemini-3.8-flash"
    }
  }
}
```

Console output logs the duration of each AI call:
```
[AI Call Started] Generating email template for 'Alex Morgan' at 2026-10-01T10:15:29.340Z
[AI Call Completed] Generation took 780ms using model 'gemini-3.8-flash'
```

---

## AI Implementation & Prompt Design

### Classification Prompt
The model is instructed to act as a classifier with predefined categories (`Complaint`, `Query`, `Feedback`, `Other`). We use `responseMimeType: "application/json"` and `responseSchema` so that the model returns strict JSON without requiring markdown stripping. We also ask the model to provide its confidence score between 0.0 and 1.0 based on linguistic indicators.

### Email Generation Prompt
The prompt accepts `recipient_name`, `purpose`, and `tone`. It instructs the model to generate a concise subject line and body including an appropriate greeting and closing. The round-trip time of the model call is measured via `Date.now()` timestamp difference and returned in the response.

### Model Fallback & Retries
In `src/services/ai.service.ts`, `generateContentWithFallback()` iterates over the models listed in `GEMINI_MODEL` (e.g. `gemini-3.8-flash,gemini-3.5-flash,gemini-3.1-flash-lite`). If a call fails due to rate limits (429), capacity errors (503), or quota exhaustion, it logs a warning and retries with the next model in the chain.

---

## Postman Collection

A collection is included at `postman/ai_services.postman_collection.json`. 

To use it:
1. Open Postman -> click **Import**.
2. Select `postman/ai_services.postman_collection.json`.
3. The collection has requests for health check, classification examples, and email generation with the `baseUrl` preset to `http://localhost:4000/api/v1`.

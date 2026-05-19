import { VISION_PROMPT } from "@/lib/constants";
import { visionAnalysisSchema } from "@/lib/analysis-schema";
import { cleanJsonPayload } from "@/lib/utils";
import type { VisionAnalysis } from "@/lib/types";

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

function getEndpoint(provider: string) {
  const normalized = provider.trim().toLowerCase();

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized.endsWith("/chat/completions") ? normalized : `${normalized.replace(/\/$/, "")}/chat/completions`;
  }

  switch (normalized) {
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions";
    case "groq":
      return "https://api.groq.com/openai/v1/chat/completions";
    case "openai":
    default:
      return "https://api.openai.com/v1/chat/completions";
  }
}

function extractContent(payload: OpenAIChatResponse) {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((chunk) => chunk.text ?? "")
      .join("\n")
      .trim();
  }

  throw new Error("AI response did not contain message content.");
}

export async function analyzeSelfieWithAI(imageDataUrl: string): Promise<VisionAnalysis> {
  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!provider || !apiKey || !model) {
    throw new Error("Missing AI provider configuration.");
  }

  const response = await fetch(getEndpoint(provider), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(provider.toLowerCase() === "openrouter"
        ? {
            "HTTP-Referer": "https://vercel.com",
            "X-Title": "T'es stone ?",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 320,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a careful vision classifier. Return only strict JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: VISION_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`AI request failed (${response.status}): ${message}`);
  }

  const payload = (await response.json()) as OpenAIChatResponse;
  const rawContent = extractContent(payload);
  const parsed = JSON.parse(cleanJsonPayload(rawContent));
  return visionAnalysisSchema.parse(parsed);
}

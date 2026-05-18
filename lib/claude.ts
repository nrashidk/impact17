// Thin @anthropic-ai/sdk wrapper. Model from ANTHROPIC_MODEL (default
// claude-sonnet-4-6). Any transport/auth/empty-response failure throws
// ClaudeError so callers can fail closed.

import Anthropic from "@anthropic-ai/sdk";

export const DEFAULT_MODEL = "claude-sonnet-4-6";

export class ClaudeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeError";
  }
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ClaudeError("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type VisionRequest = {
  system: string;
  userText: string;
  imageBase64: string;
  imageMediaType: "image/jpeg";
  maxTokens?: number;
};

// Returns the raw text of the first text block. Throws ClaudeError on any
// failure (network, auth, empty/non-text response).
export async function callClaudeVision(req: VisionRequest): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  let message;
  try {
    message = await getClient().messages.create({
      model,
      max_tokens: req.maxTokens ?? 1024,
      system: req.system,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: req.imageMediaType,
                data: req.imageBase64,
              },
            },
            { type: "text", text: req.userText },
          ],
        },
      ],
    });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    throw new ClaudeError(`Claude request failed: ${m}`);
  }

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text" || !block.text.trim()) {
    throw new ClaudeError("Claude returned an empty or non-text response");
  }
  return block.text;
}

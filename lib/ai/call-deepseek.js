import { buildUserPrompt, SYSTEM_PROMPT } from "./build-prompt.js";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export async function callDeepSeek(employee, scores) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DeepSeek is not configured. Add DEEPSEEK_API_KEY to .env.local and restart the dev server.",
    );
  }
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(employee, scores) },
        ],
        temperature: 0.3,
        max_tokens: Number(process.env.AI_MAX_TOKENS || 2000),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`DeepSeek request failed: ${response.status} ${detail}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("DeepSeek returned an empty response.");
    return { content, provider: "deepseek", model };
  } finally {
    clearTimeout(timer);
  }
}

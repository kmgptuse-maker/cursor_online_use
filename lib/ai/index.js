import { callDeepSeek } from "./call-deepseek.js";
import { callOpenAI } from "./call-openai.js";
import { parsePlanJson, toStoredPlan } from "./parse-plan.js";
import { generateRuleBasedPlan } from "./rule-based-plan.js";

function hasDeepSeekKey() {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function resolveProvider() {
  const preferred = (process.env.AI_PROVIDER || "deepseek").toLowerCase();
  if (preferred === "openai" && hasOpenAIKey()) return "openai";
  if (preferred === "deepseek" && hasDeepSeekKey()) return "deepseek";
  if (hasDeepSeekKey()) return "deepseek";
  if (hasOpenAIKey()) return "openai";
  return null;
}

export async function generateLearningPath(employee, scores) {
  const provider = resolveProvider();

  if (!provider) {
    const rule = generateRuleBasedPlan(employee, scores);
    return {
      plan: toStoredPlan(rule, { provider: "fallback", model: "rule-based" }),
      usedFallback: true,
      message:
        "No AI API key configured. Using rule-based plan. Add DEEPSEEK_API_KEY or OPENAI_API_KEY to .env.local.",
    };
  }

  try {
    const result =
      provider === "openai"
        ? await callOpenAI(employee, scores)
        : await callDeepSeek(employee, scores);
    const parsed = parsePlanJson(result.content);
    return {
      plan: toStoredPlan(parsed, { provider: result.provider, model: result.model }),
      usedFallback: false,
      message: null,
    };
  } catch (error) {
    const rule = generateRuleBasedPlan(employee, scores);
    return {
      plan: toStoredPlan(rule, { provider: "fallback", model: "rule-based" }),
      usedFallback: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export function getAiConfigStatus() {
  const provider = resolveProvider();
  return {
    provider: provider || "none",
    configured: Boolean(provider),
    preferred: process.env.AI_PROVIDER || "deepseek",
  };
}

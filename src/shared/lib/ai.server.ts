import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * AI 모델 선택 — 서버 전용.
 *
 * OPENAI_API_KEY 가 있으면 OpenAI(ChatGPT) API 를 직접 부릅니다.
 * 없으면 Vercel AI Gateway 로 넘어갑니다(배포 환경의 OIDC 또는 AI_GATEWAY_API_KEY).
 *
 * 환경변수로 바꿀 수 있습니다:
 *   OPENAI_TEXT_MODEL      기본 gpt-5.4-mini
 *   OPENAI_REASONING       기본 low  (none · minimal · low · medium · high)
 *   OPENAI_IMAGE_MODEL     기본 gpt-image-2.5-flare (scripts/generate-scenes.mjs 에서 사용)
 */
export const DEFAULT_TEXT_MODEL = "gpt-5.4-mini";
export const DEFAULT_REASONING = "low";

export type AiSource = "openai" | "gateway" | "none";

export function aiSource(): AiSource {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) return "gateway";
  return "none";
}

/** generateText / generateObject 에 그대로 넘길 모델. */
export function textModel(): LanguageModel {
  const key = process.env.OPENAI_API_KEY;
  const name = process.env.OPENAI_TEXT_MODEL ?? DEFAULT_TEXT_MODEL;

  if (key) return createOpenAI({ apiKey: key })(name);
  return `openai/${name}`;
}

/**
 * 추론에 시간을 얼마나 쓸지.
 * 스크럼에서 다 같이 기다리는 화면이라 기본값을 낮게 둔다 —
 * 표를 읽고 정리하는 일이라 깊은 추론이 필요하지 않다.
 */
export function reasoningOptions() {
  return {
    openai: {
      reasoningEffort: process.env.OPENAI_REASONING ?? DEFAULT_REASONING,
      textVerbosity: "low",
    },
  } as const;
}

export function aiSetupHint() {
  return aiSource() === "none"
    ? "AI 설정이 없습니다. .env 에 OPENAI_API_KEY 를 넣어주세요."
    : "AI 호출이 실패했습니다. API 키와 남은 크레딧을 확인해 주세요.";
}

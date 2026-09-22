/**
 * AI 설정 점검. 토큰을 쓰지 않는 호출로 키가 살아 있는지만 확인한다.
 *   pnpm check:ai
 */
import { existsSync, readFileSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
  }
}

const key = process.env.OPENAI_API_KEY;
const textModel = process.env.OPENAI_TEXT_MODEL ?? "gpt-5.4";
const imageModel = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";

if (!key) {
  console.error("✗ OPENAI_API_KEY 가 없습니다.");
  console.error("  .env.local 을 편집기로 열어 아래 한 줄을 추가하세요 (터미널 기록에 남기지 마세요):");
  console.error("    OPENAI_API_KEY=sk-...");
  process.exit(1);
}

const res = await fetch("https://api.openai.com/v1/models", {
  headers: { Authorization: `Bearer ${key}` },
});

if (!res.ok) {
  console.error(`✗ OpenAI 인증 실패 (HTTP ${res.status})`);
  console.error(`  ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}

const ids = new Set((await res.json()).data.map((m) => m.id));
console.log("✓ OpenAI API 키 정상");
console.log(`  텍스트 ${textModel}: ${ids.has(textModel) ? "사용 가능" : "이 계정에서 안 보임"}`);
console.log(`  이미지 ${imageModel}: ${ids.has(imageModel) ? "사용 가능" : "이 계정에서 안 보임"}`);
if (!ids.has(textModel) || !ids.has(imageModel)) {
  console.log("\n  안 보이는 모델은 .env.local 에서 바꿀 수 있습니다:");
  console.log("    OPENAI_TEXT_MODEL=gpt-5.4-mini");
  console.log("    OPENAI_IMAGE_MODEL=gpt-image-1");
}

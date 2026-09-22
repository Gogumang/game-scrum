/**
 * 대사 검수. content/story.json 의 대사를 ChatGPT 에게 보여주고 평을 받는다.
 *
 *   pnpm review:script                전체
 *   pnpm review:script --node tavern  한 마디만
 *   pnpm review:script --json         원본 JSON 으로 (다시 고칠 때 쓰기 좋다)
 *
 * 고쳐 쓰는 건 사람(또는 Claude)이 한다. 이 스크립트는 평만 받아온다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
  }
}

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY 가 없습니다. .env 를 확인하세요.");
  process.exit(1);
}

const args = process.argv.slice(2);
const only = args.includes("--node") ? args[args.indexOf("--node") + 1] : null;
const asJson = args.includes("--json");

const story = JSON.parse(readFileSync("content/story.json", "utf8"));

const scenes = [
  ...story.nodes.map((n) => ({
    id: n.id,
    where: n.when,
    script: n.script,
    ask: n.ask,
    choices: n.choices.map((c) => c.text),
  })),
  ...story.endings.map((e) => ({
    id: e.id,
    where: `엔딩 — ${e.title}`,
    script: e.script,
    ask: null,
    choices: [],
  })),
].filter((s) => (only ? s.id === only : true));

if (scenes.length === 0) {
  console.error(`"${only}" 마디를 찾지 못했습니다.`);
  process.exit(1);
}

const note = z.object({
  id: z.string().describe("마디 id"),
  verdict: z.enum(["good", "weak", "bad"]).describe("이 마디 대사의 현재 상태"),
  problem: z.string().describe("가장 큰 문제 하나. 없으면 빈 문자열"),
  suggestion: z.string().describe("어떻게 고치면 좋을지. 문장을 대신 써주지 말고 방향만"),
  quoteRisk: z
    .string()
    .describe("실제 영화·드라마 대사를 그대로 옮긴 것으로 보이는 줄이 있으면 지적. 없으면 빈 문자열"),
});

const schema = z.object({
  overall: z.string().describe("전체 인상 3~4문장. 듣기 좋은 말 말고 진짜 문제를 짚을 것"),
  aiSmell: z.string().describe("AI 가 쓴 티가 나는 패턴이 있다면 구체적으로"),
  notes: z.array(note),
});

const prompt = `당신은 한국 코미디 영화 각본을 고쳐 쓰는 스크립트 닥터입니다.

아래는 회사 스크럼에서 아이스브레이킹으로 쓰는 게임의 대사입니다.
'용사가 마왕을 무찌르러 간다'는 정통 RPG를 능청스럽게 비트는 톤이고,
실제로는 직장 생활을 빗댄 농담입니다. 한 마디는 3~6줄이고, 마지막 줄 뒤에 선택지가 뜹니다.

[대사]
${JSON.stringify(scenes, null, 2)}

각 마디를 평가해 주세요. 기준:

1. **자연스러운가** — 사람이 실제로 저렇게 말하나. 설명을 대사에 억지로 넣지 않았나.
2. **웃긴가** — 웃음은 보통 농담 자체가 아니라 *반응*에서 나옵니다. 받아치는 줄이 있나.
3. **인물이 구분되나** — 전령·재상·도적·마법사·동료·마왕이 각자 말투가 있나,
   아니면 전부 같은 사람이 말하나.
4. **리듬** — 같은 길이 문장이 늘어서면 읽는 맛이 없습니다. 긴 줄 뒤 짧은 줄이 오나.
5. **선택지로 이어지나** — 마지막 줄이 질문을 자연스럽게 열어주나.

엄하게 봐주세요. "좋습니다"로 넘어가면 쓸모가 없습니다.
문장을 대신 써주지는 말고, 무엇이 왜 약한지와 어느 방향으로 고칠지만 알려주세요.

그리고 실제 영화·드라마 대사를 그대로 가져온 것처럼 보이는 줄이 있으면 반드시 짚어주세요.
저작권 문제가 되므로, 유명한 장면의 결을 빌리는 건 괜찮지만 문장을 그대로 옮기면 안 됩니다.`;

const openai = createOpenAI({ apiKey: key });
const model = process.env.OPENAI_TEXT_MODEL ?? "gpt-5.4";

console.error(`검수 중… (${scenes.length}개 마디 · ${model})`);

const { object } = await generateObject({
  model: openai(model),
  schema,
  prompt,
  providerOptions: { openai: { reasoningEffort: "medium" } },
});

if (asJson) {
  writeFileSync("/tmp/script-review.json", JSON.stringify(object, null, 2));
  console.log(JSON.stringify(object, null, 2));
  process.exit(0);
}

const mark = { good: "○", weak: "△", bad: "✗" };

console.log("");
console.log("■ 전체");
console.log("  " + object.overall.replace(/\n/g, "\n  "));
console.log("");
console.log("■ AI 가 쓴 티");
console.log("  " + object.aiSmell.replace(/\n/g, "\n  "));
console.log("");
console.log("■ 마디별");
for (const n of object.notes) {
  console.log(`\n  ${mark[n.verdict] ?? "·"} ${n.id}`);
  if (n.problem) console.log(`      문제: ${n.problem}`);
  if (n.suggestion) console.log(`      방향: ${n.suggestion}`);
  if (n.quoteRisk) console.log(`      ⚠ 인용: ${n.quoteRisk}`);
}

const bad = object.notes.filter((n) => n.verdict !== "good").length;
console.log("");
console.log(`손봐야 할 마디: ${bad} / ${object.notes.length}`);

/**
 * content/story.json 검사기.
 *   pnpm check:story
 *
 * 모양이 맞는지, 길이 끊기지 않았는지, 닿지 않는 마디가 없는지,
 * 오행이 한쪽으로 쏠리지 않았는지 본다. 빌드할 때 자동으로 돈다.
 */
import { readFileSync } from "node:fs";
import { z } from "zod";
import { ELEMENT_NAMES, SCENE_NAMES } from "../src/entities/act/model/scenes.ts";

const raw = JSON.parse(readFileSync("content/story.json", "utf8"));

const line = z.object({
  speaker: z.string().min(1).optional(),
  text: z.string().min(1),
});

const choice = z.object({
  text: z.string().min(1),
  element: z.enum(ELEMENT_NAMES),
  next: z.string().min(1),
});

const node = z.object({
  id: z.string().min(1),
  act: z.number().int().positive(),
  when: z.string().min(1),
  scene: z.enum(SCENE_NAMES),
  script: z.array(line).min(1),
  ask: z.string().min(1),
  choices: z.array(choice).min(2),
});

const ending = z.object({
  id: z.string().min(1),
  scene: z.enum(SCENE_NAMES),
  title: z.string().min(1),
  script: z.array(line).min(1),
  epilogue: z.string().min(1),
});

const schema = z.object({
  title: z.string().min(1),
  start: z.string().min(1),
  totalActs: z.number().int().positive(),
  speakers: z.record(z.string(), z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  nodes: z.array(node).min(1),
  endings: z.array(ending).min(1),
});

const parsed = schema.safeParse(raw);
if (!parsed.success) {
  console.error("✗ content/story.json 의 모양이 맞지 않습니다\n");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(" → ")}: ${issue.message}`);
  }
  process.exit(1);
}

const story = parsed.data;
const problems = [];
const warnings = [];

/* 아이디 중복 */
const seen = new Set();
for (const item of [...story.nodes, ...story.endings]) {
  if (seen.has(item.id)) problems.push(`아이디가 겹칩니다: "${item.id}"`);
  seen.add(item.id);
}

/* 끊어진 길 */
for (const n of story.nodes) {
  for (const c of n.choices) {
    if (!seen.has(c.next)) {
      problems.push(`"${n.id}" 의 선택지 「${c.text}」 → 없는 마디 "${c.next}"`);
    }
  }
}
if (!seen.has(story.start)) problems.push(`start 로 지정한 "${story.start}" 마디가 없습니다`);

/* 닿지 않는 마디 — 시작점에서 실제로 따라가 본다 */
const byId = Object.fromEntries(story.nodes.map((n) => [n.id, n]));
const reached = new Set();
const stack = [story.start];
while (stack.length) {
  const id = stack.pop();
  if (!id || reached.has(id)) continue;
  reached.add(id);
  for (const c of byId[id]?.choices ?? []) stack.push(c.next);
}
for (const id of seen) {
  if (!reached.has(id)) problems.push(`"${id}" 로 오는 길이 없습니다`);
}

/* 막 번호가 길이와 맞는지 */
for (const n of story.nodes) {
  if (n.act > story.totalActs) {
    warnings.push(`"${n.id}" 의 act(${n.act}) 가 totalActs(${story.totalActs}) 보다 큽니다`);
  }
}

/* 장면이 실제로 쓰이는지 */
const usedScenes = new Set([...story.nodes, ...story.endings].map((x) => x.scene));
const unusedScenes = SCENE_NAMES.filter((s) => !usedScenes.has(s));

/* 화자 색 */
const spoken = new Set();
for (const item of [...story.nodes, ...story.endings]) {
  for (const l of item.script) if (l.speaker) spoken.add(l.speaker);
}
for (const s of spoken) {
  if (!story.speakers[s]) warnings.push(`화자 "${s}" 의 이름표 색이 speakers 에 없습니다 (기본 회색으로 나옵니다)`);
}

/* 오행 균형 */
const tally = Object.fromEntries(ELEMENT_NAMES.map((e) => [e, 0]));
for (const n of story.nodes) for (const c of n.choices) tally[c.element]++;
const counts = ELEMENT_NAMES.map((e) => tally[e]);
const spread = Math.max(...counts) - Math.min(...counts);

/* 결과 */
console.log(`「${story.title}」`);
console.log(`마디 ${story.nodes.length}개 · 엔딩 ${story.endings.length}개 · 선택지 ${counts.reduce((a, b) => a + b, 0)}개`);
console.log(`오행 분포: ${ELEMENT_NAMES.map((e) => `${e} ${tally[e]}`).join(" / ")} (편차 ${spread})`);
if (unusedScenes.length) console.log(`안 쓰는 장면: ${unusedScenes.join(", ")}`);

if (spread > 2) {
  warnings.push(`오행 편차가 ${spread} 입니다. 2 이하로 맞추면 사주가 더 잘 갈립니다`);
}

if (warnings.length) {
  console.log("");
  for (const w of warnings) console.log(`⚠ ${w}`);
}

if (problems.length) {
  console.error("");
  for (const p of problems) console.error(`✗ ${p}`);
  console.error(`\n${problems.length}건을 고쳐야 합니다.`);
  process.exit(1);
}

console.log("\n✓ 이상 없음");

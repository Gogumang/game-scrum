/**
 * 장면 그림을 Vercel AI Gateway 로 만들어 public/scenes/ 에 저장한다.
 *
 *   pnpm scenes:generate              아직 없는 장면만
 *   pnpm scenes:generate --force   전부 다시
 *   pnpm scenes:generate --only cave
 *
 * 인증은 .env.local 의 OPENAI_API_KEY 를 쓴다.
 * 키가 없으면 Vercel AI Gateway(VERCEL_OIDC_TOKEN / AI_GATEWAY_API_KEY)로 넘어간다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
  }
}

// gpt-image-2.5-flare: 납작한 셀 느낌을 지키면서 구도가 가장 안정적이다.
// 더 회화적인 결을 원하면 OPENAI_IMAGE_MODEL=gpt-image-2.5-sunburst 로 바꾸고 --force.
const MODEL_NAME = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2.5-flare";
const SIZE = "1536x1024";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey && !process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
  console.error("OPENAI_API_KEY 가 없습니다. .env.local 에 넣어주세요.");
  process.exit(1);
}

/** 키가 있으면 OpenAI 직접, 없으면 게이트웨이 문자열 */
const model = apiKey ? createOpenAI({ apiKey }).image(MODEL_NAME) : `openai/${MODEL_NAME}`;
console.log(apiKey ? `OpenAI API · ${MODEL_NAME}` : `AI Gateway · openai/${MODEL_NAME}`);

/** 15장이 한 세트로 보이게 하는 공통 화풍. 바꾸면 전부 다시 뽑는 게 좋다. */
const STYLE = [
  "Bright and cheerful 1990s Japanese comedy-fantasy RPG anime illustration, wide landscape composition.",
  "Super-deformed two-heads-tall characters with big round heads and tiny bodies, seen from behind or in profile, no detailed facial features.",
  "Thick even dark-brown outlines on every shape, flat cel shading, no gradients, no airbrush, no photorealism.",
  "Bold saturated storybook palette: sky blue, grass green, warm cream, coral red, sunny yellow, soft purple.",
  "Light-hearted gag-comedy mood even when the situation is dangerous. Clean shapes, generous open space, easy to read at a glance.",
  "No text, no letters, no numbers, no logos, no UI, no frame, no border, no watermark, no signature.",
].join(" ");

const SCENES = {
  omen:
    "A tiny hero in a pointy hat stands on a green hill with a panicking royal messenger beside him. Far away a cartoonish purple demon castle sits under a blue sky, with a comically jagged red crack running down the clouds above it.",
  bedroom:
    "A sunny little bedroom in the morning. A rumpled bed, a sword tossed on the floor, and a small hero standing dazed in pajamas while red light pours through the window.",
  tavern:
    "A warm crowded fantasy tavern. Three chibi adventurers sit around a wooden table with big mugs, all turning to look at a small hero who has just walked in.",
  palace:
    "A bright royal audience hall with cream pillars and a red carpet. A round bearded chancellor holds a tall stack of paperwork while a tiny hero stands in front of an oversized golden throne.",
  wilds:
    "A sunny empty wasteland with a cactus and one dead tree. A single small hero walks alone across cracked yellow ground under a big blue sky with puffy clouds.",
  forest:
    "A bright green forest of round bushy trees with white mist drifting between them. Two tiny adventurers stand looking down at their own footprints going in a circle.",
  cave:
    "The inside of a cheerful cartoon cave where the tunnel splits in two. A big torch burns on the rock pillar in the middle, and a small comrade sits slumped against the wall on the left.",
  ruins:
    "Sunny broken temple ruins with toppled cream-colored pillars. A tall cracked wall covered in rows of carved names stands in the middle, with a tiny hero looking up at it.",
  gate:
    "An enormous purple castle gate in a stone wall, wildly out of scale with the two tiny adventurers standing at its base. Glowing yellow diamond runes on the arch, torches on both sides.",
  sewer:
    "A stone sewer tunnel under a castle wall with bright green water flowing through it. Two small adventurers stand at the entrance looking unenthusiastic.",
  throne:
    "A purple throne room. A round cartoon demon lord with huge curly horns and big googly eyes rises from an oversized throne, while one tiny hero stands on the red carpet before him.",
  endBlaze:
    "A cartoon demon castle comically bursting apart in bright orange flame, chunks flying off. A tiny hero stands triumphantly on a hill in the foreground.",
  endSeal:
    "A great purple gate sealed shut under a bright blue sky, glowing blue diamond seals across it. A tiny hero walks away from it with hands behind his head.",
  endTide:
    "Pink and gold dawn over a plain. A line of four chibi adventurers walks toward the viewer across the field while a small hero waits in front, sun rising behind them.",
  endPact:
    "A purple hall where a tiny hero and a big round horned demon lord face each other, a glowing contract scroll floating between them. Both look equally pleased with the deal.",
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIndex = args.indexOf("--only");
const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;

const targets = Object.entries(SCENES).filter(([name]) => (only ? name === only : true));
if (only && targets.length === 0) {
  console.error(`알 수 없는 장면: ${only}`);
  console.error(`가능한 값: ${Object.keys(SCENES).join(", ")}`);
  process.exit(1);
}

const CONCURRENCY = Number(process.env.SCENE_CONCURRENCY ?? 3);

const queue = targets.filter(([name]) => force || !existsSync(`public/scenes/${name}.png`));
const skipped = targets.length - queue.length;
if (skipped > 0) console.log(`· ${skipped}장은 이미 있어 건너뜁니다 (--force 로 다시 뽑기)`);
if (queue.length === 0) console.log("· 새로 만들 장면이 없습니다");
else console.log(`· ${queue.length}장을 ${CONCURRENCY}개씩 동시에 생성합니다\n`);

const started = Date.now();
let finished = 0;
const failures = [];

/** 동시에 CONCURRENCY 장씩. 한 장이 끝나면 곧바로 다음 장을 집는다. */
async function worker() {
  for (;;) {
    const item = queue.shift();
    if (!item) return;
    const [name, description] = item;
    try {
      const { image } = await generateImage({
        model,
        prompt: `${STYLE} Scene: ${description}`,
        size: SIZE,
      });
      writeFileSync(`public/scenes/${name}.png`, Buffer.from(image.uint8Array));
      finished++;
      console.log(`  ✓ ${name}  (${finished}/${finished + queue.length + failures.length})`);
    } catch (error) {
      failures.push(name);
      console.log(`  ✗ ${name} — ${error?.message ?? error}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));

if (failures.length > 0) {
  console.log(`\n실패한 장면: ${failures.join(", ")}`);
  console.log(`다시 뽑으려면: pnpm scenes:generate --only ${failures[0]}`);
}
if (finished > 0) {
  console.log(`\n${finished}장 생성 · ${Math.round((Date.now() - started) / 1000)}초`);
}

// 생성 결과를 매니페스트에 반영한다 (sync 와 같은 로직을 쓴다)
const { syncManifest } = await import("./sync-scenes.mjs");
const { have } = syncManifest({ quiet: true });
console.log(`\n그림 ${have.length} / 15장 · 매니페스트 갱신 완료`);
if (have.length > 0) console.log("용량을 줄이려면: pnpm scenes:optimize");

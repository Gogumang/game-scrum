/**
 * public/scenes/ 에 있는 그림을 훑어 매니페스트를 다시 쓴다.
 * AI 를 부르지 않는다 — 직접 만든 그림을 넣었을 때 쓰는 명령.
 *
 *   pnpm scenes:sync
 *
 * png / jpg / jpeg / webp 를 받는다. 파일 이름만 맞으면 된다.
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";

export const SCENES = [
  "omen", "bedroom", "tavern", "palace", "wilds",
  "forest", "cave", "ruins", "gate", "sewer", "throne",
  "endBlaze", "endSeal", "endTide", "endPact",
];

const EXTENSIONS = ["png", "webp", "jpg", "jpeg"];

export function syncManifest({ quiet = false } = {}) {
  const files = existsSync("public/scenes") ? readdirSync("public/scenes") : [];

  /** 장면 이름 -> 확장자 */
  const found = {};
  for (const name of SCENES) {
    const hit = EXTENSIONS.find((ext) => files.includes(`${name}.${ext}`));
    if (hit) found[name] = hit;
  }

  const have = Object.keys(found);
  const missing = SCENES.filter((name) => !found[name]);
  const strays = files
    .filter((f) => EXTENSIONS.some((ext) => f.endsWith(`.${ext}`)))
    .filter((f) => !SCENES.includes(f.replace(/\.[^.]+$/, "")));

  writeFileSync(
    "src/entities/act/model/sceneImages.ts",
    `import type { SceneName } from "./story";

/**
 * 그림이 준비된 장면과 그 확장자. \`pnpm scenes:sync\` 가 public/scenes/ 를 훑어 채웁니다.
 * 여기 없는 장면은 벡터 배경으로 그려집니다.
 */
export const SCENE_IMAGES: Partial<Record<SceneName, string>> = {
${have.map((n) => `  ${n}: "${found[n]}",`).join("\n")}
};

export const hasImage = (name: SceneName) => name in SCENE_IMAGES;

export const imageSrc = (name: SceneName) => \`/scenes/\${name}.\${SCENE_IMAGES[name]}\`;
`,
  );

  if (!quiet) {
    console.log(`그림 ${have.length} / ${SCENES.length}장`);
    if (have.length) console.log(`  적용됨: ${have.map((n) => `${n}.${found[n]}`).join(", ")}`);
    if (missing.length) console.log(`  아직 없음: ${missing.join(", ")}`);
    if (strays.length) {
      console.log(`\n  ⚠ 이름이 맞지 않아 무시된 파일: ${strays.join(", ")}`);
      console.log(`    아래 이름 중 하나로 바꿔주세요 (확장자는 png/webp/jpg 다 됩니다):`);
      console.log(`    ${SCENES.join(", ")}`);
    }
  }

  return { have, missing, strays };
}

// 직접 실행했을 때만 돈다 (generate 스크립트에서 불러 쓸 수도 있게)
if (import.meta.url === `file://${process.argv[1]}`) syncManifest();

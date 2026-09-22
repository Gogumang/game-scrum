/**
 * 장면 그림을 webp 로 줄인다. 원본 png 는 지운다.
 *   pnpm scenes:optimize
 *
 * 스탠드업에서 여러 명이 폰으로 동시에 여는 화면이라 용량이 곧 체감 속도가 된다.
 */
import { readdirSync, statSync, unlinkSync } from "node:fs";
import sharp from "sharp";
import { syncManifest } from "./sync-scenes.mjs";

const files = readdirSync("public/scenes").filter((f) => f.endsWith(".png"));
if (files.length === 0) {
  console.log("줄일 png 가 없습니다.");
  process.exit(0);
}

let before = 0;
let after = 0;

for (const file of files) {
  const from = `public/scenes/${file}`;
  const to = from.replace(/\.png$/, ".webp");
  before += statSync(from).size;

  // 1536 폭이면 어떤 화면에서도 충분하다. quality 82 면 납작한 그림에서 열화가 안 보인다.
  await sharp(from).resize({ width: 1536, withoutEnlargement: true }).webp({ quality: 82 }).toFile(to);

  after += statSync(to).size;
  unlinkSync(from);
  console.log(`  ✓ ${file} → ${file.replace(/\.png$/, ".webp")}`);
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\n${mb(before)}MB → ${mb(after)}MB (${Math.round((1 - after / before) * 100)}% 감소)`);

syncManifest({ quiet: true });
console.log("매니페스트 갱신 완료");

/**
 * 저장소 연결 점검. 값을 쓰고 읽고 지운다.
 *   pnpm check:store
 */
import { existsSync, readFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
  }
}

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error("✗ UPSTASH_REDIS_REST_URL / TOKEN 이 없습니다.");
  process.exit(1);
}

const redis = new Redis({ url, token });
const key = `strum:healthcheck:${Date.now()}`;

try {
  const t0 = Date.now();
  await redis.set(key, JSON.stringify({ hello: "strum" }), { ex: 30 });
  const wrote = Date.now() - t0;

  const t1 = Date.now();
  const back = await redis.get(key);
  const read = Date.now() - t1;

  await redis.del(key);

  const value = typeof back === "string" ? JSON.parse(back) : back;
  if (value?.hello !== "strum") throw new Error(`읽은 값이 다릅니다: ${JSON.stringify(back)}`);

  console.log("✓ 저장소 정상");
  console.log(`  쓰기 ${wrote}ms · 읽기 ${read}ms`);
  console.log(`  ${new URL(url).host}`);
} catch (e) {
  console.error("✗ 저장소 연결 실패");
  console.error(`  ${e?.message ?? e}`);
  process.exit(1);
}

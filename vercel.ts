import type { VercelConfig } from "@vercel/config/v1";

/**
 * 하루 한 번 /api/health 를 찔러 저장소를 깨워둔다.
 * Upstash 무료 DB 는 오래 안 쓰면 정리되는데, 읽기 한 번이면 활동으로 잡힌다.
 *
 * Hobby 플랜은 크론이 하루 1회까지다. 더 자주 찌르고 싶으면
 * UptimeRobot 같은 외부 모니터링으로 /api/health 를 등록하면 된다.
 */
export const config: VercelConfig = {
  crons: [{ path: "/api/health", schedule: "0 3 * * *" }],
};

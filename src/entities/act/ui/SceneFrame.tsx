import type { ReactNode } from "react";
import type { SceneName } from "../model/story";

/**
 * 손으로 그리지 않은 장면을 위한 절차적 배경.
 * 하늘 그라데이션 + 시드로 만든 능선 + 광원 한 개로 장면의 분위기를 만든다.
 * public/scenes/<scene>.webp 가 생기면 SceneArt 가 그림을 대신 쓴다.
 */

export type SceneSpec = {
  /** 위 → 아래 하늘색 세 단계 */
  sky: [string, string, string];
  /** 화면을 물들이는 광원 */
  glow: { x: number; y: number; r: number; color: string };
  /** 뒤에서 앞으로 쌓이는 실루엣 띠 */
  ridges: { y: number; amp: number; fill: string; seed: number; steps?: number }[];
  stars?: boolean;
  /** 실내 장면이면 능선 대신 벽·바닥으로 읽히도록 각지게 그린다 */
  interior?: boolean;
  /** 장면을 알아보게 하는 최소한의 사물 */
  props?: ReactNode;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시드로 만든 능선. interior 면 계단처럼 각지게 나온다. */
function ridgePoints(y: number, amp: number, seed: number, steps: number, interior: boolean) {
  const r = rng(seed);
  const pts: string[] = ["0,540"];
  for (let i = 0; i <= steps; i++) {
    const x = Math.round((960 / steps) * i);
    const h = Math.round(y - (interior ? Math.round(r() * 3) / 3 : r()) * amp);
    if (interior && i > 0) pts.push(`${x},${pts[pts.length - 1].split(",")[1]}`);
    pts.push(`${x},${h}`);
  }
  pts.push("960,540");
  return pts.join(" ");
}

export function SceneFrame({ id, spec }: { id: SceneName; spec: SceneSpec }) {
  const starSeed = rng(id.length * 977 + 13);
  const stars = spec.stars
    ? Array.from({ length: 26 }, () => ({
        x: Math.round(starSeed() * 960),
        y: Math.round(starSeed() * 300),
        r: 0.8 + starSeed() * 1.6,
        o: 0.3 + starSeed() * 0.6,
      }))
    : [];

  return (
    <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.sky[0]} />
          <stop offset="55%" stopColor={spec.sky[1]} />
          <stop offset="100%" stopColor={spec.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={spec.glow.color} stopOpacity="0.55" />
          <stop offset="55%" stopColor={spec.glow.color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={spec.glow.color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="960" height="540" fill={`url(#${id}-sky)`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EDEAF6" opacity={s.o} />
      ))}
      <circle cx={spec.glow.x} cy={spec.glow.y} r={spec.glow.r} fill={`url(#${id}-glow)`} />

      {spec.ridges.map((ridge, i) => (
        <polygon
          key={i}
          points={ridgePoints(ridge.y, ridge.amp, ridge.seed, ridge.steps ?? 9, !!spec.interior)}
          fill={ridge.fill}
        />
      ))}

      {spec.props}
    </svg>
  );
}

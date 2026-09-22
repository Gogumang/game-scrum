import type { RoomPayload } from "./types";

export type Progress = { done: number; total: number; allDone: boolean };

export function voteProgress(payload: RoomPayload | null): Progress {
  const roster = payload?.roster ?? [];
  const done = roster.filter((p) => p.voted).length;
  return { done, total: roster.length, allDone: roster.length > 0 && done === roster.length };
}

export function myPick(payload: RoomPayload | null): number | null {
  const nodeId = payload?.state.nodeId;
  const pick = nodeId ? payload?.me?.picks?.[nodeId] : undefined;
  return typeof pick === "number" ? pick : null;
}

/** 최다 득표 선택지들. 아무도 안 골랐으면 빈 배열. */
export function winners(counts: number[]): number[] {
  const max = Math.max(0, ...counts);
  if (max === 0) return [];
  return counts.map((n, i) => (n === max ? i : -1)).filter((i) => i >= 0);
}

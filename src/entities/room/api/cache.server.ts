import { store, type RoomSnapshot } from "./store.server";

/**
 * 방 상태 읽기 캐시 — 인스턴스 메모리에만 산다.
 *
 * 조회는 초당 여러 번 들어오는데 그 사이 내용이 바뀌는 일은 드물다.
 * 짧게 들고 있으면 Redis 왕복을 크게 줄일 수 있다.
 *
 * 두 가지로 줄인다:
 *  1) 진행 중인 읽기를 공유한다. 같은 순간에 여러 명이 폴링해도 Redis 는 한 번만 간다.
 *     이건 지연이 전혀 늘지 않는다.
 *  2) 아주 짧은 TTL 동안 결과를 재사용한다. 그만큼 오래된 걸 볼 수 있으므로 기본값을 낮게 뒀다.
 *
 * 쓰기를 한 요청은 자기 인스턴스의 캐시를 즉시 버린다.
 * 다른 인스턴스는 TTL 만큼 늦게 보는데, 어차피 폴링 주기가 그보다 길다.
 */

const TTL_MS = Number(process.env.ROOM_CACHE_MS ?? 500);
/** 방이 아무리 많아도 메모리가 새지 않게 */
const MAX_ROOMS = 200;

type Entry = { at: number; pending: Promise<RoomSnapshot> };

const cache: Map<string, Entry> = ((globalThis as any).__strumRoomCache ??= new Map());

const cacheKey = (room: string, withHostKey: boolean) => `${room}|${withHostKey ? "h" : ""}`;

function prune() {
  if (cache.size <= MAX_ROOMS) return;
  // 오래된 것부터 버린다 (Map 은 넣은 순서를 지킨다)
  const excess = cache.size - MAX_ROOMS;
  let i = 0;
  for (const k of cache.keys()) {
    if (i++ >= excess) break;
    cache.delete(k);
  }
}

export async function readSnapshot(
  room: string,
  { hostKey = false } = {},
): Promise<RoomSnapshot> {
  const key = cacheKey(room, hostKey);
  const hit = cache.get(key);

  if (hit && Date.now() - hit.at < TTL_MS) return hit.pending;

  const pending = store()
    .snapshot(room, { hostKey })
    .catch((error) => {
      // 실패한 결과를 물고 있으면 안 된다
      cache.delete(key);
      throw error;
    });

  cache.set(key, { at: Date.now(), pending });
  prune();
  return pending;
}

/** 이 인스턴스가 방을 바꿨을 때. 다음 조회는 Redis 에서 새로 읽는다. */
export function forgetRoom(room: string) {
  cache.delete(cacheKey(room, false));
  cache.delete(cacheKey(room, true));
}

export const cacheTtlMs = () => TTL_MS;

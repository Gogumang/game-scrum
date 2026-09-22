import { Redis } from "@upstash/redis";

import { START_NODE } from "~/entities/act/model/story";
import type { Analysis, Player, RoomState } from "../model/types";

export type { Analysis, Player, RoomState };

const TTL_SECONDS = 60 * 60 * 12;

const key = {
  state: (room: string) => `strum:${room}:state`,
  players: (room: string) => `strum:${room}:players`,
  host: (room: string) => `strum:${room}:host`,
};

export function freshState(): RoomState {
  return {
    nodeId: START_NODE,
    path: [],
    phase: "vote",
    sessionId: `s${Date.now().toString(36)}`,
    analysis: null,
    createdAt: Date.now(),
  };
}

type Driver = {
  readonly kind: "redis" | "memory";
  getState(room: string): Promise<RoomState | null>;
  setState(room: string, state: RoomState): Promise<void>;
  listPlayers(room: string): Promise<Player[]>;
  putPlayer(room: string, player: Player): Promise<void>;
  getHostKey(room: string): Promise<string | null>;
  setHostKey(room: string, hostKey: string): Promise<void>;
  /** 같은 일이 두 번 돌지 않게 막는 짧은 잠금. 이미 잡혀 있으면 false. */
  acquireLock(room: string, name: string, ttlSeconds: number): Promise<boolean>;
  /** 실패했을 때 바로 다시 시도할 수 있도록 잠금을 푼다. */
  releaseLock(room: string, name: string): Promise<void>;
};

/* ── Upstash Redis ─────────────────────────────────────────────── */

function redisDriver(redis: Redis): Driver {
  const parse = <T,>(raw: unknown): T | null => {
    if (raw == null) return null;
    // Upstash 는 JSON 을 이미 객체로 돌려주기도 하고 문자열로 돌려주기도 합니다.
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }
    return raw as T;
  };

  return {
    kind: "redis",
    async getState(room) {
      return parse<RoomState>(await redis.get(key.state(room)));
    },
    async setState(room, state) {
      await redis.set(key.state(room), JSON.stringify(state), { ex: TTL_SECONDS });
    },
    async listPlayers(room) {
      const all = await redis.hgetall<Record<string, unknown>>(key.players(room));
      if (!all) return [];
      return Object.values(all)
        .map((raw) => parse<Player>(raw))
        .filter((p): p is Player => !!p)
        .sort((a, b) => a.joinedAt - b.joinedAt);
    },
    async putPlayer(room, player) {
      await redis.hset(key.players(room), { [player.id]: JSON.stringify(player) });
      await redis.expire(key.players(room), TTL_SECONDS);
    },
    async getHostKey(room) {
      return (await redis.get<string>(key.host(room))) ?? null;
    },
    async setHostKey(room, hostKey) {
      await redis.set(key.host(room), hostKey, { ex: TTL_SECONDS });
    },
    async acquireLock(room, name, ttlSeconds) {
      const res = await redis.set(`strum:${room}:lock:${name}`, "1", {
        nx: true,
        ex: ttlSeconds,
      });
      return res === "OK";
    },
    async releaseLock(room, name) {
      await redis.del(`strum:${room}:lock:${name}`);
    },
  };
}

/* ── 로컬 개발용 인메모리 ────────────────────────────────────────
   Upstash 환경변수가 없을 때만 씁니다. 서버가 재시작되면 날아가고
   여러 인스턴스에서 공유되지 않으므로 배포 환경에서는 쓰면 안 됩니다. */

type Mem = {
  states: Map<string, RoomState>;
  players: Map<string, Map<string, Player>>;
  hosts: Map<string, string>;
  locks: Map<string, number>;
};

const mem: Mem = ((globalThis as any).__strumMem ??= {
  states: new Map(),
  players: new Map(),
  hosts: new Map(),
  locks: new Map(),
});

const memoryDriver: Driver = {
  kind: "memory",
  async getState(room) {
    return mem.states.get(room) ?? null;
  },
  async setState(room, state) {
    mem.states.set(room, state);
  },
  async listPlayers(room) {
    return [...(mem.players.get(room)?.values() ?? [])].sort((a, b) => a.joinedAt - b.joinedAt);
  },
  async putPlayer(room, player) {
    if (!mem.players.has(room)) mem.players.set(room, new Map());
    mem.players.get(room)!.set(player.id, player);
  },
  async getHostKey(room) {
    return mem.hosts.get(room) ?? null;
  },
  async setHostKey(room, hostKey) {
    mem.hosts.set(room, hostKey);
  },
  async acquireLock(room, name, ttlSeconds) {
    const k = `${room}:${name}`;
    const now = Date.now();
    if ((mem.locks.get(k) ?? 0) > now) return false;
    mem.locks.set(k, now + ttlSeconds * 1000);
    return true;
  },
  async releaseLock(room, name) {
    mem.locks.delete(`${room}:${name}`);
  },
};

/* ── 드라이버 선택 ──────────────────────────────────────────────── */

let cached: Driver | null = null;

export function store(): Driver {
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    cached = redisDriver(new Redis({ url, token }));
  } else {
    console.warn(
      "[strum] Upstash 환경변수가 없어 인메모리 저장소로 돌아갑니다. " +
        "여러 기기에서 같이 쓰려면 `vercel env pull` 로 UPSTASH_REDIS_REST_URL/TOKEN 을 받아오세요.",
    );
    cached = memoryDriver;
  }
  return cached;
}

/* ── 공용 헬퍼 ──────────────────────────────────────────────────── */

/** 방 코드는 만들 때만 생긴다. 없는 코드로 들어오면 만들지 않고 404 를 던진다. */
export async function requireRoom(room: string) {
  const state = await store().getState(room);
  if (!state) {
    throw new Response("없는 방 코드입니다.", { status: 404 });
  }
  return state;
}

/** 방을 새로 만든다. /api/rooms 에서만 쓴다. */
export async function createRoomState(room: string) {
  const state = freshState();
  await store().setState(room, state);
  return state;
}

/** 이번 세션에 참여 중인 사람만 추린다. */
export function activePlayers(players: Player[], sessionId: string) {
  return players.filter((p) => p.sessionId === sessionId);
}

export function tallyNode(players: Player[], nodeId: string, choiceCount: number) {
  const counts = Array.from({ length: choiceCount }, () => 0);
  let voters = 0;
  for (const p of players) {
    const pick = p.picks?.[nodeId];
    if (typeof pick === "number" && counts[pick] !== undefined) {
      counts[pick]++;
      voters++;
    }
  }
  return { counts, voters };
}

export const newRoomCode = () => {
  // 헷갈리는 글자(0/O/1/I)를 뺀 6자리
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
};

export const newKey = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

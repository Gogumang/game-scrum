import { isEnding, nodeOf } from "~/entities/act/model/story";
import type { Player, RoomPayload, RoomState } from "../model/types";
import { forgetRoom, readSnapshot } from "./cache.server";
import { activePlayers, store, tallyNode, type RoomSnapshot } from "./store.server";

/**
 * 방을 읽을 때는 왕복을 한 번으로 묶는다.
 * 상태·참여자·(필요하면) 진행자 키를 파이프라인으로 한꺼번에 가져온 뒤,
 * 나머지 계산은 전부 메모리에서 한다.
 */
export async function loadRoom(
  room: string,
  { hostKey = false } = {},
): Promise<RoomSnapshot & { state: RoomState }> {
  const snap = await readSnapshot(room, { hostKey });
  if (!snap.state) throw new Response("없는 방 코드입니다.", { status: 404 });
  return snap as RoomSnapshot & { state: RoomState };
}

/** 이미 읽어온 것으로 응답을 만든다. 여기서는 저장소를 건드리지 않는다. */
export function payloadFrom(
  room: string,
  snap: RoomSnapshot & { state: RoomState },
  pid: string | null,
  isHost: boolean,
): RoomPayload {
  const { state } = snap;
  const players = activePlayers(snap.players, state.sessionId);

  const node = nodeOf(state.nodeId);
  const counted = node
    ? tallyNode(players, state.nodeId, node.choices.length)
    : { counts: [], voters: 0 };

  // 참여자에게는 몇 명이 골랐는지만 알려주고, 어디에 몰렸는지는 감춘다
  const tally = { counts: isHost ? counted.counts : null, voters: counted.voters };
  const me = players.find((p) => p.id === pid) ?? null;
  const finished = isEnding(state.nodeId);

  return {
    room,
    state,
    roster: players.map((p) => ({
      id: p.id,
      name: p.name,
      voted: finished || typeof p.picks?.[state.nodeId] === "number",
    })),
    tally,
    me: me ? { id: me.id, name: me.name, picks: me.picks ?? {} } : null,
    reveal: finished
      ? players.map((p) => ({ id: p.id, name: p.name, picks: p.picks ?? {} }))
      : null,
    isHost,
    driver: store().kind,
  };
}

/** 한 번 읽고 바로 응답까지. 폴링 경로가 이걸 쓴다. */
export async function buildPayload(room: string, pid: string | null, isHost = false) {
  return payloadFrom(room, await loadRoom(room), pid, isHost);
}

export async function requireHost(room: string, hostKey: string | null) {
  const real = await store().getHostKey(room);
  if (!real || !hostKey || hostKey !== real) {
    throw new Response("진행자만 할 수 있는 동작입니다.", { status: 403 });
  }
}

/**
 * 이미 읽어온 참여자 목록에서 나를 찾아 고치고 저장한다.
 * 저장소 왕복은 쓰기 한 번뿐이고, 돌려주는 목록은 메모리에서 갱신한다.
 */
export async function savePlayer(
  room: string,
  snap: RoomSnapshot & { state: RoomState },
  id: string,
  name: string,
  mutate?: (player: Player) => void,
): Promise<Player[]> {
  const { state } = snap;
  const existing = snap.players.find((p) => p.id === id);

  const player: Player =
    existing && existing.sessionId === state.sessionId
      ? { ...existing, name: name || existing.name }
      : { id, name: name || "모험가", picks: {}, sessionId: state.sessionId, joinedAt: Date.now() };

  mutate?.(player);
  await store().putPlayer(room, player);
  forgetRoom(room);

  const rest = snap.players.filter((p) => p.id !== id);
  return [...rest, player].sort((a, b) => a.joinedAt - b.joinedAt);
}

import { isEnding, nodeOf } from "~/entities/act/model/story";
import type { Player, RoomPayload } from "../model/types";
import { activePlayers, requireRoom, store, tallyNode } from "./store.server";

/** 클라이언트가 폴링으로 받아가는 방 상태 한 덩어리. */
export async function buildPayload(
  room: string,
  pid: string | null,
  isHost = false,
): Promise<RoomPayload> {
  const db = store();
  const state = await requireRoom(room);
  const players = activePlayers(await db.listPlayers(room), state.sessionId);

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
    driver: db.kind,
  };
}

export async function requireHost(room: string, hostKey: string | null) {
  const real = await store().getHostKey(room);
  if (!real || !hostKey || hostKey !== real) {
    throw new Response("진행자만 할 수 있는 동작입니다.", { status: 403 });
  }
}

export async function upsertPlayer(
  room: string,
  id: string,
  name: string,
  mutate?: (player: Player) => void,
) {
  const db = store();
  const state = await requireRoom(room);
  const existing = (await db.listPlayers(room)).find((p) => p.id === id);

  const player: Player =
    existing && existing.sessionId === state.sessionId
      ? { ...existing, name: name || existing.name }
      : { id, name: name || "모험가", picks: {}, sessionId: state.sessionId, joinedAt: Date.now() };

  mutate?.(player);
  await db.putPlayer(room, player);
  return player;
}

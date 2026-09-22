import type { ActionFunctionArgs } from "react-router";
import { isEnding, nodeOf } from "~/entities/act/model/story";
import { prewarmAnalysis } from "~/entities/room/api/analysis.server";
import { buildPayload, requireHost } from "~/entities/room/api/room.server";
import { activePlayers, requireRoom, freshState, store, tallyNode } from "~/entities/room/api/store.server";
import type { HostCommand, RoomState } from "~/entities/room/model/types";

/**
 * 다수 선택이 다음 장소를 정한다.
 * 동률이면 앞선 선택지가 이긴다. 아무도 안 골랐으면 첫 번째 길로 간다.
 */
async function resolveNext(room: string, state: RoomState) {
  const node = nodeOf(state.nodeId);
  if (!node) return state.nodeId;

  const players = activePlayers(await store().listPlayers(room), state.sessionId);
  const { counts } = tallyNode(players, state.nodeId, node.choices.length);
  const max = Math.max(0, ...counts);
  const winner = max > 0 ? counts.indexOf(max) : 0;
  return node.choices[winner].next;
}

export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { hostKey, command } = (await request.json()) as { hostKey?: string; command?: HostCommand };
  await requireHost(room, hostKey ?? null);

  const db = store();
  const state = await requireRoom(room);
  let next: RoomState = { ...state };

  switch (command) {
    case "reveal":
      if (!isEnding(state.nodeId)) next.phase = "result";
      break;

    case "next": {
      if (isEnding(state.nodeId)) break;
      const target = await resolveNext(room, state);
      next = {
        ...state,
        nodeId: target,
        path: [...state.path, state.nodeId],
        phase: isEnding(target) ? "ending" : "vote",
      };
      break;
    }

    case "prev": {
      const previous = state.path[state.path.length - 1];
      if (!previous) break;
      next = {
        ...state,
        nodeId: previous,
        path: state.path.slice(0, -1),
        phase: "result",
      };
      break;
    }

    case "back":
      if (!isEnding(state.nodeId)) next.phase = "vote";
      break;

    case "restart":
      next = { ...freshState(), createdAt: state.createdAt };
      break;

    default:
      throw new Response("모르는 명령입니다.", { status: 400 });
  }

  await db.setState(room, next);

  // 엔딩에 막 닿았다면 팀 분석을 미리 돌려 둔다.
  // 사람들이 엔딩과 사주를 읽는 동안 끝나 있으므로 따로 기다릴 일이 없다.
  if (isEnding(next.nodeId) && !isEnding(state.nodeId)) {
    prewarmAnalysis(room);
  }

  return Response.json(await buildPayload(room, null, true));
}

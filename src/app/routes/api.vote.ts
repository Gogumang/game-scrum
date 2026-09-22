import type { ActionFunctionArgs } from "react-router";
import { nodeOf } from "~/entities/act/model/story";
import { loadRoom, payloadFrom, savePlayer } from "~/entities/room/api/room.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { pid, name, nodeId, choice } = (await request.json()) as {
    pid?: string; name?: string; nodeId?: string; choice?: number;
  };
  if (!pid) throw new Response("pid 가 필요합니다.", { status: 400 });

  const snap = await loadRoom(room);
  const node = nodeOf(nodeId ?? "");
  if (!node || typeof choice !== "number" || !node.choices[choice]) {
    throw new Response("없는 선택지입니다.", { status: 400 });
  }
  // 이미 지나온 마디이거나 마감된 뒤라면 표를 받지 않는다
  if (snap.state.phase !== "vote" || snap.state.nodeId !== nodeId) {
    return Response.json(payloadFrom(room, snap, pid, false));
  }

  const players = await savePlayer(room, snap, pid, (name ?? "").trim().slice(0, 16), (p) => {
    p.picks = { ...p.picks, [node.id]: choice };
  });

  // 방금 쓴 결과를 다시 읽지 않고 그대로 응답에 쓴다
  return Response.json(payloadFrom(room, { ...snap, players }, pid, false));
}

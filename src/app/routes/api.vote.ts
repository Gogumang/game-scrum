import type { ActionFunctionArgs } from "react-router";
import { nodeOf } from "~/entities/act/model/story";
import { buildPayload, upsertPlayer } from "~/entities/room/api/room.server";
import { requireRoom } from "~/entities/room/api/store.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { pid, name, nodeId, choice } = (await request.json()) as {
    pid?: string; name?: string; nodeId?: string; choice?: number;
  };
  if (!pid) throw new Response("pid 가 필요합니다.", { status: 400 });

  const state = await requireRoom(room);
  const node = nodeOf(nodeId ?? "");
  if (!node || typeof choice !== "number" || !node.choices[choice]) {
    throw new Response("없는 선택지입니다.", { status: 400 });
  }
  // 파티가 이미 지나온 마디이거나 결과가 공개된 뒤라면 표를 받지 않는다.
  if (state.phase !== "vote" || state.nodeId !== nodeId) {
    return Response.json(await buildPayload(room, pid, false));
  }

  await upsertPlayer(room, pid, (name ?? "").trim().slice(0, 16), (p) => {
    p.picks = { ...p.picks, [node.id]: choice };
  });

  return Response.json(await buildPayload(room, pid, false));
}

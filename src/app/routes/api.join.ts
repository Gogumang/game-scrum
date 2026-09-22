import type { ActionFunctionArgs } from "react-router";
import { loadRoom, payloadFrom, savePlayer } from "~/entities/room/api/room.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { pid, name } = (await request.json()) as { pid?: string; name?: string };
  if (!pid) throw new Response("pid 가 필요합니다.", { status: 400 });

  const snap = await loadRoom(room);
  const players = await savePlayer(room, snap, pid, (name ?? "").trim().slice(0, 16));

  return Response.json(payloadFrom(room, { ...snap, players }, pid, false));
}

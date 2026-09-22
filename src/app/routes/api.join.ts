import type { ActionFunctionArgs } from "react-router";
import { buildPayload, upsertPlayer } from "~/entities/room/api/room.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { pid, name } = (await request.json()) as { pid?: string; name?: string };
  if (!pid) throw new Response("pid 가 필요합니다.", { status: 400 });

  await upsertPlayer(room, pid, (name ?? "").trim().slice(0, 16));
  return Response.json(await buildPayload(room, pid, false));
}

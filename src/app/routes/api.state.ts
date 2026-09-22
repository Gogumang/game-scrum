import type { LoaderFunctionArgs } from "react-router";
import { loadRoom, payloadFrom } from "~/entities/room/api/room.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const url = new URL(request.url);
  const pid = url.searchParams.get("pid");
  const given = url.searchParams.get("k");

  // 진행자 키까지 같은 파이프라인으로 가져와 왕복을 한 번으로 끝낸다
  const snap = await loadRoom(room, { hostKey: !!given });
  const isHost = !!given && !!snap.hostKey && given === snap.hostKey;

  return Response.json(payloadFrom(room, snap, pid, isHost), {
    headers: { "Cache-Control": "no-store" },
  });
}

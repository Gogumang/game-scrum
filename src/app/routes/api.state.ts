import type { LoaderFunctionArgs } from "react-router";
import { buildPayload } from "~/entities/room/api/room.server";
import { store } from "~/entities/room/api/store.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const url = new URL(request.url);
  const pid = url.searchParams.get("pid");

  // 진행자 키가 맞을 때만 집계를 담아 보낸다
  const given = url.searchParams.get("k");
  const real = given ? await store().getHostKey(room) : null;
  const isHost = !!given && !!real && given === real;

  return Response.json(await buildPayload(room, pid, isHost), {
    headers: { "Cache-Control": "no-store" },
  });
}

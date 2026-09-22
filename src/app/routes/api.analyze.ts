import type { ActionFunctionArgs } from "react-router";
import { ensureAnalysis } from "~/entities/room/api/analysis.server";
import { requireHost } from "~/entities/room/api/room.server";

/** 진행자가 직접 부를 때의 경로. 보통은 엔딩에 닿을 때 이미 예열돼 있다. */
export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { hostKey } = (await request.json()) as { hostKey?: string };
  await requireHost(room, hostKey ?? null);

  const outcome = await ensureAnalysis(room);

  switch (outcome.status) {
    case "ready":
      return Response.json({ analysis: outcome.analysis });
    case "running":
      // 다른 요청이 이미 만들고 있다. 폴링이 곧 결과를 가져온다.
      return Response.json({ analysis: null, running: true });
    case "empty":
      throw new Response("아직 참여자가 없습니다.", { status: 400 });
    case "failed":
      throw new Response(outcome.message, { status: 502 });
  }
}

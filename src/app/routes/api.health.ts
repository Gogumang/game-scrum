import type { LoaderFunctionArgs } from "react-router";
import { pingStore, store } from "~/entities/room/api/store.server";
import { cacheTtlMs } from "~/entities/room/api/cache.server";
import { aiSource } from "~/shared/lib/ai.server";

/**
 * 상태 점검.
 *
 *   GET /api/health          저장소를 읽어본다 (가볍다)
 *   GET /api/health?deep=1   쓰고 읽고 지워본다
 *
 * 하루 한 번 크론이 여기를 찌른다. 읽기만 해도 저장소 활동으로 잡히므로
 * 오래 안 써서 유휴 정리되는 일을 막아준다.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const deep = new URL(request.url).searchParams.get("deep") === "1";
  const storeStatus = await pingStore({ write: deep });

  const body = {
    ok: storeStatus.ok,
    store: { driver: store().kind, cacheTtlMs: cacheTtlMs(), ...storeStatus },
    ai: { configured: aiSource() !== "none", source: aiSource() },
    host: { configured: !!process.env.HOST_PASSWORD },
    checkedAt: new Date().toISOString(),
  };

  return Response.json(body, {
    status: storeStatus.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

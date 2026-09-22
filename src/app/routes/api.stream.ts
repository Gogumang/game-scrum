import type { LoaderFunctionArgs } from "react-router";
import { readSnapshot } from "~/entities/room/api/cache.server";
import { payloadFrom } from "~/entities/room/api/room.server";
import type { RoomPayload } from "~/entities/room/model/types";

/**
 * 방 상태를 밀어준다 (Server-Sent Events).
 *
 * 폴링이면 진행자가 넘겨도 참여자는 다음 차례까지 기다린다.
 * 여기서는 서버가 짧은 간격으로 확인하다가 **바뀐 순간에만** 내려보낸다.
 * 여러 명이 같은 인스턴스에 붙어 있어도 조회 캐시를 공유하므로 Redis 부하는 늘지 않는다.
 */

/** 서버가 변화를 확인하는 간격 */
const WATCH_MS = 350;
/** 함수 실행 시간 한도에 걸리기 전에 스스로 끊는다. EventSource 가 알아서 다시 붙는다. */
const MAX_LIFE_MS = 4 * 60 * 1000;
/** 중간에 아무 변화가 없어도 연결이 살아있음을 알린다 */
const HEARTBEAT_MS = 20 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 바뀐 게 있는지 판단할 지문. 화면에 영향 주는 것만 담는다. */
function fingerprint(p: RoomPayload) {
  return JSON.stringify([
    p.state.nodeId,
    p.state.phase,
    p.state.sessionId,
    !!p.state.analysis,
    p.tally.voters,
    p.tally.counts,
    p.roster.map((r) => `${r.id}:${r.name}:${r.voted ? 1 : 0}`),
    p.me?.picks,
  ]);
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const url = new URL(request.url);
  const pid = url.searchParams.get("pid");
  const given = url.searchParams.get("k");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // 연결 직후 재연결 간격을 알려준다
      controller.enqueue(encoder.encode("retry: 2000\n\n"));

      let lastPrint = "";
      let lastBeat = Date.now();
      const until = Date.now() + MAX_LIFE_MS;

      try {
        while (!request.signal.aborted && Date.now() < until) {
          try {
            const snap = await readSnapshot(room, { hostKey: !!given });
            if (!snap.state) {
              send("gone", { message: "없는 방 코드입니다." });
              break;
            }
            const isHost = !!given && !!snap.hostKey && given === snap.hostKey;
            const payload = payloadFrom(room, snap as never, pid, isHost);
            const print = fingerprint(payload);

            if (print !== lastPrint) {
              lastPrint = print;
              lastBeat = Date.now();
              send("room", payload);
            } else if (Date.now() - lastBeat > HEARTBEAT_MS) {
              lastBeat = Date.now();
              controller.enqueue(encoder.encode(": beat\n\n"));
            }
          } catch (error) {
            send("trouble", {
              message: error instanceof Error ? error.message : "잠시 연결이 흔들렸습니다",
            });
          }
          await sleep(WATCH_MS);
        }
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          /* 이미 닫혔으면 그만 */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRoom } from "./client";
import type { RoomPayload } from "../model/types";

export type RoomFeed = {
  data: RoomPayload | null;
  error: string | null;
  /** 밀어주기가 붙었는지. 안 붙으면 느린 폴링으로 버틴다. */
  live: boolean;
  /** 투표 직후처럼 응답을 이미 손에 쥐고 있을 때 */
  set: (next: RoomPayload) => void;
  refresh: () => Promise<void>;
};

/** 밀어주기가 끊겼을 때만 도는 안전망 주기 */
const FALLBACK_MS = 4000;

/**
 * 방 상태를 받아온다.
 *
 * 기본은 서버가 밀어주는 방식(SSE)이라 진행자가 넘기면 바로 따라간다.
 * 연결이 안 되거나 끊기면 느린 폴링으로 자동으로 버틴다.
 */
export function useRoomFeed(
  room: string,
  pid: string | null,
  hostKey: string | null,
  { enabled = true } = {},
): RoomFeed {
  const [data, setData] = useState<RoomPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setData(await fetchRoom(room, pid, hostKey));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "연결이 끊겼습니다");
    } finally {
      inFlight.current = false;
    }
  }, [room, pid, hostKey]);

  /* ── 서버가 밀어주는 경로 ── */
  useEffect(() => {
    if (!enabled) return;

    const query = new URLSearchParams();
    if (pid) query.set("pid", pid);
    if (hostKey) query.set("k", hostKey);

    const source = new EventSource(`/api/room/${room}/stream?${query.toString()}`);

    source.addEventListener("room", (event) => {
      setData(JSON.parse((event as MessageEvent).data) as RoomPayload);
      setError(null);
      setLive(true);
    });
    source.addEventListener("gone", () => {
      setError("없는 방 코드입니다.");
      source.close();
      setLive(false);
    });
    source.addEventListener("trouble", (event) => {
      const { message } = JSON.parse((event as MessageEvent).data) as { message: string };
      setError(message);
    });
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false); // EventSource 가 알아서 다시 붙는다

    return () => {
      source.close();
      setLive(false);
    };
  }, [enabled, room, pid, hostKey]);

  /* ── 안전망: 밀어주기가 끊겨 있을 때만 천천히 물어본다 ── */
  useEffect(() => {
    if (!enabled) return;

    // SSE 가 첫 상태를 바로 내려준다. 못 붙었을 때만 직접 물어본다.
    const firstTry = window.setTimeout(() => {
      if (!live) void refresh();
    }, 600);

    const timer = window.setInterval(() => {
      if (!live && !document.hidden) void refresh();
    }, FALLBACK_MS);

    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(firstTry);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, live, refresh]);

  return { data, error, live, set: setData, refresh };
}

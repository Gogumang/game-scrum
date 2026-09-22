import { useCallback, useEffect, useRef, useState } from "react";

export type PollingResult<T> = {
  data: T | null;
  error: string | null;
  refresh: () => Promise<void>;
  set: (next: T) => void;
};

/**
 * 일정 간격으로 값을 다시 받아온다.
 * 탭이 백그라운드면 쉬고, 돌아오는 즉시 한 번 받아온다.
 * enabled 가 false 면 아무것도 하지 않는다.
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  { intervalMs = 1200, enabled = true }: { intervalMs?: number; enabled?: boolean } = {},
): PollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setData(await fetcherRef.current());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "연결이 끊겼습니다");
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, intervalMs);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, intervalMs, refresh]);

  return { data, error, refresh, set: setData };
}

import { useCallback, useState } from "react";
import { sendCommand, type HostCommand, type RoomPayload } from "~/entities/room";

/** 진행자 명령을 보내고 돌아온 방 상태로 즉시 갱신한다. */
export function useHostCommand(
  room: string,
  hostKey: string | null,
  apply: (next: RoomPayload) => void,
) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (command: HostCommand) => {
      if (!hostKey || busy) return;
      setBusy(true);
      setError(null);
      try {
        apply(await sendCommand(room, hostKey, command));
      } catch (e) {
        setError(e instanceof Error ? e.message : "명령을 보내지 못했습니다");
      } finally {
        setBusy(false);
      }
    },
    [room, hostKey, busy, apply],
  );

  return { run, busy, error };
}

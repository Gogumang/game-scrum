import { useCallback, useState } from "react";
import { sendVote, type RoomPayload } from "~/entities/room";

/** 투표를 보내고 돌아온 방 상태로 화면을 바로 갱신한다. */
export function useVote(
  room: string,
  pid: string | null,
  name: string,
  apply: (next: RoomPayload) => void,
) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = useCallback(
    async (nodeId: string, choice: number) => {
      if (!pid || busy) return;
      setBusy(true);
      setError(null);
      try {
        apply(await sendVote(room, pid, name, nodeId, choice));
      } catch (e) {
        setError(e instanceof Error ? e.message : "투표를 보내지 못했습니다");
      } finally {
        setBusy(false);
      }
    },
    [room, pid, name, busy, apply],
  );

  return { vote, busy, error };
}

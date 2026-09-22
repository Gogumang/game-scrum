import { PlayerList } from "~/entities/player";
import { voteProgress, type RoomPayload } from "~/entities/room";
import { Panel, ProgressBar } from "~/shared/ui";

export type PartyPanelProps = {
  payload: RoomPayload | null;
  isHost: boolean;
  meId?: string | null;
};

/** 진행자용 현황판. 누가 아직 안 골랐는지 한눈에 보인다. */
export function PartyPanel({ payload, isHost, meId }: PartyPanelProps) {
  const finished = payload?.state.phase === "ending";
  const { done, total, allDone } = voteProgress(payload);

  return (
    <Panel className="side" title="파티 현황" badge={isHost ? "진행자" : undefined}>
      {finished ? (
        <p className="gauge">
          <b>{total}</b>
          <span>명이 여정을 마쳤습니다</span>
        </p>
      ) : (
        <>
          <p className="gauge">
            <b>{done}</b>
            <span>/ {total}명 선택 완료</span>
          </p>
          <ProgressBar value={done} max={total} />
        </>
      )}

      <PlayerList players={payload?.roster ?? []} meId={meId} allDone={finished} />

      <p className={allDone && !finished ? "note go" : "note"} style={{ marginTop: 14 }}>
        {finished
          ? "각자 화면에 자기 사주가 떠 있습니다. 돌아가며 한 줄씩 읽어보세요."
          : allDone
            ? "전원 선택 완료 — 결과를 공개하세요."
            : isHost
              ? "모두 고르면 아래 버튼이 반짝입니다. 기다리지 않고 먼저 공개해도 됩니다."
              : "진행자가 결과를 공개하면 함께 넘어갑니다."}
      </p>

      {payload?.driver === "memory" ? (
        <p className="note warn" style={{ marginTop: 10 }}>
          인메모리 저장소로 돌고 있습니다. 여러 기기에서 같이 쓰려면 Upstash 환경변수를 연결하세요.
        </p>
      ) : null}
    </Panel>
  );
}

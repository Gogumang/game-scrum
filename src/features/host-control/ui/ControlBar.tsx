import type { HostCommand, Phase } from "~/entities/room";
import { Button, StatusDot } from "~/shared/ui";

export type ControlBarProps = {
  phase: Phase;
  /** 엔딩에 도달했는지 */
  atEnding: boolean;
  /** 되돌아갈 마디가 있는지 */
  canGoBack: boolean;
  /** 전원이 선택을 마쳤는지 — 버튼을 강조한다 */
  allDone: boolean;
  busy?: boolean;
  onCommand: (command: HostCommand) => void;
};

/** 진행자 전용 하단 바. 결과를 공개하고 갈림길을 넘긴다. */
export function ControlBar({
  phase, atEnding, canGoBack, allDone, busy = false, onCommand,
}: ControlBarProps) {
  return (
    <div className="bar">
      <div className="bar-in">
        {atEnding ? (
          <>
            {canGoBack ? (
              <Button variant="ghost" title="이전 갈림길" onClick={() => onCommand("prev")} disabled={busy}>
                ←
              </Button>
            ) : null}
            <Button disabled={busy} onClick={() => onCommand("restart")}>
              새 여정 시작
            </Button>
          </>
        ) : phase === "vote" ? (
          <>
            {canGoBack ? (
              <Button variant="ghost" title="이전 갈림길" onClick={() => onCommand("prev")} disabled={busy}>
                ←
              </Button>
            ) : null}
            <Button
              variant="primary"
              attention={allDone}
              disabled={busy}
              onClick={() => onCommand("reveal")}
            >
              {allDone ? "전원 완료 · 선택 마감" : "선택 마감하기"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" title="선택 다시 열기" onClick={() => onCommand("back")} disabled={busy}>
              ←
            </Button>
            <Button variant="primary" disabled={busy} onClick={() => onCommand("next")}>
              이 길로 진행 →
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/** 참여자에게 보여줄 안내 바. */
export function WaitingBar({ phase }: { phase: Phase }) {
  const message =
    phase === "ending"
      ? "진행자가 새 여정을 시작하면 함께 이동합니다"
      : phase === "result"
        ? "선택 마감 · 진행자가 결과를 확인하는 중입니다"
        : "고르고 나면 진행자가 마감할 때까지 기다립니다";

  return (
    <div className="bar">
      <div className="bar-in">
        <span className="waiting">
          <StatusDot />
          {message}
        </span>
      </div>
    </div>
  );
}

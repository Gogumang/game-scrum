import type { Analysis, Point } from "~/entities/room";
import { AnalysisRunner } from "~/features/run-analysis";
import { Panel } from "~/shared/ui";

export type TeamAnalysisProps = {
  room: string;
  hostKey: string | null;
  analysis: Analysis | null;
  sessionId: string;
  hasPlayers: boolean;
  onDone: (analysis: Analysis) => void;
};

/** 다수 선택에서 읽어낸 팀의 일하는 방식. 장점과 단점을 같은 성향의 양면으로 보여준다. */
export function TeamAnalysis({
  room, hostKey, analysis, sessionId, hasPlayers, onDone,
}: TeamAnalysisProps) {
  const current = analysis && analysis.sessionId === sessionId ? analysis : null;

  if (!current) {
    return (
      <Panel className="ai" title="우리 팀은 이렇게 일합니다">
        <AnalysisRunner room={room} hostKey={hostKey} onDone={onDone} disabled={!hasPlayers} />
      </Panel>
    );
  }

  return (
    <Panel className="ai" title="우리 팀은 이렇게 일합니다">
      <p className="ai-head">{current.headline}</p>
      <p className="ai-style">{current.style}</p>

      <div className="ai-columns">
        <PointList kind="strength" label="이래서 잘 됩니다" points={current.strengths} />
        <PointList kind="weakness" label="이래서 놓칩니다" points={current.weaknesses} />
      </div>

      {current.tryNext ? (
        <p className="ai-try">
          <b>다음 스크럼에서 해볼 것</b>
          {current.tryNext}
        </p>
      ) : null}
    </Panel>
  );
}

function PointList({
  kind, label, points,
}: {
  kind: "strength" | "weakness";
  label: string;
  points: Point[];
}) {
  return (
    <div className={`ai-col ${kind}`}>
      <h3 className="ai-col-label">{label}</h3>
      <ul>
        {points.map((p) => (
          <li key={p.title}>
            <b>{p.title}</b>
            <span>{p.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

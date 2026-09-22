import type { Analysis } from "~/entities/room";
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

/** AI 팀 분석. 진행자가 한 번 돌리면 방 전체가 같은 결과를 본다. */
export function TeamAnalysis({
  room, hostKey, analysis, sessionId, hasPlayers, onDone,
}: TeamAnalysisProps) {
  const current = analysis && analysis.sessionId === sessionId ? analysis : null;

  return (
    <Panel className="ai" title="AI 팀 분석">
      {current ? (
        <>
          <p className="ai-head">{current.headline}</p>
          <div className="ai-traits">
            {current.traits.map((trait) => (
              <div className="trait" key={trait.title}>
                <h3>{trait.title}</h3>
                <p>{trait.body}</p>
              </div>
            ))}
          </div>
          {current.watch ? (
            <p className="ai-watch">
              <b>이 파티가 조심할 것</b>
              {current.watch}
            </p>
          ) : null}
          {current.cheer ? <p className="ai-cheer">{current.cheer}</p> : null}
        </>
      ) : (
        <AnalysisRunner room={room} hostKey={hostKey} onDone={onDone} disabled={!hasPlayers} />
      )}
    </Panel>
  );
}

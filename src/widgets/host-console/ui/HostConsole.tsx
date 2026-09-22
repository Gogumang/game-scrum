import { PlayerList } from "~/entities/player";
import { SceneArt, nodeOf, type StoryNode } from "~/entities/act";
import { voteProgress, winners, type RoomPayload } from "~/entities/room";
import { Panel, ProgressBar, StatusLine } from "~/shared/ui";

/**
 * 진행자 콘솔.
 * 참여자에게는 내려가지 않는 집계를 여기서만 본다. 다수 선택과 그래서 어디로 가는지를
 * 확인하고 다음 단계로 넘길지 정한다.
 */
export function HostConsole({ node, payload }: { node: StoryNode; payload: RoomPayload }) {
  const counts = payload.tally.counts ?? [];
  const voters = payload.tally.voters;
  const { done, total, allDone } = voteProgress(payload);
  const locked = payload.state.phase === "result";
  const top = winners(counts);
  const max = Math.max(0, ...counts);

  // 동률이면 위쪽 선택지가 이긴다 — api.control 의 규칙과 같다
  const goingTo = top.length > 0 ? node.choices[top[0]].next : node.choices[0].next;
  const destination = nodeOf(goingTo);

  return (
    <>
      <p className="eyebrow">
        <span className="n">제 {node.act} 막</span>
        {node.when}
        {locked ? <span className="pill-locked">선택 마감</span> : null}
      </p>

      <div className="console-grid">
        <div>
          <p className="console-ask">{node.ask}</p>

          <ul className="tally">
            {node.choices.map((choice, i) => {
              const n = counts[i] ?? 0;
              const pct = voters > 0 ? Math.round((n / voters) * 100) : 0;
              const leading = n === max && max > 0;
              return (
                <li key={choice.text} className={leading ? "tally-row lead" : "tally-row"}>
                  <span className="tally-key">{i + 1}</span>
                  <span className="tally-text">{choice.text}</span>
                  <span className="tally-bar">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <span className="tally-n">{n}</span>
                </li>
              );
            })}
          </ul>

          {max === 0 ? (
            <StatusLine>아직 아무도 고르지 않았습니다</StatusLine>
          ) : (
            <p className="going">
              {top.length > 1 ? (
                <>
                  <b>동률</b> — 위쪽 선택지로 갑니다
                </>
              ) : (
                <>
                  <b>{node.choices[top[0]].text}</b>
                </>
              )}
              <span className="going-arrow">→</span>
              <span className="going-to">{destination ? destination.when : "엔딩"}</span>
            </p>
          )}
        </div>

        <div>
          <Panel title="참여 현황" badge={`${done} / ${total}`}>
            <ProgressBar value={done} max={total} />
            <PlayerList players={payload.roster} allDone={locked} />
            <p className={allDone ? "note go" : "note"} style={{ marginTop: 12 }}>
              {locked
                ? "선택이 마감됐습니다. 결과를 읽어주고 다음으로 넘기세요."
                : allDone
                  ? "전원 완료 — 마감해도 됩니다."
                  : "아직 고르는 중입니다. 먼저 마감해도 됩니다."}
            </p>
          </Panel>

          <Panel title="지금 장면" className="thumb-panel">
            <div className="thumb">
              <SceneArt name={node.scene} />
            </div>
            <p className="note" style={{ marginTop: 10 }}>
              참여자 화면에는 집계가 보이지 않습니다.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

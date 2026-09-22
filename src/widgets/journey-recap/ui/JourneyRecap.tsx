import { STORY, type Element } from "~/entities/act";
import { ELEMENTS, ELEMENT_ORDER, ElementBars, ElementChip, dominantElement, todayKey } from "~/entities/element";
import type { RoomPayload } from "~/entities/room";
import { Panel } from "~/shared/ui";

/**
 * 여정 요약. 팀이 어떤 성향으로 기울었는지와, 내가 무엇을 골랐는지를 보여준다.
 * 개인 운세가 아니라 AI 팀 분석을 뒷받침하는 근거 자료다.
 */
export function JourneyRecap({ payload }: { payload: RoomPayload }) {
  const day = todayKey();

  const counts = Object.fromEntries(ELEMENT_ORDER.map((k) => [k, 0])) as Record<Element, number>;
  for (const p of payload.reveal ?? []) {
    const { element } = dominantElement(p.picks, `${p.id}|${day}`);
    if (element) counts[element] += 1;
  }
  const total = ELEMENT_ORDER.reduce((sum, k) => sum + counts[k], 0);
  const strongest = ELEMENT_ORDER.slice().sort((a, b) => counts[b] - counts[a])[0];

  const picks = payload.me?.picks ?? {};
  const mine = Object.entries(picks)
    .map(([nodeId, choiceIndex]) => ({ node: STORY[nodeId], choiceIndex }))
    .filter((row) => !!row.node)
    .sort((a, b) => a.node.act - b.node.act);

  return (
    <div className="recap-grid">
      <Panel title={`팀이 기울어진 쪽 · ${total}명`}>
        <ElementBars counts={counts} />
        {total > 0 ? (
          <p className="note" style={{ marginTop: 13 }}>
            가장 많은 쪽은{" "}
            <b style={{ color: ELEMENTS[strongest].color }}>{ELEMENTS[strongest].name}</b> 입니다 —{" "}
            {ELEMENTS[strongest].line}.
          </p>
        ) : null}
      </Panel>

      {mine.length > 0 ? (
        <Panel title="내가 고른 것">
          <div className="recap">
            {mine.map(({ node, choiceIndex }) => {
              const choice = node.choices[choiceIndex];
              if (!choice) return null;
              return (
                <p className="recap-item" key={node.id}>
                  <span className="rn">{node.when}</span>
                  <span className="rt">
                    <b>{choice.text}</b> <ElementChip element={choice.element} withName={false} />
                  </span>
                </p>
              );
            })}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

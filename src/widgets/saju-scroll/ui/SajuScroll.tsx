import { STORY, type Element } from "~/entities/act";
import {
  ELEMENTS,
  ELEMENT_ORDER,
  ElementBars,
  ElementChip,
  dominantElement,
  readingFor,
  todayKey,
} from "~/entities/element";
import type { RoomPayload } from "~/entities/room";
import { Panel } from "~/shared/ui";

/** 각자 화면에 뜨는 개인 사주 + 파티 기운 분포. */
export function SajuScroll({ payload }: { payload: RoomPayload }) {
  const day = todayKey();
  const mine = payload.me;
  const picks = mine?.picks ?? {};
  const seed = `${mine?.id ?? "guest"}|${day}`;
  const { element, total } = dominantElement(picks, seed);

  // 파티 전체 기운 분포
  const counts = Object.fromEntries(ELEMENT_ORDER.map((k) => [k, 0])) as Record<Element, number>;
  const byElement = Object.fromEntries(ELEMENT_ORDER.map((k) => [k, [] as string[]])) as Record<
    Element,
    string[]
  >;
  for (const p of payload.reveal ?? []) {
    const d = dominantElement(p.picks, `${p.id}|${day}`);
    if (d.element) {
      counts[d.element] += 1;
      byElement[d.element].push(p.name);
    }
  }
  const strongest = ELEMENT_ORDER.slice().sort((a, b) => counts[b] - counts[a])[0];
  const partySize = ELEMENT_ORDER.reduce((sum, k) => sum + counts[k], 0);

  if (!element) {
    return (
      <>
        <p className="eyebrow">
          <span className="n">사주</span>
          {day}
        </p>
        <div className="saju-grid">
          <article className="scroll-card" style={{ "--el": ELEMENTS.metal.color } as React.CSSProperties}>
            <div className="scroll-head">
              <div className="seal">觀</div>
              <h1 className="type-name">관망가</h1>
              <p className="type-line">한 번도 검을 뽑지 않고 끝까지 지켜본 사람</p>
            </div>
            <p className="fortune">
              오늘은 판을 읽는 날이었습니다. 보는 눈은 이미 충분히 길렀으니, 다음 여정에서는 한 번만
              골라보세요. 그때 사주가 제대로 나옵니다.
            </p>
          </article>
          <PartyElements counts={counts} strongest={strongest} partySize={partySize} />
        </div>
      </>
    );
  }

  const meta = ELEMENTS[element];
  const reading = readingFor(element, seed);
  const helpers = byElement[reading.helper].filter((n) => n !== mine?.name);

  return (
    <>
      <p className="eyebrow">
        <span className="n">사주</span>
        {day} · 마왕을 상대한 {total}번의 선택으로 풀었습니다
      </p>

      <div className="saju-grid">
        <article className="scroll-card" style={{ "--el": meta.color } as React.CSSProperties}>
          <div className="scroll-head">
            <div className="seal">{meta.han}</div>
            <h1 className="type-name">{meta.name}</h1>
            <p className="type-line">
              {meta.ko}({meta.han}) 기운 · {meta.line}
            </p>
          </div>
          <p className="fortune">{reading.luck}</p>
          <dl>
            <div className="row">
              <dt>오늘의 귀인</dt>
              <dd>
                <ElementChip element={reading.helper} />
                {helpers.length > 0 ? (
                  <span className="names"> — {helpers.slice(0, 3).join(", ")}</span>
                ) : (
                  <span className="names"> — 오늘 파티에는 없습니다. 밖에서 찾으세요</span>
                )}
              </dd>
            </div>
            <div className="row">
              <dt>조심할 것</dt>
              <dd>
                <ElementChip element={reading.rival} withName={false} /> {reading.rivalLine}
              </dd>
            </div>
            <div className="row">
              <dt>기운이 도는 때</dt>
              <dd>{reading.hour}</dd>
            </div>
            <div className="row">
              <dt>행운의 물건</dt>
              <dd>{reading.item}</dd>
            </div>
            <div className="row">
              <dt>오늘의 한 수</dt>
              <dd>
                <b>{reading.move}</b>
              </dd>
            </div>
          </dl>
        </article>

        <div>
          <Panel title="당신의 여정">
            <div className="recap">
              {Object.entries(picks)
                .map(([nodeId, choiceIndex]) => ({ node: STORY[nodeId], choiceIndex }))
                .filter((row) => !!row.node)
                .sort((a, b) => a.node.act - b.node.act)
                .map(({ node, choiceIndex }) => {
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
            <p className="note" style={{ marginTop: 14 }}>
              마왕을 상대하는 방식이 곧 일을 대하는 방식입니다.
            </p>
          </Panel>
          <PartyElements counts={counts} strongest={strongest} partySize={partySize} />
        </div>
      </div>
    </>
  );
}

function PartyElements({
  counts, strongest, partySize,
}: {
  counts: Record<Element, number>;
  strongest: Element;
  partySize: number;
}) {
  return (
    <Panel title={`오늘 이 파티의 기운 · ${partySize}명`}>
      <ElementBars counts={counts} />
      {partySize > 0 ? (
        <p className="note" style={{ marginTop: 13 }}>
          이 파티는{" "}
          <b style={{ color: ELEMENTS[strongest].color }}>
            {ELEMENTS[strongest].ko}({ELEMENTS[strongest].han})
          </b>{" "}
          기운이 가장 셉니다 — {ELEMENTS[strongest].line}.
        </p>
      ) : null}
    </Panel>
  );
}

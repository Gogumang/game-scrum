import { generateObject } from "ai";
import { z } from "zod";
import { ENDINGS, STORY, nodeOf } from "~/entities/act/model/story";
import { dominantElement, ELEMENTS, ELEMENT_ORDER, todayKey } from "~/entities/element/model/fortune";
import { aiSetupHint, textModel } from "~/shared/lib/ai.server";
import type { Analysis, RoomState } from "../model/types";
import { activePlayers, requireRoom, store, tallyNode } from "./store.server";

/**
 * AI 를 부르는 유일한 런타임 지점.
 * 장면 그림은 빌드 전에 만들어 두고(`pnpm scenes:generate`) 여기서는 손대지 않는다.
 *
 * 한 세션에 한 번만 돌고 결과는 방 상태에 저장된다.
 * 파티가 엔딩에 닿는 순간 미리 돌려두므로, 사람들이 엔딩과 사주를 읽는 동안 준비가 끝난다.
 */

const schema = z.object({
  headline: z.string().describe("이 팀을 한 문장으로"),
  traits: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .length(3)
    .describe("팀의 특징 3가지. title 은 4~10자, body 는 2~3문장"),
  watch: z.string().describe("이 팀이 주의할 점 2~3문장"),
  cheer: z.string().describe("내일의 스크럼을 응원하는 2문장"),
});

const LOCK_SECONDS = 120;

function buildPrompt(
  state: RoomState,
  players: { id: string; picks: Record<string, number> }[],
) {
  const visited = [...state.path, state.nodeId].filter((id) => STORY[id]);

  const journey = visited
    .map((id, i) => {
      const node = nodeOf(id)!;
      const { counts, voters } = tallyNode(players as never, id, node.choices.length);
      const parts = node.choices
        .map((c, ci) => `${c.text}〈${ELEMENTS[c.element].ko}〉${counts[ci]}표`)
        .join(" / ");
      return `${i + 1}. 「${node.when}」 — ${node.ask}\n   ${parts}   (선택한 사람 ${voters}명)`;
    })
    .join("\n");

  const ending = ENDINGS[state.nodeId];
  const skipped = Object.keys(STORY).filter((id) => !visited.includes(id));

  const dist = Object.fromEntries(ELEMENT_ORDER.map((k) => [k, 0])) as Record<string, number>;
  for (const p of players) {
    const { element } = dominantElement(p.picks ?? {}, p.id + todayKey());
    if (element) dist[element]++;
  }

  return `당신은 팀 워크숍 진행자입니다. 아래는 한 개발팀이 아이스브레이킹으로 진행한 '용사가 마왕을 무찌르러 가는 여정'의 결과입니다. 이 여정은 분기형이라, 다수결로 고른 선택이 다음 장소를 바꿉니다. 각 선택지에는 오행 성향이 숨어 있습니다 — 목(木) 일단 벌이고 추진, 화(火) 지금 직접 부딪침, 토(土) 사람과 조율 우선, 금(金) 기준과 원칙대로, 수(水) 돌아가고 흘려보냄.

[파티 인원] ${players.length}명

[파티가 실제로 지나온 길]
${journey}

[도달한 엔딩] ${ending ? `「${ending.title}」` : "(아직 진행 중)"}

[가지 않은 장소] ${skipped.length ? skipped.join(", ") : "없음"}

[개인 대표 기운 분포]
${ELEMENT_ORDER.map((k) => `${ELEMENTS[k].ko}(${ELEMENTS[k].han}) ${ELEMENTS[k].name}: ${dist[k]}명`).join(" · ")}

이 팀의 일하는 성향을 분석해 주세요. 규칙:
- 한국어 존댓말. 가볍고 유쾌하게, 스크럼에서 5분 안에 읽을 분량.
- 근거는 반드시 위 결과에서 가져오세요. 어느 갈림길에서 표가 어떻게 갈렸는지, 그래서 어디로 갔고 어디를 안 갔는지 구체적으로 언급할 것.
- 칭찬만 하지 마세요. 표가 갈린 지점에서 드러나는 이 팀의 진짜 긴장 지점을 최소 하나는 짚을 것.
- 개인을 평가하지 말고 팀의 경향만 말하세요. 데이터에 이름은 없습니다.`;
}

export type AnalysisOutcome =
  | { status: "ready"; analysis: Analysis }
  | { status: "running" }
  | { status: "empty" }
  | { status: "failed"; message: string };

/**
 * 이미 만들어 둔 분석이 있으면 그대로 돌려주고, 없으면 한 번만 만든다.
 * 다른 요청이 이미 만들고 있으면 "running" 을 돌려준다(중복 호출·중복 과금 방지).
 */
export async function ensureAnalysis(room: string): Promise<AnalysisOutcome> {
  const db = store();
  const state = await requireRoom(room);

  if (state.analysis?.sessionId === state.sessionId) {
    return { status: "ready", analysis: state.analysis };
  }

  const players = activePlayers(await db.listPlayers(room), state.sessionId);
  if (players.length === 0) return { status: "empty" };

  const lock = `analysis:${state.sessionId}`;
  const got = await db.acquireLock(room, lock, LOCK_SECONDS);
  if (!got) return { status: "running" };

  try {
    const { object } = await generateObject({
      model: textModel(),
      schema,
      prompt: buildPrompt(state, players),
    });

    const analysis: Analysis = { ...object, sessionId: state.sessionId };
    // 분석을 도는 동안 진행자가 다른 걸 눌렀을 수 있으니 최신 상태 위에 얹는다
    const latest = await requireRoom(room);
    if (latest.sessionId === state.sessionId) {
      await db.setState(room, { ...latest, analysis });
    }
    return { status: "ready", analysis };
  } catch (error) {
    // 잠금을 풀어야 진행자가 곧바로 다시 시도할 수 있다
    await db.releaseLock(room, lock);
    console.error("[strum] 팀 분석 실패:", error instanceof Error ? error.message : error);
    return { status: "failed", message: aiSetupHint() };
  }
}

/**
 * 결과를 기다리지 않고 미리 돌려 둔다.
 * 파티가 엔딩에 닿는 순간 호출되며, 실패해도 진행에는 영향을 주지 않는다.
 */
export function prewarmAnalysis(room: string) {
  void ensureAnalysis(room).catch((error) => {
    console.error("[strum] 분석 예열 실패", error);
  });
}

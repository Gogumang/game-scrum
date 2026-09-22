import { generateObject } from "ai";
import { z } from "zod";
import { ENDINGS, STORY, nodeOf } from "~/entities/act/model/story";
import { dominantElement, ELEMENTS, ELEMENT_ORDER, todayKey } from "~/entities/element/model/fortune";
import { aiSetupHint, reasoningOptions, textModel } from "~/shared/lib/ai.server";
import type { Analysis, RoomState } from "../model/types";
import { activePlayers, requireRoom, store, tallyNode } from "./store.server";
import { forgetRoom } from "~/entities/room/api/cache.server";

/**
 * AI 를 부르는 유일한 런타임 지점.
 * 장면 그림은 빌드 전에 만들어 두고(`pnpm scenes:generate`) 여기서는 손대지 않는다.
 *
 * 한 세션에 한 번만 돌고 결과는 방 상태에 저장된다.
 * 파티가 엔딩에 닿는 순간 미리 돌려두므로, 사람들이 엔딩과 사주를 읽는 동안 준비가 끝난다.
 */

const point = z.object({
  title: z.string().describe("4~12자 제목"),
  body: z.string().describe("2~3문장. 어느 갈림길의 어떤 표에서 그렇게 읽었는지 밝힐 것"),
});

const schema = z.object({
  headline: z.string().describe("이 팀이 일하는 방식을 한 문장으로"),
  style: z.string().describe("다수 선택에서 읽히는 일하는 방식 3~4문장"),
  strengths: z.array(point).min(2).max(3).describe("이 방식의 장점"),
  weaknesses: z.array(point).min(2).max(3).describe("이 방식의 단점·위험"),
  tryNext: z.string().describe("다음 스크럼에서 바로 해볼 것 한 가지, 2문장"),
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

  return `당신은 팀의 일하는 방식을 읽어주는 조직 코치입니다.

아래는 한 개발팀이 아이스브레이킹으로 진행한 '용사가 마왕을 무찌르러 가는 여정' 결과입니다.
분기형이라 **다수결로 고른 답이 실제로 다음 장소를 바꿨습니다.** 각 선택지에는 성향 태그가
숨어 있습니다 — 목(木) 일단 벌이고 추진, 화(火) 지금 직접 부딪침, 토(土) 사람과 조율 우선,
금(金) 기준과 원칙대로, 수(水) 돌아가고 흘려보냄.

[파티 인원] ${players.length}명

[갈림길마다 팀이 고른 것]
${journey}

[도달한 결말] ${ending ? `「${ending.title}」` : "(아직 진행 중)"}

[가지 않은 길] ${skipped.length ? skipped.join(", ") : "없음"}

[개인 성향 분포]
${ELEMENT_ORDER.map((k) => `${ELEMENTS[k].ko}: ${dist[k]}명`).join(" · ")}

이 팀이 **실제로 일하는 방식**을 읽어주세요. 게임 이야기가 아니라, 이 선택들이 회의실과
코드 리뷰와 장애 대응에서 어떻게 나타나는지를 말해야 합니다.

규칙:
- 한국어 존댓말. 스크럼에서 5분 안에 읽을 분량.
- **근거는 반드시 다수 선택에서 가져오세요.** "3번째 갈림길에서 5명 중 4명이 …를 골랐습니다"
  처럼 어느 지점의 어떤 표인지 밝힐 것. 근거 없는 일반론은 쓰지 마세요.
- 장점과 단점은 **같은 성향의 양면**으로 쓰세요. 장점 칸에 칭찬만 모으고 단점 칸에 다른
  얘기를 쓰면 안 됩니다. 빠르게 움직이는 팀이면 그 속도가 무엇을 놓치는지가 단점입니다.
- 표가 갈린 지점이 있으면 그게 이 팀의 진짜 긴장 지점입니다. 반드시 다루세요.
- 가지 않은 길도 정보입니다. 아무도 안 고른 방향이 이 팀의 사각지대일 수 있습니다.
- 개인을 평가하지 마세요. 데이터에 이름은 없습니다.
- 듣기 좋은 말로 끝내지 마세요. 단점은 실제로 불편해야 쓸모가 있습니다.`;
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
    const started = Date.now();
    const { object } = await generateObject({
      model: textModel(),
      schema,
      prompt: buildPrompt(state, players),
      providerOptions: reasoningOptions(),
    });
    console.log(`[strum] 팀 분석 ${Date.now() - started}ms`);

    const analysis: Analysis = { ...object, sessionId: state.sessionId };
    // 분석을 도는 동안 진행자가 다른 걸 눌렀을 수 있으니 최신 상태 위에 얹는다
    const latest = await requireRoom(room);
    if (latest.sessionId === state.sessionId) {
      await db.setState(room, { ...latest, analysis });
  forgetRoom(room);
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

import storyJson from "@content/story.json";
import type { Element, SceneName } from "./scenes";

/**
 * 시나리오는 content/story.json 에 있습니다. 이 파일은 그 내용을 읽어 쓰기 좋은 모양으로 바꿉니다.
 *
 * 여정은 일직선이 아니라 그래프입니다.
 * 각 마디의 선택지는 저마다 다음 마디를 가리키고, 파티의 다수 선택이 다음 장소를 정합니다.
 * 마지막 마디의 선택은 엔딩을 가릅니다.
 *
 * JSON 을 고친 뒤에는 `pnpm check:story` 로 검사하세요.
 * (끊어진 길, 닿지 않는 마디, 없는 장면, 오행 쏠림을 잡아줍니다. 빌드할 때도 자동으로 돕니다.)
 */

export type { Element, SceneName } from "./scenes";

export type NodeId = string;

export type Line = { speaker?: string; text: string };

export type StoryChoice = {
  text: string;
  element: Element;
  /** 이 선택이 다수가 되면 파티는 여기로 간다 */
  next: NodeId;
};

export type StoryNode = {
  id: NodeId;
  /** 진행 막대에 쓰는 막 번호 (1부터) */
  act: number;
  when: string;
  scene: SceneName;
  script: Line[];
  ask: string;
  choices: StoryChoice[];
};

export type Ending = {
  id: NodeId;
  act: number;
  scene: SceneName;
  title: string;
  when: string;
  script: Line[];
  /** 엔딩 화면에 남는 마무리 문장 */
  epilogue: string;
};

type StoryFile = {
  title: string;
  start: NodeId;
  totalActs: number;
  speakers: Record<string, string>;
  nodes: StoryNode[];
  endings: Omit<Ending, "act" | "when">[];
};

const file = storyJson as StoryFile;

export const STORY_TITLE = file.title;
export const START_NODE: NodeId = file.start;
export const TOTAL_ACTS = file.totalActs;
export const SPEAKER_COLORS: Record<string, string> = file.speakers ?? {};

export const STORY: Record<NodeId, StoryNode> = Object.fromEntries(
  file.nodes.map((node) => [node.id, node]),
);

export const ENDINGS: Record<NodeId, Ending> = Object.fromEntries(
  file.endings.map((ending) => [
    ending.id,
    { ...ending, act: file.totalActs + 1, when: "엔딩" },
  ]),
);

if (import.meta.env?.DEV) {
  // 개발 중에는 가장 흔한 실수만 즉시 알려준다. 전체 검사는 `pnpm check:story`.
  const known = new Set([...Object.keys(STORY), ...Object.keys(ENDINGS)]);
  for (const node of file.nodes) {
    for (const choice of node.choices) {
      if (!known.has(choice.next)) {
        console.error(
          `[story.json] "${node.id}" 의 선택지 "${choice.text}" 가 없는 마디 "${choice.next}" 를 가리킵니다.`,
        );
      }
    }
  }
  if (!known.has(file.start)) {
    console.error(`[story.json] start 로 지정한 "${file.start}" 마디가 없습니다.`);
  }
}

export const isEnding = (id: NodeId) => id in ENDINGS;

export const nodeOf = (id: NodeId): StoryNode | null => STORY[id] ?? null;

export const endingOf = (id: NodeId): Ending | null => ENDINGS[id] ?? null;

export const actOf = (id: NodeId): number => STORY[id]?.act ?? ENDINGS[id]?.act ?? 1;

export const sceneOf = (id: NodeId): SceneName =>
  STORY[id]?.scene ?? ENDINGS[id]?.scene ?? SCENE_FALLBACK;

const SCENE_FALLBACK: SceneName = "omen";

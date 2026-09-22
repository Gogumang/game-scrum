/**
 * 쓸 수 있는 장면 이름.
 * 장면은 코드와 묶여 있다 — 각각 sceneSpecs 의 벡터 그림이 있고,
 * public/scenes/<이름>.png 를 넣으면 그림으로 바뀐다.
 * 새 장면을 만들려면 여기에 이름을 더하고 sceneSpecs 에 사양을 넣으면 된다.
 */
export const SCENE_NAMES = [
  "omen",
  "bedroom",
  "tavern",
  "palace",
  "wilds",
  "forest",
  "cave",
  "ruins",
  "gate",
  "sewer",
  "throne",
  "endBlaze",
  "endSeal",
  "endTide",
  "endPact",
] as const;

export type SceneName = (typeof SCENE_NAMES)[number];

export const ELEMENT_NAMES = ["wood", "fire", "earth", "metal", "water"] as const;

export type Element = (typeof ELEMENT_NAMES)[number];

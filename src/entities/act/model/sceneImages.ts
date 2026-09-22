import type { SceneName } from "./story";

/**
 * 그림이 준비된 장면과 그 확장자. `pnpm scenes:sync` 가 public/scenes/ 를 훑어 채웁니다.
 * 여기 없는 장면은 벡터 배경으로 그려집니다.
 */
export const SCENE_IMAGES: Partial<Record<SceneName, string>> = {
  omen: "webp",
  bedroom: "webp",
  tavern: "webp",
  palace: "webp",
  wilds: "webp",
  forest: "webp",
  cave: "webp",
  ruins: "webp",
  gate: "webp",
  sewer: "webp",
  throne: "webp",
  endBlaze: "webp",
  endSeal: "webp",
  endTide: "webp",
  endPact: "webp",
};

export const hasImage = (name: SceneName) => name in SCENE_IMAGES;

export const imageSrc = (name: SceneName) => `/scenes/${name}.${SCENE_IMAGES[name]}`;

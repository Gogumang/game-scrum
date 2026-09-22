import { hasImage, imageSrc } from "../model/sceneImages";
import type { SceneName } from "../model/story";
import { SceneFrame } from "./SceneFrame";
import { SCENE_SPECS } from "./sceneSpecs";

/**
 * 장면 그림.
 * public/scenes/ 에 그림이 있으면 그 그림을, 없으면 벡터로 그린 장면을 쓴다.
 * 둘 다 밝은 색면 + 굵은 외곽선의 코믹 RPG 톤으로 맞춰져 있다.
 */
export function SceneArt({ name }: { name: SceneName }) {
  if (hasImage(name)) {
    return <img className="scene-img" src={imageSrc(name)} alt="" />;
  }
  return <SceneFrame id={name} spec={SCENE_SPECS[name] ?? SCENE_SPECS.omen} />;
}

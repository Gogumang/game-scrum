import type { SceneName } from "../model/story";
import { SceneFrame } from "./SceneFrame";
import { SCENE_SPECS } from "./sceneSpecs";

/**
 * 그림이 아직 없는 장면을 벡터로 그린다.
 * 그림이 다 준비되면 아무도 이 길로 오지 않으므로, 따로 떼어 필요할 때만 받는다.
 */
export default function VectorScene({ name }: { name: SceneName }) {
  return <SceneFrame id={name} spec={SCENE_SPECS[name] ?? SCENE_SPECS.omen} />;
}

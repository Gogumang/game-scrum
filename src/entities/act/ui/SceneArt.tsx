import { Suspense, lazy } from "react";
import { hasImage, imageSrc } from "../model/sceneImages";
import type { SceneName } from "../model/story";

/**
 * 장면 그림.
 * public/scenes/ 에 그림이 있으면 그것을, 없으면 벡터로 그린 장면을 쓴다.
 *
 * 벡터 쪽은 따로 떼어 두었다. 그림이 다 준비된 상태에서는 내려받지 않는다.
 */
const VectorScene = lazy(() => import("./VectorScene"));

export function SceneArt({ name }: { name: SceneName }) {
  if (hasImage(name)) {
    return <img className="scene-img" src={imageSrc(name)} alt="" decoding="async" />;
  }

  return (
    <Suspense fallback={<div className="scene-img scene-loading" />}>
      <VectorScene name={name} />
    </Suspense>
  );
}

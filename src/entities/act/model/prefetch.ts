import { useEffect } from "react";
import { hasImage, imageSrc } from "./sceneImages";
import { sceneOf, type StoryNode } from "./story";

/**
 * 다음에 갈 수 있는 장면 그림을 미리 받아둔다.
 *
 * 진행자가 넘기는 순간 그림을 그때부터 받으면 한 박자 비어 보인다.
 * 지금 마디에서 갈 수 있는 곳은 2~4군데뿐이라, 대사를 읽는 동안 미리 받아두면
 * 전환이 끊기지 않는다. 브라우저 캐시에 들어가므로 두 번 받지 않는다.
 */
export function usePrefetchNextScenes(node: StoryNode | null) {
  useEffect(() => {
    if (!node) return;

    const targets = new Set(node.choices.map((choice) => sceneOf(choice.next)));
    const images: HTMLImageElement[] = [];

    for (const scene of targets) {
      if (!hasImage(scene)) continue;
      const img = new Image();
      // 지금 보고 있는 화면보다 뒤로 미룬다
      img.fetchPriority = "low";
      img.decoding = "async";
      img.src = imageSrc(scene);
      images.push(img);
    }

    return () => {
      // 마디를 떠나면 아직 안 끝난 요청은 놓아준다
      for (const img of images) img.src = "";
    };
  }, [node]);
}

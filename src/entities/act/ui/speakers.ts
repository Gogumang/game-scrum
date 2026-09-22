import { SPEAKER_COLORS } from "../model/story";

/**
 * 화자마다 이름표 색을 다르게 줘서 누가 말하는지 바로 보이게 한다.
 * 색은 content/story.json 의 speakers 에서 관리한다.
 */
export const speakerColor = (name: string) => SPEAKER_COLORS[name] ?? "#7A6250";

import { TypewriterText } from "~/shared/ui";
import type { Line } from "../model/story";
import { speakerColor } from "./speakers";

export type DialogueBoxProps = {
  line: Line;
  /** 마지막 대사인지 — 안내 문구가 바뀐다 */
  last: boolean;
  /** 이미 다 읽은 상태면 타이핑 없이 바로 보여준다 */
  instant: boolean;
  /** 더 진행할 게 없으면 감춘다 */
  showTip: boolean;
  onAdvance: () => void;
};

/** 장면 아래 붙는 대사창. 누르면 다음 줄로 넘어간다. */
export function DialogueBox({ line, last, instant, showTip, onAdvance }: DialogueBoxProps) {
  const narration = !line.speaker;
  return (
    <button className="talk" type="button" onClick={onAdvance} aria-live="polite">
      {line.speaker ? (
        <span className="who" style={{ "--who": speakerColor(line.speaker) } as React.CSSProperties}>
          {line.speaker}
        </span>
      ) : null}
      <TypewriterText
        key={line.text}
        text={line.text}
        instant={instant}
        speed={narration ? 26 : 34}
        className={narration ? "said narration" : "said"}
      />
      {showTip ? (
        <span className="tip">
          {last ? "선택지 보기" : "계속"} <i>▼</i>
        </span>
      ) : null}
    </button>
  );
}

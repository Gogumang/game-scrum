import type { StoryChoice } from "~/entities/act";
import { OptionButton } from "~/shared/ui";

export type ChoiceListProps = {
  choices: StoryChoice[];
  /** null 이면 집계를 모르는 화면 — 막대도 숫자도 그리지 않는다 */
  counts: number[] | null;
  voters: number;
  /** 내가 고른 선택지 */
  picked: number | null;
  /** 더 이상 바꿀 수 없는 상태 */
  locked: boolean;
  onPick: (index: number) => void;
};

export function ChoiceList({ choices, counts, voters, picked, locked, onPick }: ChoiceListProps) {
  const max = counts ? Math.max(0, ...counts) : 0;

  return (
    <div className="choices">
      {choices.map((choice, i) => (
        <OptionButton
          key={choice.text}
          id={`choice-${i}`}
          hint={i + 1}
          label={choice.text}
          selected={picked === i}
          leading={!!counts && counts[i] === max && max > 0}
          disabled={locked}
          fillPercent={counts && voters > 0 ? Math.round((counts[i] / voters) * 100) : 0}
          count={counts ? `${counts[i]}명` : undefined}
          onSelect={() => onPick(i)}
        />
      ))}
    </div>
  );
}

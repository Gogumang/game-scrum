import type { ReactNode } from "react";
import { cx } from "../lib/cx";

export type OptionButtonProps = {
  label: ReactNode;
  /** 왼쪽 키캡. 보통 번호나 알파벳 */
  hint: ReactNode;
  onSelect?: () => void;
  selected?: boolean;
  /** 최다 득표 강조 */
  leading?: boolean;
  disabled?: boolean;
  /** 0~100. 뒤에 깔리는 막대 길이 */
  fillPercent?: number;
  /** 오른쪽 숫자. 집계를 감출 땐 넘기지 않는다 */
  count?: ReactNode;
  id?: string;
};

/** 투표·설문에 그대로 쓸 수 있는 선택지 버튼. 집계 막대가 배경으로 깔린다. */
export function OptionButton({
  label,
  hint,
  onSelect,
  selected = false,
  leading = false,
  disabled = false,
  fillPercent,
  count,
  id,
}: OptionButtonProps) {
  return (
    <button
      id={id}
      type="button"
      className={cx("choice", selected && "mine", leading && "top")}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className="fill" style={{ width: `${fillPercent ?? 0}%` }} />
      <span className="choice-in">
        <span className="key">{hint}</span>
        <span className="label">{label}</span>
        {count !== undefined ? <span className="count">{count}</span> : null}
      </span>
    </button>
  );
}

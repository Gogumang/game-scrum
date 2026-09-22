import { cx } from "../lib/cx";

export type ProgressBarProps = {
  value: number;
  max: number;
  /** 다 찼을 때 색을 바꾼다 */
  completeTone?: boolean;
  className?: string;
};

export function ProgressBar({ value, max, completeTone = true, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const full = max > 0 && value >= max;
  return (
    <div className={cx("gbar", completeTone && full && "full", className)}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

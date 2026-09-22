import { cx } from "../lib/cx";

export type SegmentMeterProps = {
  total: number;
  /** 진행 중인 칸 (0-base). total 이상이면 전부 지나간 것으로 본다. */
  current: number;
  /** 칸마다 쓸 색. 개수가 모자라면 앞에서부터 반복한다. */
  colors: string[];
};

/** 단계 진행 막대. 칸 하나 = 한 단계. */
export function SegmentMeter({ total, current, colors }: SegmentMeterProps) {
  return (
    <div className="meter">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cx("seg", i < current && "done", i === current && "now")}
          style={{ "--seg": colors[i % colors.length] } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import { cx } from "../lib/cx";

export type PanelProps = {
  title?: ReactNode;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** 옅은 테두리 카드. 제목과 오른쪽 배지를 함께 쓸 수 있다. */
export function Panel({ title, badge, className, children }: PanelProps) {
  return (
    <section className={cx("panel", className)}>
      {title ? (
        <h2>
          <span>{title}</span>
          {badge ? <span className="tagme">{badge}</span> : null}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

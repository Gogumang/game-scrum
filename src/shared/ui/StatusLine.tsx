import type { ReactNode } from "react";
import { cx } from "../lib/cx";

export function StatusDot() {
  return <span className="pulse" aria-hidden />;
}

/** 점 하나 + 한 줄 문구. 대기·진행 상태를 알릴 때. */
export function StatusLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("status", className)}>
      <StatusDot />
      {children}
    </p>
  );
}

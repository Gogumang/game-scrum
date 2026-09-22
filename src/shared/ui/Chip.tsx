import type { ReactNode } from "react";

export type ChipProps = {
  color: string;
  /** 앞에 붙는 한 글자 (한자, 이니셜 등) */
  glyph?: ReactNode;
  children?: ReactNode;
};

/** 색을 가진 작은 라벨. 오행·카테고리 표시에 쓴다. */
export function Chip({ color, glyph, children }: ChipProps) {
  return (
    <span className="chip" style={{ "--c": color } as React.CSSProperties}>
      {glyph ? <i>{glyph}</i> : null}
      {children}
    </span>
  );
}

import { ELEMENTS, ELEMENT_ORDER } from "../model/fortune";
import { ElementChip } from "./ElementChip";
import type { Element } from "~/entities/act";

/** 오행 분포 막대. 팀 전체 기운을 한눈에. */
export function ElementBars({ counts }: { counts: Record<Element, number> }) {
  const max = Math.max(1, ...ELEMENT_ORDER.map((k) => counts[k] ?? 0));
  return (
    <div className="dist">
      {ELEMENT_ORDER.map((k) => (
        <div key={k} className="dist-row" style={{ "--c": ELEMENTS[k].color } as React.CSSProperties}>
          <ElementChip element={k} />
          <span className="dist-bar">
            <span style={{ width: `${Math.round(((counts[k] ?? 0) / max) * 100)}%` }} />
          </span>
          <span className="dist-n">{counts[k] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

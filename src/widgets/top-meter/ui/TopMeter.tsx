import { TOTAL_ACTS, actOf, isEnding } from "~/entities/act";
import { ELEMENTS, ELEMENT_ORDER } from "~/entities/element";
import type { RoomPayload } from "~/entities/room";
import { SegmentMeter } from "~/shared/ui";

const COLORS = ELEMENT_ORDER.map((k) => ELEMENTS[k].color);

/** 상단 진행 막대 + 방 코드 + 인원. */
export function TopMeter({ payload, room }: { payload: RoomPayload | null; room: string }) {
  const nodeId = payload?.state.nodeId;
  const finished = nodeId ? isEnding(nodeId) : false;
  const act = nodeId ? actOf(nodeId) : 1;
  const people = payload?.roster.length ?? 0;

  return (
    <header className="topbar">
      <div className="topbar-in">
        <SegmentMeter
          total={TOTAL_ACTS}
          current={finished ? TOTAL_ACTS : act - 1}
          colors={COLORS}
        />
        <div className="meter-row">
          <span className="brand">
            전자금융의 <em>기묘한 하루</em>
          </span>
          <span className="meter-note">
            <span className="roomcode">{room}</span>
            {" · "}
            {finished ? "여정 종료" : `제 ${act} 막 / ${TOTAL_ACTS}`}
            {" · "}
            {people}명 참여
          </span>
        </div>
      </div>
    </header>
  );
}

import { cx } from "~/shared/lib";
import type { RosterEntry } from "~/entities/room";

export type PlayerListProps = {
  players: RosterEntry[];
  /** 내 id — "나" 배지를 붙인다 */
  meId?: string | null;
  /** true 면 전원을 완료 상태로 표시 (사주 단계) */
  allDone?: boolean;
  emptyText?: string;
};

/** 참여자 명단. 점 색으로 완료 여부를 보여준다. */
export function PlayerList({
  players,
  meId,
  allDone = false,
  emptyText = "아직 아무도 없습니다",
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <ul className="party">
        <li>
          <span className="pdot" />
          <span className="pname">{emptyText}</span>
        </li>
      </ul>
    );
  }

  return (
    <ul className="party">
      {players.map((p) => (
        <li key={p.id} className={cx((allDone || p.voted) && "ok")}>
          <span className="pdot" />
          <span className="pname">{p.name}</span>
          {p.id === meId ? <span className="pme">나</span> : null}
        </li>
      ))}
    </ul>
  );
}

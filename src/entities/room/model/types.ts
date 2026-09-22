import type { NodeId } from "~/entities/act/model/story";

export type Phase = "vote" | "result" | "ending";

export type Trait = { title: string; body: string };

export type Analysis = {
  headline: string;
  traits: Trait[];
  watch: string;
  cheer: string;
  sessionId: string;
};

export type RoomState = {
  /** 파티가 지금 서 있는 마디. 엔딩 id 일 수도 있다. */
  nodeId: NodeId;
  /** 지나온 마디들 (현재는 포함하지 않는다) */
  path: NodeId[];
  phase: Phase;
  /** 새 여정을 시작하면 바뀐다. 이전 세션의 표와 분석은 자동으로 무시된다. */
  sessionId: string;
  analysis: Analysis | null;
  createdAt: number;
};

/** 마디 id -> 고른 선택지 번호 */
export type Picks = Record<NodeId, number>;

export type Player = {
  id: string;
  name: string;
  picks: Picks;
  sessionId: string;
  joinedAt: number;
};

export type RosterEntry = { id: string; name: string; voted: boolean };

export type RoomPayload = {
  room: string;
  state: RoomState;
  roster: RosterEntry[];
  /** counts 는 진행자에게만 내려간다. 참여자에게는 null 이라 결과를 알 수 없다. */
  tally: { counts: number[] | null; voters: number };
  me: { id: string; name: string; picks: Picks } | null;
  /** 엔딩에서만 내려온다. 그 전엔 남의 선택을 보내지 않는다. */
  reveal: { id: string; name: string; picks: Picks }[] | null;
  /** 이 응답이 진행자용인지 */
  isHost: boolean;
  driver: "redis" | "memory";
};

export type HostCommand = "reveal" | "next" | "prev" | "back" | "restart";

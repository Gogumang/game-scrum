import { STORY, type Element, type NodeId } from "~/entities/act/model/story";

export const ELEMENTS: Record<
  Element,
  { han: string; ko: string; name: string; line: string; color: string }
> = {
  wood: { han: "木", ko: "목", name: "추진가", line: "일단 만들고 본다", color: "#3E7A55" },
  fire: { han: "火", ko: "화", name: "발화가", line: "지금, 직접 부딪친다", color: "#B3352C" },
  earth: { han: "土", ko: "토", name: "중재가", line: "사람부터 본다", color: "#B5811B" },
  metal: { han: "金", ko: "금", name: "원칙가", line: "기준대로 자른다", color: "#6B7078" },
  water: { han: "水", ko: "수", name: "유연가", line: "돌아서 흘려보낸다", color: "#2B5D87" },
};

export const ELEMENT_ORDER: Element[] = ["wood", "fire", "earth", "metal", "water"];

/** 상생 — 나를 낳아주는 기운이 오늘의 귀인 */
export const HELPER: Record<Element, Element> = {
  wood: "water",
  fire: "wood",
  earth: "fire",
  metal: "earth",
  water: "metal",
};

/** 상극 — 나를 누르는 기운이 오늘 조심할 것 */
export const RIVAL: Record<Element, Element> = {
  wood: "metal",
  fire: "water",
  earth: "wood",
  metal: "fire",
  water: "earth",
};

export const RIVAL_LINE: Record<Element, string> = {
  metal: "기준을 앞세운 지적",
  water: "흐지부지 미뤄지는 결정",
  wood: "갑자기 늘어나는 새 일",
  fire: "급하게 치고 들어오는 요청",
  earth: "거절을 못 해서 떠맡는 일",
};

const LUCK: Record<Element, string[]> = {
  wood: [
    "오늘 벌여둔 일이 생각보다 멀리 갑니다. 손대다 만 브랜치 중 하나는 오늘 안에 끝이 보입니다.",
    "시작하기 좋은 날입니다. 미루던 리팩터링을 오늘 열면 의외로 술술 풀립니다.",
    "오늘의 아이디어는 말하는 순간 힘이 붙습니다. 스탠드업에서 한 번 꺼내보세요.",
  ],
  fire: [
    "말이 잘 통하는 날입니다. 미뤄둔 대화 하나가 오늘은 5분이면 끝납니다.",
    "에너지가 한 발 앞서갑니다. 좋은 신호지만 오후 3시 이후엔 한 박자 쉬어가세요.",
    "오늘 당신의 한마디가 회의 방향을 바꿉니다. 아껴두지 마세요.",
  ],
  earth: [
    "오늘 당신이 가운데 서면 일이 굴러갑니다. 애매하게 떠 있던 합의가 정리됩니다.",
    "여기저기서 당신을 찾는 날입니다. 다 받다 보면 정작 내 일이 밀립니다.",
    "조용히 도와둔 일이 오늘 드러납니다. 굳이 숨기지 않아도 되는 날입니다.",
  ],
  metal: [
    "기준이 힘을 발휘하는 날입니다. 당신이 그어둔 선이 오늘 팀을 한 번 구합니다.",
    "디테일이 유난히 잘 보입니다. 오늘 본 리뷰에서 큰 걸 하나 잡아냅니다.",
    "단호함이 필요한 날입니다. 다만 말끝은 부드럽게. 내용은 이미 충분히 날카롭습니다.",
  ],
  water: [
    "무리하지 않아도 되는 날입니다. 오늘은 버틴 것 자체가 성과입니다.",
    "막힌 곳은 돌아가면 길이 보입니다. 정면으로 붙던 문제에 오늘은 우회로를 내세요.",
    "조용한 하루 같지만 뒤에서 많은 것이 정리됩니다. 알림을 잠시 꺼도 괜찮습니다.",
  ],
};

const MOVE: Record<Element, string[]> = {
  wood: [
    "가장 작은 PR 하나를 오늘 안에 머지하기",
    "“해볼게요”를 한 번만 더 말해보기",
    "시작해두고 아직 안 알린 일, 오늘 공유하기",
  ],
  fire: [
    "슬랙으로 세 번 오갈 일을 통화 한 번으로 끝내기",
    "고맙다는 말을 오늘 한 사람에게 먼저 하기",
    "울컥하면 전송 대신 자리에서 일어나기",
  ],
  earth: [
    "말 없던 팀원에게 먼저 한 줄 묻기",
    "오늘 하나는 정중하게 거절하기",
    "구두로 합의된 내용을 글로 남겨두기",
  ],
  metal: [
    "미뤄둔 “아니오”를 오늘 말하기",
    "문서에 없는 암묵적 규칙 하나를 적어두기",
    "완벽 대신 90%에서 넘겨보기",
  ],
  water: [
    "안 될 것 같은 일 하나를 오늘 놓아주기",
    "30분만 알림 끄고 한 가지만 하기",
    "도움 요청을 오늘 한 번 해보기",
  ],
};

const HOURS = [
  "오전 10시 30분",
  "오전 11시",
  "점심 직후 오후 1시 20분",
  "오후 2시",
  "오후 3시 40분",
  "퇴근 30분 전",
];

const ITEMS = [
  "따뜻한 아메리카노",
  "창가 자리",
  "이어폰 한쪽",
  "두 번째 모니터",
  "초록색 펜",
  "엘리베이터 대신 계단",
];

function hash(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const draw = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length) % arr.length];

/** 마디 id -> 고른 선택지 번호 */
export type Picks = Record<NodeId, number>;

/** 한 사람의 선택 기록에서 대표 기운을 뽑는다. 동점이면 seed 로 가른다. */
export function dominantElement(picks: Picks, seed: string) {
  const counts = {} as Record<Element, number>;
  ELEMENT_ORDER.forEach((k) => (counts[k] = 0));
  let n = 0;

  for (const [nodeId, choiceIndex] of Object.entries(picks ?? {})) {
    const choice = STORY[nodeId]?.choices[choiceIndex];
    if (choice) {
      counts[choice.element]++;
      n++;
    }
  }
  if (!n) return { element: null as Element | null, counts, total: 0 };

  const max = Math.max(...ELEMENT_ORDER.map((k) => counts[k]));
  const tied = ELEMENT_ORDER.filter((k) => counts[k] === max);
  const element =
    tied.length === 1 ? tied[0] : tied[Math.floor(rng(hash(seed))() * tied.length) % tied.length];

  return { element, counts, total: n };
}

export type Reading = {
  element: Element;
  luck: string;
  helper: Element;
  rival: Element;
  rivalLine: string;
  hour: string;
  item: string;
  move: string;
};

export function readingFor(element: Element, seed: string): Reading {
  const r = rng(hash(seed));
  return {
    element,
    luck: draw(LUCK[element], r),
    helper: HELPER[element],
    rival: RIVAL[element],
    rivalLine: RIVAL_LINE[RIVAL[element]],
    hour: draw(HOURS, r),
    item: draw(ITEMS, r),
    move: draw(MOVE[element], r),
  };
}

export const todayKey = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());

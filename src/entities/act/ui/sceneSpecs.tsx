import type { SceneName } from "../model/story";
import type { SceneSpec } from "./SceneFrame";

/**
 * 장면 배경 사양. 밝은 색면 + 굵은 외곽선의 코믹 RPG 톤으로 맞춰져 있습니다.
 * public/scenes/<이름>.png 가 생기면 그림이 이 자리를 대신합니다
 * (`pnpm scenes:generate`).
 */

const LINE = "#3A2A20";
const ink = { stroke: LINE, strokeWidth: 5, strokeLinejoin: "round" as const };

const at = (x: number, y: number, scale = 1) => ({ transform: `translate(${x} ${y}) scale(${scale})` });

/** 동글동글한 나무 */
const bush = (x: number, y: number, r: number, fill = "#5FA84E") => (
  <g key={`b${x}-${y}`} {...ink}>
    <rect x={x - 7} y={y} width="14" height={r * 0.9} rx="6" fill="#8A6A3E" />
    <circle cx={x} cy={y - r * 0.2} r={r} fill={fill} />
    <circle cx={x - r * 0.7} cy={y + r * 0.2} r={r * 0.7} fill={fill} />
    <circle cx={x + r * 0.7} cy={y + r * 0.2} r={r * 0.7} fill={fill} />
  </g>
);

/** 뭉게구름 */
const cloud = (x: number, y: number, s: number) => (
  <g key={`c${x}-${y}`} {...ink} fill="#FFFFFF">
    <circle cx={x} cy={y} r={26 * s} />
    <circle cx={x + 30 * s} cy={y + 6 * s} r={20 * s} />
    <circle cx={x - 28 * s} cy={y + 8 * s} r={18 * s} />
    <rect x={x - 42 * s} y={y} width={84 * s} height={22 * s} rx={11 * s} />
  </g>
);

/** 통나무 집 */
const hut = (x: number, y: number, w: number, roof = "#D4593F") => (
  <g key={`h${x}`} {...ink}>
    <rect x={x} y={y} width={w} height={w * 0.8} rx="6" fill="#E8C98E" />
    <path d={`M${x - 12} ${y} L${x + w / 2} ${y - w * 0.52} L${x + w + 12} ${y}z`} fill={roof} />
    <rect x={x + w * 0.36} y={y + w * 0.34} width={w * 0.28} height={w * 0.46} rx="4" fill="#8A6A3E" />
  </g>
);

/** 돌기둥 */
const pillar = (x: number, y: number, h: number, w: number, broken = false) => (
  <g key={`p${x}`} {...ink} fill="#EDE0C4">
    <rect x={x} y={y} width={w} height={h} rx="4" />
    {!broken ? <rect x={x - 10} y={y - 14} width={w + 20} height="16" rx="6" /> : null}
    <rect x={x - 12} y={y + h - 16} width={w + 24} height="18" rx="6" />
  </g>
);

export const SCENE_SPECS: Record<SceneName, SceneSpec> = {
  /* ── 1막 ── */
  omen: {
    sky: ["#6FC5EE", "#A8DCF2", "#D9F0D2"],
    glow: { x: 740, y: 150, r: 300, color: "#E2553B" },
    ridges: [
      { y: 372, amp: 54, fill: "#8CC98F", seed: 5, steps: 7 },
      { y: 438, amp: 30, fill: "#6FB56B", seed: 19 },
      { y: 496, amp: 14, fill: "#58A057", seed: 41 },
    ],
    props: (
      <g>
        {cloud(150, 96, 1)}
        {cloud(430, 64, 0.72)}
        {/* 하늘의 균열 */}
        <g {...ink} fill="#E2553B">
          <polygon points="700,0 726,0 706,96 732,88 686,220 700,132 674,142 706,52" />
        </g>
        {/* 마왕성 */}
        <g {...ink}>
          <rect x="672" y="196" width="72" height="180" rx="6" fill="#7A4FA0" />
          <polygon points="660,196 708,128 756,196" fill="#5B3A7A" />
          <rect x="762" y="248" width="56" height="128" rx="6" fill="#7A4FA0" />
          <polygon points="752,248 790,196 828,248" fill="#5B3A7A" />
          <rect x="694" y="250" width="28" height="34" rx="14" fill="#F2C255" />
        </g>
        {bush(96, 420, 46)}
        {bush(880, 452, 38, "#4E9645")}      </g>
    ),
  },

  /* ── 2막 ── */
  bedroom: {
    sky: ["#FFE9A8", "#FFD98A", "#F6C36B"],
    glow: { x: 700, y: 210, r: 300, color: "#E2553B" },
    interior: true,
    ridges: [{ y: 400, amp: 0, fill: "#C98A5A", seed: 3, steps: 2 }],
    props: (
      <g>
        <g {...ink}>
          {/* 창 */}
          <rect x="580" y="80" width="240" height="210" rx="10" fill="#F09B72" />
          <rect x="580" y="80" width="240" height="210" rx="10" fill="none" />
          <rect x="694" y="80" width="12" height="210" fill={LINE} stroke="none" />
          <rect x="580" y="178" width="240" height="12" fill={LINE} stroke="none" />
          {/* 침대 */}
          <rect x="90" y="330" width="360" height="110" rx="16" fill="#FFF6E3" />
          <rect x="90" y="300" width="80" height="140" rx="14" fill="#C98A5A" />
          <path d="M180 346h230c18 0 30 12 30 28v66H180z" fill="#7BB661" />
          {/* 던져둔 검 */}
          <g transform="rotate(-8 640 452)">
            <rect x="560" y="444" width="160" height="16" rx="8" fill="#C9D2DC" />
            <rect x="700" y="436" width="40" height="32" rx="10" fill="#8A6A3E" />
          </g>
        </g>      </g>
    ),
  },

  tavern: {
    sky: ["#B5773F", "#9A5F33", "#7E4C2A"],
    glow: { x: 480, y: 170, r: 360, color: "#FFD98A" },
    interior: true,
    ridges: [{ y: 412, amp: 0, fill: "#8A5A30", seed: 7, steps: 2 }],
    props: (
      <g>
        <g {...ink}>
          {/* 들보 */}
          <rect x="0" y="52" width="960" height="30" rx="8" fill="#6B4A32" />
          {/* 등불 */}
          <rect x="196" y="82" width="10" height="48" fill="#6B4A32" />
          <circle cx="201" cy="152" r="34" fill="#FFD98A" />
          <rect x="756" y="82" width="10" height="48" fill="#6B4A32" />
          <circle cx="761" cy="152" r="34" fill="#FFD98A" />
          {/* 카운터 */}
          <rect x="0" y="396" width="960" height="40" rx="10" fill="#8A6A3E" />
          {/* 탁자 */}
          <rect x="330" y="330" width="300" height="34" rx="12" fill="#C98A5A" />
          <rect x="360" y="360" width="22" height="60" rx="8" fill="#8A6A3E" />
          <rect x="578" y="360" width="22" height="60" rx="8" fill="#8A6A3E" />
          {/* 맥주잔 */}
          <rect x="420" y="296" width="42" height="40" rx="8" fill="#FFD98A" />
          <rect x="506" y="296" width="42" height="40" rx="8" fill="#FFD98A" />
        </g>      </g>
    ),
  },

  palace: {
    sky: ["#FFF3D6", "#FFE6B8", "#F3D49A"],
    glow: { x: 480, y: 150, r: 340, color: "#FFD98A" },
    interior: true,
    ridges: [{ y: 430, amp: 0, fill: "#D9B888", seed: 11, steps: 2 }],
    props: (
      <g>
        {pillar(60, 40, 400, 64)}
        {pillar(200, 80, 360, 48)}
        {pillar(712, 80, 360, 48)}
        {pillar(836, 40, 400, 64)}
        <g {...ink}>
          {/* 붉은 융단 */}
          <polygon points="380,430 580,430 660,540 300,540" fill="#D4593F" />
          {/* 옥좌 */}
          <rect x="412" y="250" width="136" height="180" rx="12" fill="#E9A62B" />
          <polygon points="420,250 480,180 540,250" fill="#E2553B" />
          {/* 서류 더미 */}
          <rect x="612" y="368" width="84" height="20" rx="6" fill="#FFF6E3" />
          <rect x="606" y="348" width="96" height="20" rx="6" fill="#FFF6E3" />
          <rect x="616" y="328" width="76" height="20" rx="6" fill="#FFF6E3" />
        </g>      </g>
    ),
  },

  wilds: {
    sky: ["#7FCDEE", "#BEE4F2", "#F4E3B0"],
    glow: { x: 800, y: 120, r: 260, color: "#FFE9A8" },
    ridges: [
      { y: 356, amp: 62, fill: "#E0BE84", seed: 3, steps: 6 },
      { y: 424, amp: 34, fill: "#D0A868", seed: 23 },
      { y: 486, amp: 16, fill: "#BE9454", seed: 47 },
    ],
    props: (
      <g>
        {cloud(200, 92, 0.9)}
        {cloud(640, 68, 0.66)}
        <g {...ink}>
          <circle cx="812" cy="118" r="52" fill="#FFE9A8" />
          {/* 마른 나무 */}
          <rect x="132" y="300" width="18" height="150" rx="8" fill="#8A6A3E" />
          <rect x="88" y="322" width="60" height="14" rx="7" fill="#8A6A3E" transform="rotate(-28 118 329)" />
          <rect x="140" y="310" width="56" height="14" rx="7" fill="#8A6A3E" transform="rotate(26 168 317)" />
          {/* 선인장 */}
          <rect x="852" y="372" width="30" height="86" rx="14" fill="#5FA84E" />
          <rect x="826" y="392" width="30" height="20" rx="10" fill="#5FA84E" />
        </g>      </g>
    ),
  },

  /* ── 3막 ── */
  forest: {
    sky: ["#CFEAD9", "#B3DCC6", "#8FC9AE"],
    glow: { x: 480, y: 200, r: 420, color: "#FFFFFF" },
    ridges: [{ y: 470, amp: 16, fill: "#6FB56B", seed: 31 }],
    props: (
      <g>
        {[100, 250, 700, 860].map((x, i) => bush(x, 300 + (i % 2) * 40, 74, "#4E9645"))}
        {[40, 180, 330, 620, 780, 920].map((x, i) => bush(x, 380 + (i % 2) * 30, 58))}
        {/* 안개 띠 */}
        <rect x="0" y="286" width="960" height="70" fill="#FFFFFF" opacity="0.5" />
        <rect x="0" y="392" width="960" height="60" fill="#FFFFFF" opacity="0.62" />
        {/* 같은 자리 발자국 */}
        <g fill={LINE} opacity="0.35">
          {[420, 470, 520, 570].map((x, i) => (
            <ellipse key={i} cx={x} cy={498 + (i % 2) * 12} rx="16" ry="9" />
          ))}
        </g>      </g>
    ),
  },

  cave: {
    sky: ["#6B5A7A", "#5A4A68", "#4A3C58"],
    glow: { x: 480, y: 230, r: 330, color: "#FFD98A" },
    interior: true,
    ridges: [{ y: 452, amp: 18, fill: "#3E3352", seed: 13 }],
    props: (
      <g {...ink}>
        {/* 두 갈래 굴 */}
        <path d="M110 452V300c0-72 52-118 116-118s116 46 116 118v152z" fill="#2E2640" />
        <path d="M618 452V300c0-72 52-118 116-118s116 46 116 118v152z" fill="#2E2640" />
        {/* 가운데 바위 기둥 */}
        <rect x="392" y="120" width="176" height="336" rx="18" fill="#7A6890" />
        {/* 횃불 */}
        <rect x="470" y="212" width="20" height="74" rx="8" fill="#8A6A3E" />
        <path d="M480 132c26 30 38 52 38 70a38 38 0 1 1-76 0c0-18 12-40 38-70z" fill="#F2A03E" />
        <path d="M480 178c12 16 18 28 18 38a18 18 0 1 1-36 0c0-10 6-22 18-38z" fill="#FFE9A8" strokeWidth="3.5" />      </g>
    ),
  },

  ruins: {
    sky: ["#8FD3F0", "#BEE4F2", "#E4D7B4"],
    glow: { x: 480, y: 180, r: 320, color: "#FFF6E3" },
    ridges: [{ y: 452, amp: 22, fill: "#C9B68C", seed: 17 }],
    props: (
      <g>
        {cloud(760, 92, 0.8)}
        {pillar(110, 160, 300, 52, true)}
        {pillar(238, 226, 234, 44, true)}
        {pillar(700, 190, 270, 46, true)}
        {pillar(828, 150, 310, 54)}
        {/* 이름이 새겨진 벽 */}
        <g {...ink}>
          <rect x="364" y="182" width="232" height="272" rx="10" fill="#EDE0C4" />
          <g fill="#A99280" stroke="none">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x="394" y={216 + i * 30} width={172 - (i % 3) * 38} height="10" rx="5" />
            ))}
          </g>
          <rect x="394" y="428" width="120" height="10" rx="5" fill="#E2553B" stroke="none" />
        </g>      </g>
    ),
  },

  /* ── 4막 ── */
  gate: {
    sky: ["#7EA8D8", "#9BBEE4", "#B8CFE8"],
    glow: { x: 480, y: 250, r: 340, color: "#E2553B" },
    ridges: [{ y: 462, amp: 12, fill: "#6E5F84", seed: 29 }],
    props: (
      <g {...ink}>
        {/* 성벽 */}
        <rect x="0" y="60" width="960" height="410" fill="#8A7AA4" />
        {/* 대문 */}
        <path d="M268 470V262c0-118 94-190 212-190s212 72 212 190v208z" fill="#5B3A7A" />
        <rect x="468" y="76" width="24" height="394" fill="#E2553B" />
        {/* 철대 */}
        <rect x="296" y="258" width="368" height="24" rx="10" fill="#8A6A3E" />
        <rect x="296" y="364" width="368" height="24" rx="10" fill="#8A6A3E" />
        {/* 룬 */}
        {[[366, 196], [480, 166], [594, 196]].map(([x, y], i) => (
          <g key={i}>
            <polygon
              points={`${x},${y - 26} ${x + 22},${y} ${x},${y + 26} ${x - 22},${y}`}
              fill="#F2C255"
            />
            <circle cx={x} cy={y} r="7" fill={LINE} stroke="none" />
          </g>
        ))}
        {/* 횃불 */}
        {[150, 810].map((x, i) => (
          <g key={i}>
            <rect x={x - 11} y="250" width="22" height="120" rx="9" fill="#8A6A3E" />
            <path d={`M${x} 174c26 30 38 52 38 70a38 38 0 1 1-76 0c0-18 12-40 38-70z`} fill="#F2A03E" />
          </g>
        ))}      </g>
    ),
  },

  sewer: {
    sky: ["#5E8A82", "#4C7570", "#3E625E"],
    glow: { x: 480, y: 210, r: 300, color: "#9FE0C0" },
    interior: true,
    ridges: [{ y: 400, amp: 0, fill: "#3A5A56", seed: 3, steps: 2 }],
    props: (
      <g {...ink}>
        <path d="M236 430V276c0-96 72-158 244-158s244 62 244 158v154z" fill="#2E4A48" />
        {/* 물 */}
        <rect x="0" y="424" width="960" height="120" fill="#5FB08E" />
        <g stroke="none" fill="#8FD3B4">
          {[110, 340, 580, 820].map((x, i) => (
            <rect key={i} x={x} y={452 + (i % 2) * 30} width="120" height="10" rx="5" />
          ))}
        </g>
        {/* 배수구 */}
        <rect x="742" y="268" width="110" height="110" rx="10" fill="#3E625E" />
        <g stroke="none" fill="#2E4A48">
          {[0, 1, 2].map((i) => (
            <rect key={i} x="754" y={286 + i * 32} width="86" height="14" rx="7" />
          ))}
        </g>      </g>
    ),
  },

  /* ── 5막 ── */
  throne: {
    sky: ["#4A2A5E", "#5E3470", "#7A4080"],
    glow: { x: 480, y: 230, r: 380, color: "#E2553B" },
    interior: true,
    ridges: [{ y: 442, amp: 0, fill: "#3A2050", seed: 5, steps: 2 }],
    props: (
      <g>
        <g {...ink}>
          {/* 기둥 */}
          <rect x="40" y="0" width="96" height="450" rx="10" fill="#5B3A7A" />
          <rect x="824" y="0" width="96" height="450" rx="10" fill="#5B3A7A" />
          {/* 단 */}
          <polygon points="300,446 660,446 710,500 250,500" fill="#3A2050" />
          {/* 옥좌 */}
          <rect x="378" y="230" width="204" height="216" rx="14" fill="#3E2456" />
          <polygon points="386,230 480,120 574,230" fill="#5B3A7A" />
          {/* 화로 */}
          {[200, 760].map((x, i) => (
            <g key={i}>
              <polygon points={`${x - 34},446 ${x + 34},446 ${x + 22},368 ${x - 22},368`} fill="#5B3A7A" />
              <path d={`M${x} 302c22 26 32 44 32 60a32 32 0 1 1-64 0c0-16 10-34 32-60z`} fill="#F2A03E" />
            </g>
          ))}
          {/* 붉은 융단 */}
          <polygon points="390,500 570,500 660,540 300,540" fill="#D4593F" />
        </g>      </g>
    ),
  },

  /* ── 엔딩 ── */
  endBlaze: {
    sky: ["#FFC46B", "#F58C4A", "#E2553B"],
    glow: { x: 560, y: 260, r: 420, color: "#FFE9A8" },
    ridges: [{ y: 452, amp: 24, fill: "#B8452F", seed: 7 }],
    props: (
      <g>
        <g {...ink}>
          {/* 무너지는 성 */}
          <polygon points="560,440 574,190 636,190 644,440" fill="#7A4FA0" />
          <polygon points="660,440 690,110 752,130 760,440" fill="#5B3A7A" />
          {/* 튀어오른 파편 */}
          {[[300, 180], [820, 150], [420, 120]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="34" height="34" rx="8" fill="#7A4FA0" transform={`rotate(${20 + i * 25} ${x} ${y})`} />
          ))}
          {/* 불길 */}
          {[520, 600, 700].map((x, i) => (
            <path key={i} d={`M${x} ${300 - i * 30}c30 40 44 66 44 86a44 44 0 1 1-88 0c0-20 14-46 44-86z`} fill="#FFD98A" />
          ))}
        </g>      </g>
    ),
  },

  endSeal: {
    sky: ["#7FB6E8", "#A8D0F0", "#CFE6F6"],
    glow: { x: 480, y: 250, r: 340, color: "#FFFFFF" },
    ridges: [{ y: 462, amp: 14, fill: "#8A9BC4", seed: 17 }],
    props: (
      <g>
        {cloud(180, 96, 0.9)}
        {cloud(800, 76, 0.7)}
        <g {...ink}>
          <path d="M300 462V270c0-110 80-178 180-178s180 68 180 178v192z" fill="#5B3A7A" />
          <rect x="468" y="96" width="24" height="366" fill="#8A9BC4" />
          {/* 봉인 문양 */}
          {[[392, 214], [480, 184], [568, 214]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="30" fill="#BEE4F2" />
              <polygon points={`${x},${y - 16} ${x + 14},${y} ${x},${y + 16} ${x - 14},${y}`} fill="#4C8FD1" strokeWidth="3.5" />
            </g>
          ))}
        </g>      </g>
    ),
  },

  endTide: {
    sky: ["#F0A6C0", "#FFC9A8", "#FFE9A8"],
    glow: { x: 480, y: 400, r: 420, color: "#FFF6E3" },
    ridges: [
      { y: 392, amp: 44, fill: "#C98AA8", seed: 11, steps: 7 },
      { y: 452, amp: 24, fill: "#A87090", seed: 47 },
      { y: 500, amp: 12, fill: "#8A5A78", seed: 83 },
    ],
    props: (
      <g>
        <g {...ink}>
          <circle cx="480" cy="398" r="66" fill="#FFF6E3" />
        </g>
        {/* 지평선에서 오는 동료들 */}      </g>
    ),
  },

  endPact: {
    sky: ["#8A5FB0", "#A87BC8", "#C9A8DE"],
    glow: { x: 480, y: 270, r: 360, color: "#F2C255" },
    ridges: [{ y: 452, amp: 18, fill: "#6B4090", seed: 29 }],
    props: (
      <g>        {/* 둘 사이의 계약서 */}
        <g {...ink} transform="rotate(-6 480 350)">
          <rect x="426" y="290" width="108" height="130" rx="10" fill="#FFF6E3" />
          <g stroke="none" fill="#A99280">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x="448" y={314 + i * 20} width={66 - (i % 2) * 22} height="8" rx="4" />
            ))}
          </g>
          <circle cx="504" cy="396" r="13" fill="#E2553B" stroke="none" />
        </g>
      </g>
    ),
  },
};

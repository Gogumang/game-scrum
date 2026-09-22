# 전자금융의 기묘한 하루

스크럼 아이스브레이킹용 분기형 선택 게임. 팀이 각자 폰에서 고르고, 다수 선택이 다음 장소를 바꾸고,
마지막엔 개인 사주와 AI 팀 분석으로 마무리합니다.

- **분기형** — 5막 일직선이 아니라 그래프입니다. 어디서 갈렸느냐에 따라 가는 장소와 엔딩이 달라집니다.
- **다수결 진행** — 진행자가 결과를 공개하면 최다 득표 선택지가 다음 마디를 정합니다.
- **숨은 오행 태그** — 선택지마다 목화토금수 태그가 숨어 있고, 그 사람이 실제로 고른 것들로 사주를 뽑습니다.

## 시작하기

```bash
nvm use            # Node 22.22 이상 필요 (React Router v8)
pnpm install
pnpm dev        # http://localhost:5173
```

| 명령 | 하는 일 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` / `pnpm start` | 프로덕션 빌드 · 실행 |
| `pnpm start:local` | 빌드 결과를 `.env.local` 과 함께 로컬 실행 |
| `pnpm typecheck` | 타입 검사 |
| `pnpm check:story` | 시나리오 검사 (모양·끊어진 길·닿지 않는 마디·없는 장면·오행 쏠림) |
| `pnpm check:ai` | OpenAI API 키·모델 확인 (토큰 소모 없음) |
| `pnpm scenes:generate` | 장면 그림을 API 로 생성 |
| `pnpm scenes:sync` | 직접 만든 그림을 `public/scenes/` 에 넣고 적용 |
| `pnpm scenes:optimize` | 장면 그림을 webp 로 변환해 용량 줄이기 |

개발 중에는 `/dev/scenes` 에서 모든 장면 아트를 한 화면에 볼 수 있습니다.

## 쓰는 법

1. `/` 에서 **진행자로 새 방 만들기** → 비밀번호 팝업이 뜹니다. 통과하면 방 코드와
   진행자 콘솔(`/r/CODE/host`)이 열립니다.
2. 팀에게는 방 코드나 `/r/CODE` 링크를 공유합니다. 각자 이름만 입력하면 참여됩니다.
3. 진행자 콘솔에서 집계를 보고 **선택 마감 → 이 길로 진행**으로 넘깁니다.
4. 진행자 본인도 고르려면 휴대폰에서 `/r/CODE` 를 따로 여세요.

### 진행자와 참여자가 보는 것이 다릅니다

| | 참여자 `/r/CODE` | 진행자 `/r/CODE/host` |
| --- | --- | --- |
| 장면과 대사 | 크게 본다 | 작은 썸네일만 |
| 선택지 | 모달에서 고른다 | 고르지 않는다 |
| **집계·다수 선택** | **보이지 않는다** | 막대와 숫자로 본다 |
| 다음 갈림길 | 모른다 | 어디로 가는지 미리 본다 |
| 진행 버튼 | 없다 | 마감 · 진행 · 되돌리기 |

집계는 **서버에서 막습니다.** 참여자 응답에는 `counts: null` 만 내려가므로 개발자 도구로
네트워크를 열어봐도 결과를 알 수 없습니다. 진행자 키가 맞을 때만 숫자가 실립니다.

### 진행자 비밀번호

방을 열거나 다른 기기에서 진행자 자리를 이어받을 때 필요합니다.
`HOST_PASSWORD` 환경변수에서만 읽습니다 — 저장소에 값을 두지 않습니다.

- **배포 환경**: 반드시 설정해야 합니다. 없으면 방을 열 수 없습니다(503).
- **개발 중**: 비워두면 임시로 `changeme` 가 쓰이고 콘솔에 경고가 뜹니다.

검증은 서버에서만 하므로 클라이언트 번들에는 들어가지 않습니다.

진행자 키는 방을 만든 기기의 `localStorage` 에 저장됩니다. 다른 기기에서 진행하려면
`/r/CODE/host` 로 들어가 비밀번호를 넣거나, `/r/CODE/host?k=<키>` 링크를 쓰세요.

### 없는 방 코드

방은 **만들 때만 생깁니다.** 없는 코드로 들어가면 "없는 방입니다" 화면이 뜹니다
(예전에는 조용히 빈 방이 만들어졌습니다). 방은 12시간 뒤 사라집니다.

## 구조 (Feature-Sliced Design)

```
src/
  app/          라우팅과 앱 초기화 (React Router 의 appDirectory)
    routes/     화면 라우트 + /api/* 리소스 라우트
    styles/
  pages/        home · play · host
  widgets/      top-meter · journey-stage · ending-scroll · party-panel · saju-scroll · team-analysis
  features/     join-room · cast-vote · host-control · run-analysis
  entities/     act(스토리·장면) · element(오행·사주) · room(상태·API) · player
  shared/       ui(Button, Panel, OptionButton, SegmentMeter, ProgressBar, TextField, Chip,
                   StatusLine, TypewriterText) · lib(usePolling, http, storage, cx)
```

import 방향은 위에서 아래로만 흐릅니다 (`shared ← entities ← features ← widgets ← pages ← app`).
각 슬라이스는 `index.ts` 를 공개 API로 씁니다. 서버 전용 코드는 `*.server.ts` 로 두어
클라이언트 번들에 섞이지 않습니다.

`shared/ui` 의 컴포넌트는 이 게임과 무관하게 재사용하도록 만들었습니다.
특히 `OptionButton` 은 집계 막대가 배경에 깔리는 선택지 버튼이라 다른 투표 화면에 그대로 쓸 수 있습니다.

## 시나리오 고치기

시나리오는 코드가 아니라 **`content/story.json`** 한 파일에 있습니다. 기획만 바꿀 땐 이 파일만 건드리면 됩니다.

```json
{
  "title": "전자금융의 기묘한 하루",
  "start": "omen",
  "totalActs": 5,
  "speakers": { "나": "#4C8FD1", "마왕": "#7A4FA0" },
  "nodes": [
    {
      "id": "tavern",
      "act": 2,
      "when": "변두리 술집",
      "scene": "tavern",
      "script": [
        { "text": "술집 문을 열자 셋이 동시에 고개를 들었다." },
        { "speaker": "도적", "text": "보수는?" }
      ],
      "ask": "파티를 꾸립니다. 당신의 첫마디는?",
      "choices": [
        { "text": "…", "element": "wood", "next": "ruins" }
      ]
    }
  ],
  "endings": [
    { "id": "endBlaze", "scene": "endBlaze", "title": "불꽃으로 끝낸 자",
      "script": [{ "text": "…" }], "epilogue": "…" }
  ]
}
```

| 필드 | 뜻 |
| --- | --- |
| `id` | 마디를 가리키는 이름. `next` 에서 이 이름을 쓴다 |
| `act` | 진행 막대에 쓰는 막 번호 |
| `when` | 화면 위에 뜨는 장소·시점 |
| `scene` | 쓸 장면 그림. 아래 장면 목록 중 하나 |
| `script` | 대사. `speaker` 를 빼면 나레이션 |
| `choices[].next` | **이 선택이 다수가 되면 파티가 가는 곳** |
| `choices[].element` | 숨은 오행 태그 (`wood` `fire` `earth` `metal` `water`) |
| `speakers` | 화자별 이름표 색 |

- 마디를 더하려면 `nodes` 에 넣고 다른 마디의 `next` 로 이어주세요.
- 엔딩은 `endings` 에 있습니다. 마지막 마디의 `next` 를 엔딩 `id` 로 두면 됩니다.
- `element` 는 **다섯 기운의 개수를 고르게** 유지하세요. 안 그러면 모두가 같은 유형으로 나와 사주가 심심해집니다.

고친 뒤에는:

```bash
pnpm check:story
```

모양이 틀렸는지, 길이 끊겼는지, 어디로도 닿지 않는 마디가 있는지, 없는 장면을 썼는지, 오행이 쏠렸는지
한 번에 알려줍니다. `pnpm build` 할 때도 자동으로 돌아서, 깨진 시나리오로는 빌드가 되지 않습니다.

쓸 수 있는 장면 이름은 `src/entities/act/model/scenes.ts` 에 있습니다.
새 장면을 만들려면 거기에 이름을 더하고 `sceneSpecs.tsx` 에 사양을 넣으세요.

현재 그래프:

```
             omen                         1막
   ┌───┬──────┴──────┬────┐
 sleep tavern     palace  wilds           2막 · 장소가 갈린다
   └────┬───────┴────┬────┘
    forest    cave    ruins               3막
       └───┬──────────┘
        gate      sewer                   4막
          └────┬────┘
             throne                       5막
   ┌─────┬─────┴─────┬─────┐
 blaze  seal       tide   pact            엔딩 넷
```

## 장면 그림

`src/entities/act/ui/` 가 세 단계로 장면을 그립니다.

1. `public/scenes/<이름>.png` 가 있으면 그 그림 (`sceneImages.ts` 매니페스트 기준)
2. 없으면 `sceneSpecs.tsx` 의 벡터 장면

**직접 그림을 만들어 넣는 경우** — 프롬프트와 파일명은 [`docs/scene-prompts.md`](docs/scene-prompts.md) 에 정리해 뒀습니다.
`public/scenes/` 에 넣고 `pnpm scenes:sync` 만 돌리면 적용됩니다. 한 장씩 넣어도 됩니다.

그림을 생성하려면:

```bash
pnpm scenes:generate               # 아직 없는 장면만
pnpm scenes:generate --force    # 전부 다시
pnpm scenes:generate --only cave
```

한 번 만들면 `public/scenes/` 에 그대로 남고 **앱 실행 중에는 다시 부르지 않습니다.**
생성 직후 `pnpm scenes:optimize` 로 webp 변환하면 용량이 1/10 수준으로 줄어듭니다.
기본 3장씩 동시에 생성하며 `SCENE_CONCURRENCY` 로 조절합니다.

OpenAI 이미지 모델(`gpt-image-2.5-flare`)을 직접 부릅니다. 빌드 전 한 번만 도는 작업입니다.
생성이 끝나면 `sceneImages.ts` 매니페스트가 자동으로 갱신돼 벡터 배경이 그림으로 바뀝니다.
화풍은 `scripts/generate-scenes.mjs` 의 `STYLE` 상수 한 곳에서 관리합니다 — 여기를 바꾸면 전부 다시 뽑는 게 좋습니다.

## AI 를 언제 부르나

| | 언제 | 몇 번 |
| --- | --- | --- |
| 장면 그림 | `pnpm scenes:generate` — 개발 중에 미리 | 장면당 한 번, 그 뒤로는 정적 파일 |
| 팀 분석 | 파티가 엔딩에 닿는 순간 서버가 자동으로 | **세션당 한 번** |

게임을 진행하는 동안에는 AI 호출이 없습니다. 팀 분석만 마지막에 한 번 돌고, 결과는 방 상태에
저장돼 파티 전원이 같은 것을 봅니다.

엔딩에 닿으면 곧바로 예열되기 때문에, 사람들이 엔딩 문구와 각자 사주를 읽는 동안 준비가 끝납니다.
짧은 잠금을 걸어 여러 사람이 동시에 눌러도 한 번만 호출됩니다. 실패하면 잠금이 풀려 바로 다시
시도할 수 있고, 진행자 화면에 다시 시도 버튼이 나타납니다.

## 설정

`.env.example` 을 참고해 `.env.local` 을 채웁니다.

### AI — ChatGPT(OpenAI) API

팀 분석과 장면 그림 생성에 씁니다. `.env.local` 을 **편집기로 열어** 키를 넣으세요
(터미널에 직접 치면 셸 기록에 남습니다).

```
OPENAI_API_KEY=sk-...
```

```bash
pnpm check:ai     # 키와 모델이 쓸 수 있는지 확인
```

`.env.local` 은 `vite.config.ts` 에서 `process.env` 로 올립니다
(Vite 는 기본적으로 서버 코드에 넣어주지 않습니다).

모델은 기본값이 있고, 필요하면 바꿀 수 있습니다.

| 환경변수 | 기본값 | 쓰이는 곳 |
| --- | --- | --- |
| `OPENAI_TEXT_MODEL` | `gpt-5.4` | AI 팀 분석 |
| `OPENAI_IMAGE_MODEL` | `gpt-image-2.5-flare` | 장면 그림 생성 (`gpt-image-2.5-sunburst` 는 더 회화적) |

`OPENAI_API_KEY` 가 없으면 Vercel AI Gateway 로 넘어갑니다
(`AI_GATEWAY_API_KEY`, 없으면 `vercel link` 가 받아온 `VERCEL_OIDC_TOKEN`).
게이트웨이는 팀에 결제 수단이 등록돼 있어야 동작합니다.

### 저장소 — Upstash Redis (선택)

없으면 인메모리로 돌아가 **한 프로세스 안에서만** 공유됩니다. 로컬에서 혼자 확인할 땐 문제없지만,
여러 기기가 같은 방을 보려면 필요합니다.

```bash
vercel integration add upstash/upstash-kv --no-claim   # 최초 1회 브라우저에서 약관 수락 필요
vercel env pull .env.local --yes
```

`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (또는 `KV_REST_API_*`) 을 읽습니다.

## 배포

```bash
vercel deploy          # 프리뷰
vercel deploy --prod   # 프로덕션
```

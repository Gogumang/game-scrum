# 장면 그림 프롬프트 (15장)

ChatGPT 등에서 직접 뽑을 때 쓰는 프롬프트입니다.

## 넣는 방법

1. 아래 프롬프트로 15장을 만듭니다. **가로 이미지(landscape)** 로 뽑으세요. 1536×1024 가 기본입니다.
2. `public/scenes/` 에 **아래 파일명 그대로** 넣습니다. PNG.
3. `pnpm scenes:sync` — 넣은 그림이 자동으로 적용됩니다. 없는 장면은 기존 벡터 배경이 계속 쓰입니다.
4. `/dev/scenes` 에서 15장을 한 화면으로 확인합니다.

한 장씩 넣어도 됩니다. 넣은 것만 그림으로 바뀝니다.

| 파일명 | 장면 |
| --- | --- |
| `omen.png` | 1막 · 마왕, 부활하다 |
| `bedroom.png` | 2막 · 사흘 뒤, 내 방 |
| `tavern.png` | 2막 · 변두리 술집 |
| `palace.png` | 2막 · 왕궁 알현실 |
| `wilds.png` | 2막 · 이름 없는 황야 |
| `forest.png` | 3막 · 안개의 숲 |
| `cave.png` | 3막 · 갈림길 동굴 |
| `ruins.png` | 3막 · 무너진 신전 |
| `gate.png` | 4막 · 마왕성 대문 |
| `sewer.png` | 4막 · 성벽 아래 물길 |
| `throne.png` | 5막 · 옥좌의 방 |
| `endBlaze.png` | 엔딩 · 불꽃으로 끝낸 자 |
| `endSeal.png` | 엔딩 · 문을 닫은 자 |
| `endTide.png` | 엔딩 · 기다려 이긴 자 |
| `endPact.png` | 엔딩 · 판을 바꾼 자 |

## 요령

- **한 대화에서 15장을 이어서** 뽑으면 화풍이 훨씬 잘 맞습니다. 먼저 아래 **공통 화풍**을 한 번
  던져 기준을 잡고, 그 다음부터 장면 설명만 하나씩 주세요.
- 화풍이 흔들리면 "첫 번째 이미지와 같은 화풍으로" 라고 덧붙이면 됩니다.
- 작품 제목을 대고 "그 애니 그림체로" 라고 하면 결과가 들쭉날쭉하고 저작권 문제도 걸립니다.
  아래처럼 특징을 직접 적는 쪽이 훨씬 일관됩니다.

---

## 공통 화풍 (먼저 한 번)

```
앞으로 게임에 쓸 장면 그림 15장을 만들 거야. 전부 아래 화풍으로 통일해줘.

Bright and cheerful 1990s Japanese comedy-fantasy RPG anime illustration, wide landscape composition.
Super-deformed two-heads-tall characters with big round heads and tiny bodies, seen from behind or in
profile, no detailed facial features. Thick even dark-brown outlines on every shape, flat cel shading,
no gradients, no airbrush, no photorealism. Bold saturated storybook palette: sky blue, grass green,
warm cream, coral red, sunny yellow, soft purple. Light-hearted gag-comedy mood even when the situation
is dangerous. Clean shapes, generous open space, easy to read at a glance.
No text, no letters, no numbers, no logos, no UI, no frame, no border, no watermark, no signature.
```

## 장면별 프롬프트

### 1. omen — 마왕, 부활하다
```
A tiny hero in a pointy hat stands on a green hill with a panicking royal messenger beside him.
Far away a cartoonish purple demon castle sits under a blue sky, with a comically jagged red crack
running down the clouds above it.
```

### 2. bedroom — 사흘 뒤, 내 방
```
A sunny little bedroom in the morning. A rumpled bed, a sword tossed on the floor, and a small hero
standing dazed in pajamas while red light pours through the window.
```

### 3. tavern — 변두리 술집
```
A warm crowded fantasy tavern. Three chibi adventurers sit around a wooden table with big mugs,
all turning to look at a small hero who has just walked in through the door.
```

### 4. palace — 왕궁 알현실
```
A bright royal audience hall with cream pillars and a red carpet. A round bearded chancellor holds a
comically tall stack of paperwork while a tiny hero stands in front of an oversized golden throne.
```

### 5. wilds — 이름 없는 황야
```
A sunny empty wasteland with a cactus and one dead tree. A single small hero walks alone across
cracked yellow ground under a big blue sky with puffy clouds.
```

### 6. forest — 안개의 숲
```
A bright green forest of round bushy trees with white mist drifting between them. Two tiny adventurers
stand looking down at their own footprints, which go in a circle.
```

### 7. cave — 갈림길 동굴
```
The inside of a cheerful cartoon cave where the tunnel splits in two. A big torch burns on the rock
pillar in the middle, and a small comrade sits slumped against the wall on the left with three arrows
stuck in his leg.
```

### 8. ruins — 무너진 신전
```
Sunny broken temple ruins with toppled cream-colored pillars. A tall cracked wall covered in rows of
carved names stands in the middle, with a tiny hero looking up at it.
```

### 9. gate — 마왕성 대문
```
An enormous purple castle gate set in a stone wall, wildly out of scale with the two tiny adventurers
standing at its base. Glowing yellow diamond runes on the arch, torches on both sides.
```

### 10. sewer — 성벽 아래 물길
```
A stone sewer tunnel under a castle wall with bright green water flowing through it. Two small
adventurers stand at the entrance looking thoroughly unenthusiastic.
```

### 11. throne — 옥좌의 방
```
A purple throne room. A round cartoon demon lord with huge curly horns and big googly eyes rises from
an oversized throne, while one tiny hero stands on the red carpet before him.
```

### 12. endBlaze — 불꽃으로 끝낸 자
```
A cartoon demon castle comically bursting apart in bright orange flame, chunks flying off in all
directions. A tiny hero stands triumphantly on a hill in the foreground.
```

### 13. endSeal — 문을 닫은 자
```
A great purple gate sealed shut under a bright blue sky, glowing blue diamond seals across its surface.
A tiny hero walks away from it with hands behind his head.
```

### 14. endTide — 기다려 이긴 자
```
Pink and gold dawn over a wide plain. A line of four chibi adventurers walks toward the viewer across
the field while a small hero waits in front, the sun rising behind them.
```

### 15. endPact — 판을 바꾼 자
```
A purple hall where a tiny hero and a big round horned demon lord face each other, a glowing contract
scroll floating between them. Both look equally pleased with the deal.
```

---

화풍을 바꾸고 싶으면 위 **공통 화풍** 문단을 고치고 15장을 다시 뽑으세요.
같은 내용이 `scripts/generate-scenes.mjs` 의 `STYLE` 상수에도 들어 있습니다(API 로 자동 생성할 때 쓰는 경로).

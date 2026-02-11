# 주술회전 카드 게임 - UI/UX 및 구현 가이드 (Part 4)

## UI/UX 설계

### 화면 구성

```
┌─────────────────────────────────────────────────────────┐
│                    [메인 화면]                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ 크루관리 │  │ 대전시작 │  │ 컬렉션  │  │ 전적    │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              현재 크루 미리보기 (5장)               │  │
│  │  [카드1] [카드2] [카드3] [카드4] [카드5]           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    [대전 화면]                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │     PLAYER: 0    ─────    AI: 0                 │    │
│  │              [라운드 1/5]                        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              [경기장: 시부야역 지하]              │    │
│  │     "저주 +15% | 원거리 -10%"                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────┐           ┌───────────────┐          │
│  │               │           │               │          │
│  │  [선택 카드]   │    VS    │  [AI 카드]    │          │
│  │               │           │   (뒤집힘)    │          │
│  └───────────────┘           └───────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │     사용 가능한 카드 (클릭하여 선택)              │    │
│  │  [카드1] [카드2] [카드3] [카드4] [카드5]        │    │
│  │  (사용완료는 흐리게 표시)                        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│                    [대결!] 버튼                          │
└─────────────────────────────────────────────────────────┘
```

### 카드 컴포넌트 디자인

```
┌─────────────────────────┐
│ [S]           [🔮결계] │  ← 등급 + 속성
├─────────────────────────┤
│                         │
│     [캐릭터 이미지]      │  ← 메인 이미지 영역
│                         │
├─────────────────────────┤
│ 고죠 사토루        Lv.5 │  ← 이름 + 레벨
├─────────────────────────┤
│ ⚔️ 22  🛡️ 20  ⚡ 22    │  ← ATK, DEF, SPD
│ 💜 27  ❤️ 19            │  ← CE, HP
├─────────────────────────┤
│ 【무량공처】             │
│ 상대 SPD를 0으로 만듦   │  ← 스킬 정보
├─────────────────────────┤
│ [🗡️ 육안] [🛡️ ---]     │  ← 장비 슬롯
└─────────────────────────┘
```

### 색상 팔레트

```typescript
const COLORS = {
  // 등급별
  grade: {
    S: { bg: '#FF6B6B', text: '#FFFFFF' },
    A: { bg: '#FFD93D', text: '#000000' },
    B: { bg: '#6BCB77', text: '#FFFFFF' },
    C: { bg: '#4D96FF', text: '#FFFFFF' },
    D: { bg: '#C4C4C4', text: '#000000' }
  },
  // 속성별
  attribute: {
    BARRIER: '#9B59B6',
    BODY: '#E74C3C',
    CURSE: '#2C3E50',
    SOUL: '#1ABC9C',
    CONVERT: '#F39C12',
    RANGE: '#3498DB'
  },
  // UI
  ui: {
    background: '#1a1a2e',
    card: '#16213e',
    accent: '#e94560',
    text: '#eaeaea',
    subtext: '#a0a0a0',
    win: '#4CAF50',
    lose: '#f44336'
  }
};
```

---

## 구현 가이드 (Claude Code용)

### 기술 스택

```
React 18 + TypeScript + Vite
Zustand (상태관리)
Tailwind CSS (스타일링)
Framer Motion (애니메이션)
LocalStorage (데이터 저장)
```

### 폴더 구조

```
src/
├── components/
│   ├── Card/
│   │   ├── CardDisplay.tsx      # 카드 렌더링
│   │   ├── CardSelector.tsx     # 카드 선택 UI
│   │   └── CardDetail.tsx       # 카드 상세 모달
│   ├── Battle/
│   │   ├── BattleScreen.tsx     # 대전 메인 화면
│   │   ├── ArenaDisplay.tsx     # 경기장 표시
│   │   ├── RoundResult.tsx      # 라운드 결과
│   │   └── BattleLog.tsx        # 계산 과정 표시
│   ├── Crew/
│   │   ├── CrewManager.tsx      # 크루 관리
│   │   └── EquipmentSlot.tsx    # 장비 관리
│   └── UI/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── StatBar.tsx
│       └── Badge.tsx
├── data/
│   ├── characters.ts            # 캐릭터 데이터
│   ├── arenas.ts                # 경기장 데이터
│   ├── items.ts                 # 아이템 데이터
│   └── achievements.ts          # 업적 데이터
├── hooks/
│   ├── useBattle.ts             # 대전 로직
│   ├── useGameState.ts          # 게임 상태
│   └── useLocalStorage.ts       # 저장/불러오기
├── stores/
│   ├── gameStore.ts             # 전역 게임 상태
│   └── playerStore.ts           # 플레이어 데이터
├── types/
│   └── index.ts                 # 타입 정의
├── utils/
│   ├── battleCalculator.ts      # 데미지 계산
│   ├── aiLogic.ts               # AI 로직
│   └── attributeSystem.ts       # 속성 상성
├── App.tsx
└── main.tsx
```

### 핵심 구현 순서

```
Phase 1: 기반 구축 (Day 1)
─────────────────────────
1. 프로젝트 초기화 (Vite + React + TS + Tailwind)
2. types/index.ts - 모든 타입 정의
3. data/ - 캐릭터, 경기장, 아이템 JSON 데이터
4. utils/attributeSystem.ts - 속성 상성 계산

Phase 2: 핵심 로직 (Day 2)
─────────────────────────
5. utils/battleCalculator.ts - 데미지/승패 계산
6. utils/aiLogic.ts - AI 카드 선택
7. stores/gameStore.ts - Zustand 상태 관리
8. hooks/useBattle.ts - 대전 진행 훅

Phase 3: UI 컴포넌트 (Day 3-4)
─────────────────────────
9. components/Card/* - 카드 표시
10. components/Battle/* - 대전 화면
11. components/UI/* - 공통 UI
12. 메인 화면 레이아웃

Phase 4: 성장 시스템 (Day 5)
─────────────────────────
13. 경험치/레벨업 로직
14. 장비 시스템
15. 전적 기록
16. 업적 체크

Phase 5: 마무리 (Day 6)
─────────────────────────
17. LocalStorage 저장/불러오기
18. 애니메이션 추가
19. 밸런스 테스트
20. 버그 수정
```

---

## Claude Code 프롬프트

### 프롬프트 1: 프로젝트 초기화

```
주술회전 카드 게임 "영역전개" 웹앱을 만들어주세요.

기술 스택:
- Vite + React 18 + TypeScript
- Zustand (상태관리)
- Tailwind CSS
- Framer Motion

첨부된 설계 문서(docs/ 폴더)를 참고하여:
1. 프로젝트 초기화
2. types/index.ts에 모든 타입 정의
3. Tailwind 설정 (색상 팔레트 포함)

시작해주세요.
```

### 프롬프트 2: 데이터 & 유틸리티

```
다음 단계로:
1. data/characters.ts - 설계 문서의 20개 캐릭터 데이터
2. data/arenas.ts - 10개 경기장 데이터
3. data/items.ts - 15개 아이템 데이터
4. utils/attributeSystem.ts - 속성 상성 계산 함수
5. utils/battleCalculator.ts - 데미지 계산 함수

설계 문서의 공식을 정확히 구현해주세요.
```

### 프롬프트 3: 상태 관리 & 대전 로직

```
다음으로:
1. stores/gameStore.ts - Zustand 전역 상태
   - player: 크루, 스코어, 사용한 카드
   - ai: 난이도, 크루, 스코어
   - currentRound, status, rounds

2. hooks/useBattle.ts
   - 라운드 진행 로직
   - 승패 판정
   - 경험치 계산

3. utils/aiLogic.ts
   - 난이도별 AI 카드 선택 알고리즘
```

### 프롬프트 4: UI 컴포넌트

```
UI 컴포넌트를 만들어주세요:

1. components/Card/CardDisplay.tsx
   - 설계 문서의 카드 레이아웃 구현
   - 등급별 색상, 속성 아이콘
   - 스탯 표시, 스킬 정보

2. components/Battle/BattleScreen.tsx
   - 스코어 표시
   - 경기장 정보
   - 카드 선택 영역
   - VS 대결 영역

3. components/Battle/RoundResult.tsx
   - 승패 결과 애니메이션
   - 데미지 계산 과정 표시
```

### 프롬프트 5: 메인 화면 & 라우팅

```
메인 화면과 전체 플로우:

1. App.tsx
   - 라우팅 (메인, 크루관리, 대전, 컬렉션, 전적)

2. pages/MainMenu.tsx
   - 크루 미리보기
   - 메뉴 버튼들

3. pages/CrewManager.tsx
   - 크루 편집
   - 장비 장착

4. pages/Battle.tsx
   - 대전 플로우 전체
```

### 프롬프트 6: 성장 & 저장 시스템

```
마지막으로:

1. 레벨업 시스템
   - 경험치 테이블
   - 스탯 증가 (B안: 주요 2개 +2)

2. hooks/useLocalStorage.ts
   - 게임 데이터 저장/불러오기

3. 업적 시스템
   - 조건 체크
   - 보상 지급

4. 전적 기록
   - 카드별, 경기장별, 상대별
```

---

## 이미지 에셋 참고

캐릭터 이미지는 공식 이미지를 사용합니다.
개발 초기에는 placeholder로 대체 가능:

```typescript
// 임시 이미지 URL 생성
const getPlaceholderImage = (name: string, attribute: Attribute) => {
  const color = COLORS.attribute[attribute].replace('#', '');
  return `https://via.placeholder.com/200x280/${color}/FFFFFF?text=${encodeURIComponent(name)}`;
};
```

---

## 밸런스 노트

### 스탯 범위
- ATK: 10-25 (S등급 20+)
- DEF: 9-18
- SPD: 12-20
- CE: 0-25 (토지 제외)
- HP: 12-20

### 성장 최대치 (Lv.10)
- 레벨당 주요 스탯 +2 × 2개 = +4/레벨
- 최대 레벨 시 기본 대비 +36 (약 25-30% 상승)

### 장비 보정
- COMMON: +3~4
- RARE: +5~7 + 특수효과
- EPIC: +6~8 + 강력한 특수효과
- LEGENDARY: +8~10 + 최강 특수효과

### AI 밸런스
- EASY: 50% 승률 목표
- NORMAL: 45% 승률 목표
- HARD: 35-40% 승률 목표

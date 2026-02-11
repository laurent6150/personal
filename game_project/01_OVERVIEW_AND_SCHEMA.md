# 주술회전 카드 게임 "영역전개" - 기술 설계 문서 (Part 1)

## 1. 게임 개요

### 1.1 기본 정보
- **게임명**: 영역전개 (Domain Expansion)
- **장르**: 전략 카드 대전 + 수집/성장형
- **플랫폼**: 웹앱 (React + TypeScript)
- **대전 방식**: 1:1 (Player vs AI)

### 1.2 핵심 규칙
- **크루 구성**: 5장의 카드로 한 크루(팀) 구성
- **대전 형식**: 5판 3선승제
- **카드 사용**: 한 번 사용한 카드는 해당 경기에서 재사용 불가 (5라운드 에이스전 예외)
- **덱 제한**: 등급별 제한 (S: 최대 1장, A: 최대 2장, B이하: 제한없음)

### 1.3 게임 플로우
```
[게임 시작] → [크루 관리] → [대전 시작 (난이도 선택)]
     ↓
[라운드 진행] × 최대 5회
  ├─ 경기장 랜덤 배정
  ├─ 카드 선택
  ├─ 동시 공개
  └─ 승패 판정
     ↓
[경기 종료] → [경험치/전적/업적 처리] → [다음 경기]
```

---

## 2. 데이터 스키마 (TypeScript)

### 2.1 기본 타입
```typescript
// 속성 타입
type Attribute = 'BARRIER' | 'BODY' | 'CURSE' | 'SOUL' | 'CONVERT' | 'RANGE';

// 등급 타입
type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

// 스탯 인터페이스
interface Stats {
  atk: number;   // 공격력
  def: number;   // 방어력
  spd: number;   // 속도
  ce: number;    // 저주력 (Cursed Energy)
  hp: number;    // 체력
}
```

### 2.2 속성 상성 시스템
```typescript
// 속성 정보
const ATTRIBUTES = {
  BARRIER: { ko: '결계', icon: '🔮', color: '#9B59B6' },
  BODY:    { ko: '신체', icon: '💪', color: '#E74C3C' },
  CURSE:   { ko: '저주', icon: '👁️', color: '#2C3E50' },
  SOUL:    { ko: '혼백', icon: '👻', color: '#1ABC9C' },
  CONVERT: { ko: '변환', icon: '🔥', color: '#F39C12' },
  RANGE:   { ko: '원거리', icon: '🎯', color: '#3498DB' }
};

// 상성표: 각 속성 → [강한 속성들]
const ATTRIBUTE_ADVANTAGE: Record<Attribute, Attribute[]> = {
  BARRIER: ['CURSE', 'CONVERT'],
  BODY:    ['BARRIER', 'CONVERT'],
  CURSE:   ['BODY', 'RANGE'],
  SOUL:    ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'],
  RANGE:   ['BODY', 'SOUL']
};

// 상성 배율
const ADVANTAGE_MULTIPLIER = 1.5;   // 유리할 때
const DISADVANTAGE_MULTIPLIER = 0.7; // 불리할 때
```

### 2.3 캐릭터 카드 스키마
```typescript
interface CharacterCard {
  id: string;
  name: { ko: string; ja: string; en: string };
  grade: Grade;
  attribute: Attribute;
  imageUrl: string;
  baseStats: Stats;
  growthStats: { primary: keyof Stats; secondary: keyof Stats };
  skill: Skill;
  achievements: Achievement[];
}

interface Skill {
  name: string;
  description: string;
  effect: SkillEffect;
}

interface SkillEffect {
  type: 'STAT_MODIFY' | 'DAMAGE_MODIFY' | 'IGNORE_DEFENSE' | 
        'SPEED_CONTROL' | 'HP_DRAIN' | 'SKILL_NULLIFY' | 'CRITICAL';
  trigger: 'ALWAYS' | 'PROBABILITY';
  probability?: number;
  value: number | { stat: keyof Stats; amount: number };
  target: 'SELF' | 'ENEMY';
}
```

### 2.4 플레이어 카드 (성장 데이터)
```typescript
interface PlayerCard {
  cardId: string;
  level: number;           // 1-10
  exp: number;
  equipment: [string | null, string | null];  // 장비 슬롯 2개
  stats: {
    totalWins: number;
    totalLosses: number;
    vsRecord: Record<string, { wins: number; losses: number }>;
    arenaRecord: Record<string, { wins: number; losses: number }>;
  };
  unlockedAchievements: string[];
}
```

### 2.5 경기장 스키마
```typescript
interface Arena {
  id: string;
  name: { ko: string; en: string };
  description: string;
  imageUrl: string;
  effects: ArenaEffect[];
}

interface ArenaEffect {
  type: 'ATTRIBUTE_BOOST' | 'ATTRIBUTE_WEAKEN' | 'STAT_MODIFY' | 'SPECIAL_RULE';
  target: Attribute | 'ALL';
  value: number;
  description: string;
}
```

### 2.6 아이템 스키마
```typescript
interface Item {
  id: string;
  name: { ko: string; en: string };
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  statBonus: Partial<Stats>;
  specialEffect?: { type: string; value: number; description: string };
  unlockCondition: { characterId: string; achievementId: string };
}
```

### 2.7 게임 세션 스키마
```typescript
interface GameSession {
  id: string;
  player: {
    crew: PlayerCard[];
    score: number;
    usedCards: string[];
  };
  ai: {
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    crew: CharacterCard[];
    score: number;
    usedCards: string[];
  };
  rounds: RoundResult[];
  currentRound: number;
  status: 'IN_PROGRESS' | 'PLAYER_WIN' | 'AI_WIN';
}

interface RoundResult {
  roundNumber: number;
  arena: Arena;
  playerCard: string;
  aiCard: string;
  winner: 'PLAYER' | 'AI' | 'DRAW';
  calculation: BattleCalculation;
}
```

---

## 3. 게임 로직

### 3.1 데미지 계산
```typescript
function calculateDamage(attacker: CombatStats, defender: CombatStats, arena: Arena): number {
  // 1. 속성 배율
  let attrMultiplier = 1.0;
  if (ATTRIBUTE_ADVANTAGE[attacker.attribute].includes(defender.attribute)) {
    attrMultiplier = 1.5;
  } else if (ATTRIBUTE_ADVANTAGE[defender.attribute].includes(attacker.attribute)) {
    attrMultiplier = 0.7;
  }
  
  // 2. CE 배율
  const ceMultiplier = 1 + (attacker.ce / 100);
  
  // 3. 경기장 보너스
  const arenaBonus = getArenaBonus(attacker.attribute, arena);
  
  // 4. 최종 데미지
  let damage = (attacker.atk * attrMultiplier * ceMultiplier * (1 + arenaBonus)) - defender.def;
  
  return Math.max(1, Math.floor(damage));
}
```

### 3.2 라운드 진행
```typescript
function resolveRound(playerCard: CombatCard, aiCard: CombatCard, arena: Arena): RoundResult {
  // 선공 판정
  const playerFirst = playerCard.spd >= aiCard.spd;
  
  // 데미지 계산
  const playerDmg = calculateDamage(playerCard, aiCard, arena);
  const aiDmg = calculateDamage(aiCard, playerCard, arena);
  
  // HP 적용 (선공이 먼저 때림)
  let pHp = playerCard.hp, aHp = aiCard.hp;
  
  if (playerFirst) {
    aHp -= playerDmg;
    if (aHp > 0) pHp -= aiDmg;
  } else {
    pHp -= aiDmg;
    if (pHp > 0) aHp -= playerDmg;
  }
  
  // 승패 판정
  const winner = aHp <= 0 ? 'PLAYER' : pHp <= 0 ? 'AI' : (pHp > aHp ? 'PLAYER' : 'AI');
  
  return { winner, ... };
}
```

### 3.3 레벨업 시스템
```typescript
// 레벨별 필요 경험치 (누적)
const EXP_TABLE = [0, 100, 220, 360, 520, 700, 900, 1120, 1360, 1620];

// 경험치 보상
const EXP_REWARDS = {
  WIN: 30,
  LOSE: 10,
  WIN_VS_HIGHER: 50,
  STREAK_BONUS: 5  // per streak
};

// 레벨업 시 스탯 증가 (B안: 주요 2개 +2)
function applyLevelUp(card: PlayerCard, baseCard: CharacterCard): Stats {
  const bonus = (card.level - 1) * 2;
  return {
    ...baseCard.baseStats,
    [baseCard.growthStats.primary]: baseCard.baseStats[baseCard.growthStats.primary] + bonus,
    [baseCard.growthStats.secondary]: baseCard.baseStats[baseCard.growthStats.secondary] + bonus
  };
}
```

### 3.4 AI 로직
```typescript
function aiSelectCard(difficulty: Difficulty, available: Card[], arena: Arena, playerUsed: string[]): Card {
  switch (difficulty) {
    case 'EASY':
      return randomPick(available);
      
    case 'NORMAL':
      // 경기장에 유리한 속성 우선
      const boosted = available.filter(c => isBostedInArena(c, arena));
      return boosted.length ? randomPick(boosted) : randomPick(available);
      
    case 'HARD':
      // 상대 남은 카드 예측 + 상성 + 경기장 종합 판단
      return findOptimalCard(available, playerUsed, arena);
  }
}
```

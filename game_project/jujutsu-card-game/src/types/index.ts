// ========================================
// 주술회전 카드 게임 "영역전개" - 타입 정의
// ========================================

// 기본 타입
export type Attribute = 'BARRIER' | 'BODY' | 'CURSE' | 'SOUL' | 'CONVERT' | 'RANGE';
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type Rarity = ItemRarity;

// 스탯 인터페이스
export interface Stats {
  atk: number;   // 공격력
  def: number;   // 방어력
  spd: number;   // 속도
  ce: number;    // 저주력 (Cursed Energy)
  hp: number;    // 체력
}

// 스킬 효과 타입
export type SkillEffectType =
  | 'STAT_MODIFY'      // 스탯 수정
  | 'DAMAGE_MODIFY'    // 데미지 배율 수정
  | 'IGNORE_DEFENSE'   // 방어력 무시
  | 'SPEED_CONTROL'    // 속도 제어
  | 'HP_DRAIN'         // HP 흡수/데미지
  | 'SKILL_NULLIFY'    // 스킬 무효화
  | 'CRITICAL';        // 크리티컬

// 스킬 효과
export interface SkillEffect {
  type: SkillEffectType;
  trigger: 'ALWAYS' | 'PROBABILITY';
  probability?: number;
  value: number | { stat: keyof Stats; amount: number };
  target: 'SELF' | 'ENEMY';
}

// 스킬
export interface Skill {
  name: string;
  description: string;
  effect: SkillEffect;
}

// 업적 조건 타입
export type AchievementConditionType =
  | 'WINS'
  | 'WIN_STREAK'
  | 'DEFEAT_SPECIFIC'
  | 'SURVIVE_LOW_HP'
  | 'USE_SKILL'
  | 'WIN_IN_ARENA';

// 업적 조건
export interface AchievementCondition {
  type: AchievementConditionType;
  target?: string;
  count: number;
}

// 업적 보상
export interface AchievementReward {
  type: 'ITEM' | 'EXP' | 'TITLE';
  itemId?: string;
  amount?: number;
  title?: string;
}

// 업적
export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: AchievementCondition;
  reward: AchievementReward;
}

// 캐릭터 카드 (기본 데이터)
export interface CharacterCard {
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

// 플레이어 소유 카드 (성장 데이터)
export interface PlayerCard {
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

// 전투용 스탯 (최종 계산된)
export interface CombatStats extends Stats {
  attribute: Attribute;
  skillEffect?: SkillEffect;
  cardId: string;
}

// 경기장 효과 타입
export type ArenaEffectType =
  | 'ATTRIBUTE_BOOST'    // 속성 강화
  | 'ATTRIBUTE_WEAKEN'   // 속성 약화
  | 'STAT_MODIFY'        // 스탯 수정
  | 'SPECIAL_RULE';      // 특수 규칙

// 경기장 효과
export interface ArenaEffect {
  type: ArenaEffectType;
  target: Attribute | 'ALL';
  value: number;
  description: string;
}

// 경기장
export interface Arena {
  id: string;
  name: { ko: string; en: string };
  description: string;
  imageUrl: string;
  effects: ArenaEffect[];
}

// 아이템 특수 효과
export interface ItemSpecialEffect {
  type: string;
  value: number;
  description: string;
}

// 아이템 해금 조건
export interface ItemUnlockCondition {
  characterId: string;
  achievementId: string;
}

// 아이템
export interface Item {
  id: string;
  name: { ko: string; en: string };
  description: string;
  rarity: ItemRarity;
  statBonus: Partial<Stats>;
  specialEffect?: ItemSpecialEffect;
  unlockCondition: ItemUnlockCondition;
}

// 전투 계산 결과
export interface BattleCalculation {
  playerDamage: number;
  aiDamage: number;
  playerFinalHp: number;
  aiFinalHp: number;
  playerFirst: boolean;
  attributeMultiplier: { player: number; ai: number };
  ceMultiplier: { player: number; ai: number };
  arenaBonus: { player: number; ai: number };
  skillActivated: { player: boolean; ai: boolean };
}

// 라운드 결과
export interface RoundResult {
  roundNumber: number;
  arena: Arena;
  playerCardId: string;
  aiCardId: string;
  winner: 'PLAYER' | 'AI' | 'DRAW';
  calculation: BattleCalculation;
}

// 게임 세션 상태
export type GameStatus = 'PREPARING' | 'IN_PROGRESS' | 'PLAYER_WIN' | 'AI_WIN';

// 게임 세션
export interface GameSession {
  id: string;
  player: {
    crew: string[];       // 카드 ID 배열
    score: number;
    usedCards: string[];
  };
  ai: {
    difficulty: Difficulty;
    crew: string[];       // 카드 ID 배열
    score: number;
    usedCards: string[];
  };
  rounds: RoundResult[];
  currentRound: number;
  status: GameStatus;
  currentArena: Arena | null;
}

// 플레이어 데이터 (저장용)
export interface PlayerData {
  id: string;
  name: string;
  ownedCards: Record<string, PlayerCard>;
  currentCrew: string[];   // 5장의 카드 ID
  unlockedItems: string[];
  totalStats: {
    totalWins: number;
    totalLosses: number;
    winStreak: number;
    maxWinStreak: number;
  };
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    animationSpeed: 'SLOW' | 'NORMAL' | 'FAST';
  };
}

// 속성 정보
export interface AttributeInfo {
  ko: string;
  icon: string;
  color: string;
}

// 등급 정보
export interface GradeInfo {
  bg: string;
  text: string;
  maxInDeck: number;
}

// 경험치 보상 타입
export interface ExpReward {
  base: number;
  bonus: number;
  total: number;
  reason: string[];
}

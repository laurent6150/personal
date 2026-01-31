// ========================================
// 주술회전 카드 게임 "영역전개" - 타입 정의
// ========================================

// 기본 타입
export type Attribute = 'BARRIER' | 'BODY' | 'CURSE' | 'SOUL' | 'CONVERT' | 'RANGE';
export type Grade = '특급' | '1급' | '준1급' | '2급' | '준2급' | '3급';
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

// ========================================
// 새로운 기술 시스템
// ========================================

// 기술 효과 타입
export type SkillEffectType =
  // === 새로운 기술 시스템 ===
  | 'DAMAGE'              // 단일 데미지
  | 'MULTI_HIT'           // 다단 히트
  | 'TRUE_DAMAGE'         // 방어 무시 데미지
  | 'DAMAGE_REDUCE'       // 데미지 감소
  | 'DODGE'               // 회피
  | 'HEAL'                // 회복
  | 'STUN'                // 기절 (행동 불가)
  | 'BURN'                // 화상 (도트 데미지)
  | 'POISON_EXPLOSION'    // 독 폭발
  | 'SLOW'                // 속도 감소
  | 'KNOCKBACK'           // 넉백 (턴 스킵)
  | 'SLEEP'               // 수면
  | 'BLIND'               // 시야 차단
  | 'STAT_BOOST'          // 스탯 강화
  | 'DRAIN'               // 흡수
  | 'SUMMON_DAMAGE'       // 소환물 데미지
  | 'SUMMON'              // 소환
  | 'COPY_ATTACK'         // 복제 공격
  | 'CHARGE'              // 게이지 충전
  | 'CRITICAL_ATTACK'     // 크리티컬 공격
  | 'CRITICAL_GUARANTEED' // 확정 크리티컬
  | 'RATIO_DAMAGE'        // 비율 데미지
  | 'CONTINUOUS_DAMAGE'   // 지속 데미지
  | 'SKILL_NULLIFY'       // 스킬 무효화
  | 'INSTANT_KILL_OR_DAMAGE' // 즉사 또는 데미지
  | 'INSTANT_DAMAGE'      // 즉발 데미지
  | 'AOE_DAMAGE'          // 광역 데미지
  | 'WEAPON_CHANGE'       // 무기 교체
  | 'WEAKNESS_FIND'       // 약점 발견
  | 'SACRIFICE_ATTACK'    // 희생 공격
  | 'SWAP_ATTACK'         // 위치 교환 공격
  | 'CLONE'               // 분신
  | 'DOMAIN'              // 영역전개
  | 'REFLECT_DAMAGE'      // 데미지 반사
  | 'MULTI_SUMMON'        // 다중 소환
  | 'TRANSFORM'           // 변신
  // === 레거시 (기존 전투 시스템 호환) ===
  | 'STAT_MODIFY'         // 스탯 수정
  | 'DAMAGE_MODIFY'       // 데미지 배율 수정
  | 'IGNORE_DEFENSE'      // 방어력 무시
  | 'SPEED_CONTROL'       // 속도 제어
  | 'HP_DRAIN'            // HP 흡수/데미지
  | 'CRITICAL';           // 크리티컬

// 기술 효과 상세
export interface SkillEffect {
  type: SkillEffectType;
  value?: number | { stat: keyof Stats; amount: number };  // 레거시 호환
  hits?: number;              // 다단히트 횟수
  duration?: number;          // 지속 시간 (턴)
  dotDamage?: number;         // 도트 데미지
  critRate?: number;          // 크리티컬 확률
  multiplier?: number;        // 배율
  healPercent?: number;       // 회복 비율
  atkBonus?: number;          // 공격력 보너스
  defBonus?: number;          // 방어력 보너스
  spdBonus?: number;          // 속도 보너스
  chance?: number;            // 발동 확률
  selfDamage?: number;        // 자해 데미지
  selfDefReduce?: number;     // 자신 방어력 감소
  ignoreDefense?: boolean;    // 방어 무시
  ignoreBarrier?: boolean;    // 결계 무시
  reflectPercent?: number;    // 반사 비율
  skillSeal?: boolean;        // 스킬 봉인
  threshold?: number;         // 즉사 체력 기준
  damage?: number;            // 추가 데미지
  summonBoost?: number;       // 소환물 강화
  guaranteed_first?: boolean; // 선공 보장
  element?: 'FIRE' | 'ICE' | 'LIGHTNING' | 'DARK'; // 원소
  range?: 'SHORT' | 'MEDIUM' | 'LONG'; // 사거리
  count?: number;             // 분신 수
  gaugeBonus?: number;        // 게이지 보너스
  extra?: string;             // 추가 효과

  // 레거시 호환용 (기존 전투 시스템)
  trigger?: 'ALWAYS' | 'PROBABILITY';
  probability?: number;
  target?: 'SELF' | 'ENEMY';
}

// 기본기 타입
export type BasicSkillType = 'ATTACK' | 'DEFENSE' | 'UTILITY';

// 기본기
export interface BasicSkill {
  id: string;
  name: string;
  description: string;
  type: BasicSkillType;
  effect: SkillEffect;
}

// 필살기
export interface UltimateSkill {
  id: string;
  name: string;
  description: string;
  effect: SkillEffect;
  gaugeRequired: number;  // 필요 게이지 (보통 100)
  unlockCondition?: {
    type: 'LEVEL' | 'ACHIEVEMENT';
    value: number | string;
  };
}

// 레거시 스킬 (기존 호환용)
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

  // 레거시 스킬 (기존 호환용)
  skill: Skill;

  // 새로운 기술 시스템
  basicSkills: BasicSkill[];      // 기본기 (3개)
  ultimateSkill: UltimateSkill;   // 필살기 (영역전개 등)

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

// 전투 유닛 상태 (새 전투 시스템)
export interface BattleUnit {
  card: CharacterCard;
  currentHp: number;
  maxHp: number;
  ultimateGauge: number;  // 0-100
  statusEffects: StatusEffect[];
  buffs: Buff[];
}

// 상태이상
export interface StatusEffect {
  type: 'STUN' | 'BURN' | 'POISON' | 'SLEEP' | 'BLIND' | 'SLOW';
  duration: number;
  value?: number;  // 도트 데미지 등
}

// 버프/디버프
export interface Buff {
  type: 'ATK' | 'DEF' | 'SPD';
  value: number;
  duration: number;
}

// 턴 전투 결과
export interface TurnResult {
  turn: number;
  attackerCardId: string;
  defenderCardId: string;
  skillUsed: BasicSkill | UltimateSkill;
  damage: number;
  isCritical: boolean;
  isUltimate: boolean;
  statusApplied?: StatusEffect;
  attackerHpAfter: number;
  defenderHpAfter: number;
  attackerGaugeAfter: number;
  defenderGaugeAfter: number;
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

// ========================================
// 시즌 & 리그 시스템
// ========================================

// AI 크루 정보
export interface AICrew {
  id: string;
  name: string;
  difficulty: Difficulty;
  crew: string[];  // 카드 ID 5장
  description: string;
}

// 리그 경기 결과
export type MatchResult = 'WIN' | 'LOSE' | 'DRAW' | 'PENDING';

// 리그 경기
export interface LeagueMatch {
  id: string;
  homeCrewId: string;
  awayCrewId: string;
  result: MatchResult;
  homeScore: number;
  awayScore: number;
  played: boolean;
}

// 리그 순위표 엔트리
export interface LeagueStanding {
  crewId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;    // 총 득점 (라운드 승리 수)
  goalsAgainst: number; // 총 실점
  goalDifference: number;
}

// 시즌 데이터
export interface Season {
  id: string;
  number: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  matches: LeagueMatch[];
  standings: LeagueStanding[];
  currentMatchIndex: number;
  champion?: string;  // 우승 크루 ID
}

// 시즌 히스토리
export interface SeasonHistory {
  seasonNumber: number;
  champion: string;
  playerRank: number;
  playerPoints: number;
}

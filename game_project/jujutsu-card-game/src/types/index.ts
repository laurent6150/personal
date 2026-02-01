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

// 경기장 효과 타겟
export type ArenaEffectTarget =
  | Attribute            // 속성 타겟
  | 'ALL'                // 모든 캐릭터
  | 'LOW_DEF'            // DEF 낮은 쪽
  | 'LOSER'              // 패배자
  | 'RANDOM'             // 랜덤 (확률적 효과)
  | 'HIGHEST_ATK'        // 최고 ATK
  | 'FIRST_STRIKE'       // 선공자
  | 'LOW_HP'             // HP 50% 이하
  | 'SPECIAL_GRADE'      // 특급 등급
  | 'NON_SPECIAL'        // 1급 이하
  | 'HEAL'               // 회복 스킬 효과
  | 'ON_HEAL'            // HP 회복 시 트리거
  | 'RANDOM_DEBUFF';     // 랜덤 디버프

// 경기장 효과
export interface ArenaEffect {
  type: ArenaEffectType;
  target: ArenaEffectTarget;
  value: number;
  stat?: 'atk' | 'def' | 'spd' | 'ce' | 'hp';  // STAT_MODIFY용 스탯 지정
  description: string;
}

// 경기장 카테고리
export type ArenaCategory = 'LOCATION' | 'DOMAIN' | 'SPECIAL';

// 경기장
export interface Arena {
  id: string;
  name: { ko: string; en: string };
  description: string;
  imageUrl: string;
  effects: ArenaEffect[];
  category: ArenaCategory;
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

// 시즌 상태
export type SeasonStatus = 'REGULAR' | 'PLAYOFF_SEMI' | 'PLAYOFF_FINAL' | 'COMPLETED';

// 플레이오프 경기
export interface PlayoffMatch {
  homeCrewId: string;
  awayCrewId: string;
  homeWins: number;
  awayWins: number;
  result?: 'HOME' | 'AWAY';  // 시리즈 승자
  matches: LeagueMatch[];    // 개별 경기들
}

// 플레이오프 데이터
export interface Playoff {
  qualified: string[];  // TOP 4 크루 ID
  semiFinals: [PlayoffMatch, PlayoffMatch];
  final?: PlayoffMatch;
  champion?: string;
}

// 시즌 데이터 (확장)
export interface Season {
  id: string;
  number: number;
  status: SeasonStatus;
  matches: LeagueMatch[];
  standings: LeagueStanding[];
  currentMatchIndex: number;
  champion?: string;  // 우승 크루 ID
  playoff?: Playoff;  // 플레이오프 데이터
}

// 통산 전적
export interface HeadToHeadRecord {
  vsId: string;      // 상대 크루 ID
  wins: number;
  draws: number;
  losses: number;
  history: {
    seasonNumber: number;
    result: 'WIN' | 'DRAW' | 'LOSS';
  }[];
}

// 캐릭터 시즌 성장 기록
export interface CharacterSeasonGrowth {
  cardId: string;
  startLevel: number;
  endLevel: number;
  expGained: number;
  statsGained: Partial<Stats>;
  wins: number;
  losses: number;
}

// 시즌 요약 데이터
export interface SeasonSummary {
  seasonNumber: number;
  finalRank: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  characterGrowth: CharacterSeasonGrowth[];
  mvpCardId?: string;  // 가장 많은 승리 기여
  highlights: {
    type: 'WIN_STREAK' | 'COMEBACK' | 'PERFECT_GAME' | 'CLUTCH';
    description: string;
  }[];
  playoffResult?: {
    qualified: boolean;
    reachedFinal: boolean;
    isChampion: boolean;
  };
}

// 시즌 히스토리 (확장)
export interface SeasonHistory {
  seasonNumber: number;
  champion: string;
  playerRank: number;
  playerPoints: number;
  playoffResult?: 'CHAMPION' | 'FINALIST' | 'SEMI' | 'NOT_QUALIFIED';
  summary?: SeasonSummary;
}

// ========================================
// 카드 기록 시스템
// ========================================

// 수상 유형
export type AwardType = 'MVP' | 'MOST_WINS';

// 수상 정보
export interface Award {
  type: AwardType;
  seasonNumber: number;
  cardId: string;
}

// 수상 설정
export const AWARD_CONFIG: Record<AwardType, {
  name: string;
  icon: string;
  description: string;
}> = {
  MVP: {
    name: 'MVP',
    icon: '🏆',
    description: '시즌 최고 기여도'
  },
  MOST_WINS: {
    name: '다승왕',
    icon: '👑',
    description: '시즌 최다 승리'
  }
};

// 시즌별 카드 기록
export interface CardSeasonRecord {
  wins: number;
  losses: number;
  // 경기장별 전적 (플레이한 것만)
  arenaRecords: Record<string, { wins: number; losses: number }>;
  // 상대 카드별 전적 (교전한 것만)
  vsRecords: Record<string, { wins: number; losses: number }>;
  // 확장 통계
  maxWinStreak: number;           // 최대 연승
  currentWinStreak: number;       // 현재 연승 (내부 추적용)
  totalDamageDealt: number;       // 입힌 총 데미지
  totalDamageReceived: number;    // 받은 총 데미지
  mvpCount: number;               // 라운드 MVP 횟수 (가장 많은 데미지)
  ultimateHits: number;           // 필살기(스킬) 적중 횟수
}

// 카드 전체 기록
export interface CardRecord {
  cardId: string;
  // 시즌별 기록
  seasonRecords: Record<number, CardSeasonRecord>;
  // 수상 이력
  awards: Award[];
}

// 전체 기록 스토어 상태
export interface CardRecordState {
  records: Record<string, CardRecord>;
  seasonAwards: Record<number, Award[]>;
}

// 통계 계산용 (통산/시즌별)
export interface CardStats {
  cardId: string;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  // 소속 크루 (현재 시즌)
  crewId?: string;
  crewName?: string;
}

// ========================================
// 뉴스 피드 시스템
// ========================================

// 뉴스 유형
export type NewsType =
  | 'MATCH_RESULT'      // 경기 결과
  | 'STREAK'            // 연승/연패
  | 'RECORD'            // 기록 경신
  | 'AWARD'             // 수상 소식
  | 'TRADE'             // 트레이드
  | 'SEASON_START'      // 시즌 시작
  | 'SEASON_END'        // 시즌 종료
  | 'PLAYOFF'           // 플레이오프 소식
  | 'MILESTONE';        // 마일스톤 달성

// 뉴스 아이템
export interface NewsItem {
  id: string;
  type: NewsType;
  timestamp: number;
  seasonNumber: number;
  title: string;
  content: string;
  highlight?: boolean;  // 주요 뉴스 여부
  relatedCards?: string[];  // 관련 카드 ID
  relatedCrews?: string[];  // 관련 크루 ID
}

// 뉴스 피드 스토어 상태
export interface NewsFeedState {
  news: NewsItem[];
  lastReadTimestamp: number;
}

// ========================================
// 트레이드 시스템
// ========================================

// 등급별 포인트
export const GRADE_POINTS: Record<Grade, number> = {
  '특급': 10,
  '1급': 5,
  '준1급': 3,
  '2급': 2,
  '준2급': 1,
  '3급': 1
};

// 트레이드 상태
export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

// 트레이드 거절 사유
export type TradeRejectReason =
  | 'POINT_DIFF_TOO_HIGH'  // 포인트 차이가 너무 큼
  | 'NEED_THIS_CARD'       // 해당 카드가 필요함
  | 'GRADE_LIMIT'          // 등급 제한 초과
  | 'NOT_INTERESTED';      // 관심 없음

// 트레이드 제안
export interface TradeOffer {
  id: string;
  seasonNumber: number;
  timestamp: number;
  proposerCrewId: string;    // 제안하는 크루
  targetCrewId: string;      // 제안 받는 크루
  offeredCardId: string;     // 제안하는 카드
  requestedCardId: string;   // 요청하는 카드
  status: TradeStatus;
  rejectReason?: TradeRejectReason;
  isForced?: boolean;        // 강제 트레이드 여부
}

// AI 트레이드 평가 결과
export interface TradeEvaluation {
  shouldAccept: boolean;
  reason: TradeRejectReason | 'FAIR_TRADE' | 'GOOD_DEAL';
  pointDifference: number;
}

// 우승 보너스 (등급 제한 확장)
export interface ChampionshipBonus {
  seasonNumber: number;
  specialGradeBonus: number;  // 특급 추가 가능 수
  grade1Bonus: number;        // 1급 추가 가능 수
}

// 트레이드 스토어 상태
export interface TradeState {
  tradeHistory: TradeOffer[];
  pendingOffers: TradeOffer[];
  championships: ChampionshipBonus[];
}

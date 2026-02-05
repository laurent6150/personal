// ========================================
// 주술회전 카드 게임 "영역전개" - 타입 정의
// ========================================

// 기본 타입
export type Attribute = 'BARRIER' | 'BODY' | 'CURSE' | 'SOUL' | 'CONVERT' | 'RANGE';
export type Grade = '특급' | '준특급' | '1급' | '준1급' | '2급' | '준2급' | '3급' | '준3급' | '비술사';
export type GradeId = 'S' | 'S-' | 'A' | 'A-' | 'B' | 'B-' | 'C' | 'C-' | 'D';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type Rarity = ItemRarity;

// ========================================
// 8각형 스탯 시스템
// ========================================

// 확장된 스탯 인터페이스 (5개 → 8개)
export interface Stats {
  atk: number;   // 공격력 - 기본 데미지
  def: number;   // 방어력 - 데미지 감소
  spd: number;   // 속도 - 선공 결정
  ce: number;    // 주력 - 스킬 자원
  hp: number;    // 체력 - 생존력
  crt: number;   // 치명 - 크리티컬 확률/데미지 (신규)
  tec: number;   // 기술 - 스킬 효과 증폭 (신규)
  mnt: number;   // 정신 - 상태이상 저항 (신규)
}

// 기존 5스탯 호환용 (마이그레이션)
export interface LegacyStats {
  atk: number;
  def: number;
  spd: number;
  ce: number;
  hp: number;
}

// 5스탯 또는 8스탯 허용 (캐릭터 데이터 파일용)
export type BaseStats = LegacyStats | Stats;

// 스탯 키 타입
export type StatKey = keyof Stats;
export type LegacyStatKey = keyof LegacyStats;

// 기존 6등급 호환용 (캐릭터 데이터 파일에서 사용)
export type LegacyGrade = '특급' | '1급' | '준1급' | '2급' | '준2급' | '3급';

// ========================================
// 9단계 등급 시스템
// ========================================

export interface GradeDefinition {
  id: GradeId;
  name: Grade;
  minStat: number;    // 최소 총 스탯
  color: string;      // 테마 색상
  textColor: string;  // 텍스트 색상
  maxInDeck: number;  // 덱 내 최대 수
}

// ========================================
// 폼 상태 시스템
// ========================================

export type FormState = 'HOT' | 'RISING' | 'STABLE' | 'COLD' | 'SLUMP';

export interface FormConfig {
  statBonus: number;    // 스탯 보너스 비율 (-0.10 ~ +0.10)
  expBonus: number;     // 경험치 보너스 배율 (0.5 ~ 1.5)
  icon: string;         // 표시 아이콘
  name: string;         // 한글 이름
  color: string;        // 테마 색상
}

// ========================================
// 컨디션 시스템
// ========================================

export interface CharacterCondition {
  value: number;               // 50 ~ 100
  consecutiveBattles: number;  // 연속 출전 횟수
  lastRestRound: number;       // 마지막 휴식 라운드
}

// ========================================
// 성장 시스템
// ========================================

export interface CharacterProgress {
  cardId: string;
  level: number;        // 1 ~ 10
  exp: number;          // 현재 레벨 내 경험치
  totalExp: number;     // 누적 총 경험치
  recentResults: boolean[];  // 최근 5경기 결과 (폼 계산용)
  condition: CharacterCondition;
  currentForm: FormState;
  // 성장으로 인한 추가 스탯
  bonusStats: Stats;
}

// 경험치 변화 상세
export interface ExpChangeDetails {
  result: 'WIN' | 'LOSE';
  remainingHpPercent: number;  // 남은 HP 비율
  enemyHpPercent: number;      // 상대 남은 HP 비율
  isMvp: boolean;              // MVP 여부
  winStreak: number;           // 현재 연승
}

// 레벨업/다운 결과
export interface LevelChangeResult {
  previousLevel: number;
  newLevel: number;
  previousExp: number;
  newExp: number;
  statChange: Partial<Stats>;
  notification?: string;
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
  // 새 필살기 효과 시스템
  damage?: number;         // 기본 데미지
  ceCost?: number;         // CE 소모량
  effects?: UltimateEffect[];  // 추가 효과들
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
// baseStats는 레거시(5스탯) 또는 풀(8스탯) 모두 허용
export interface CharacterCard {
  id: string;
  name: { ko: string; ja: string; en: string };
  grade: LegacyGrade;  // 기존 6등급 사용 (특급~3급)
  attribute: Attribute;
  imageUrl: string;
  baseStats: BaseStats;  // 5스탯 또는 8스탯 모두 허용
  growthStats: { primary: LegacyStatKey; secondary: LegacyStatKey };  // 기본 5스탯 키만 사용

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
  odId?: string;                     // 개인 리그용 별칭 (cardId와 동일)
  level: number;           // 1-10
  exp: number;
  totalExp: number;        // 누적 총 경험치 (신규)
  equipment: [string | null, string | null];  // 장비 슬롯 2개
  stats: {
    totalWins: number;
    totalLosses: number;
    vsRecord: Record<string, { wins: number; losses: number }>;
    arenaRecord: Record<string, { wins: number; losses: number }>;
  };
  unlockedAchievements: string[];

  // 성장 시스템 (신규)
  bonusStats: Stats;                 // 레벨업으로 얻은 추가 스탯
  condition: CharacterCondition;     // 컨디션
  currentForm: FormState;            // 폼 상태
  recentResults: boolean[];          // 최근 5경기 결과 (true = 승)
  currentWinStreak: number;          // 현재 연승
  maxWinStreak: number;              // 최대 연승

  // FA 시스템 (Phase 4)
  crewId?: string;                   // 현재 소속 크루 ID
  consecutiveSeasons?: number;       // 현재 크루 연속 시즌
  faStatus?: 'PENDING' | 'FA' | 'RENEWED'; // FA 상태
}

// 소유 카드 별칭 (하위 호환성)
export type OwnedCard = PlayerCard;

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
  currentCe: number;
  ultimateGauge: number;  // 0-100
  appliedEffects: AppliedStatusEffect[];  // 적용된 상태이상
  buffs: Buff[];
}

// ========================================
// 상태이상 시스템 (필살기 효과용)
// ========================================

// 상태이상 효과 트리거
export type StatusEffectTrigger = 'TURN_START' | 'TURN_END' | 'ON_ACTION' | 'ON_HIT' | 'INSTANT';

// 상태이상 액션
export type StatusEffectAction =
  | 'SKIP_TURN'              // 행동 불가
  | 'BLOCK_SKILL'            // 스킬 봉인
  | 'DAMAGE'                 // 지속 데미지
  | 'STAT_REDUCE'            // 스탯 감소
  | 'STAT_BOOST'             // 스탯 증가
  | 'BLOCK_HEAL'             // 회복 봉인
  | 'EXECUTE_THRESHOLD'      // HP% 이하 즉사
  | 'DAMAGE_TAKEN_INCREASE'  // 피해 증가
  | 'HEAL'                   // 지속 회복
  | 'ABSORB_DAMAGE'          // 데미지 흡수(보호막)
  | 'COUNTER_ATTACK'         // 반격
  | 'DODGE';                 // 회피

// 상태이상 타입
export type StatusEffectCategory = 'DEBUFF' | 'BUFF' | 'CONTROL';

// 상태이상 정의 (데이터용)
export interface StatusEffect {
  id: string;
  name: string;
  type: StatusEffectCategory;
  duration: number;
  stackable: boolean;
  maxStacks?: number;
  effect: {
    trigger: StatusEffectTrigger;
    action: StatusEffectAction;
    value: number;
    stat?: keyof Stats;  // STAT_REDUCE/STAT_BOOST용
  };
  icon: string;
}

// 적용된 상태이상 (전투 중)
export interface AppliedStatusEffect {
  statusId: string;
  remainingDuration: number;
  stacks: number;
  shieldAmount?: number;  // 보호막 잔여량
}

// 버프/디버프 (레거시 호환)
export interface Buff {
  type: 'ATK' | 'DEF' | 'SPD';
  value: number;
  duration: number;
}

// ========================================
// 필살기 효과 시스템
// ========================================

// 필살기 효과 타입
export type UltimateEffectType =
  | 'STATUS'                 // 상태이상 부여
  | 'LIFESTEAL'              // 데미지의 N% HP 회복
  | 'IGNORE_DEF'             // 방어력 N% 무시
  | 'CE_DRAIN'               // 상대 CE N 흡수
  | 'CRITICAL_GUARANTEED'    // 크리티컬 확정
  | 'MULTI_HIT'              // N회 다중 공격
  | 'RANDOM_DAMAGE'          // 데미지 랜덤 (min~max)
  | 'SELF_DAMAGE'            // 자해 데미지
  | 'HEAL_SELF'              // 자신 HP 회복
  | 'REMOVE_DEBUFF'          // 디버프 제거
  | 'REMOVE_BUFF';           // 상대 버프 제거

// 필살기 효과 타겟
export type UltimateEffectTarget = 'ENEMY' | 'SELF' | 'ALL';

// 필살기 개별 효과
export interface UltimateEffect {
  type: UltimateEffectType;
  target: UltimateEffectTarget;
  statusId?: string;           // STATUS 타입용 상태이상 ID
  value?: number | { min: number; max: number };  // 효과 수치 또는 랜덤 범위
  chance?: number;             // 적용 확률 (기본 100)
}

// 턴 전투 결과
export interface TurnResult {
  turn: number;
  attackerCardId: string;
  defenderCardId: string;
  skillUsed?: BasicSkill | UltimateSkill;
  damage: number;
  isCritical: boolean;
  isUltimate: boolean;
  isMultiHit?: boolean;
  hitCount?: number;
  statusApplied?: AppliedStatusEffect[];  // 부여된 상태이상들
  statusTriggered?: string[];             // 발동된 상태이상 (화상 데미지 등)
  healAmount?: number;                    // 회복량
  selfDamage?: number;                    // 자해 데미지
  attackerHpAfter: number;
  defenderHpAfter: number;
  attackerCeAfter?: number;
  defenderCeAfter?: number;
  attackerGaugeAfter: number;
  defenderGaugeAfter: number;
  log?: string[];                         // 전투 로그 메시지
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
  // 필살기 효과 시스템 추가
  ultimateUsed?: { player: boolean; ai: boolean };
  ultimateDamage?: { player: number; ai: number };
  statusEffectsApplied?: {
    player: AppliedStatusEffect[];
    ai: AppliedStatusEffect[];
  };
  turnLogs?: TurnResult[];
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

  // 밴픽 & 카드 배치 시스템 (Phase 2)
  banPickInfo?: BanPickInfo;
  cardAssignments?: CardAssignment[];
}

// ========================================
// 밴픽 시스템 (Phase 2)
// ========================================

// 밴픽 정보
export interface BanPickInfo {
  playerBannedArena: string | null;  // 플레이어가 밴한 경기장 ID
  aiBannedArena: string | null;      // AI가 밴한 경기장 ID
  selectedArenas: Arena[];           // 선택된 5개 경기장 (순서 확정)
}

// 카드 배치 정보
export interface CardAssignment {
  arenaId: string;      // 경기장 ID
  arenaIndex: number;   // 경기 순서 (0-4)
  cardId: string | null; // 배치된 카드 ID (null이면 미배치)
}

// 밴픽 단계
export type BanPickPhase =
  | 'PLAYER_BAN'      // 플레이어 밴 선택
  | 'AI_BAN'          // AI 밴 진행
  | 'BAN_RESULT'      // 밴 결과 표시
  | 'CARD_PLACEMENT'  // 카드 배치
  | 'READY';          // 경기 준비 완료

// 경기장 분석 결과 (추천용)
export interface ArenaAnalysis {
  arenaId: string;
  favoredAttribute: Attribute | null;
  weakenedAttribute: Attribute | null;
  hasSpeedReverse: boolean;
  hasAttributeNullify: boolean;
  recommendedCards: string[];  // 추천 카드 ID
  avoidCards: string[];        // 비추천 카드 ID
}

// 크루 속성 분석 결과
export interface CrewAttributeAnalysis {
  dominant: Attribute;         // 가장 많은 속성
  distribution: Record<Attribute, number>;  // 속성별 카드 수
}

// 경기장 적합도 점수
export interface ArenaFitScore {
  cardId: string;
  arenaId: string;
  score: number;
  reasons: string[];
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

// 등급별 포인트 (기존 6등급 호환)
export const GRADE_POINTS: Record<LegacyGrade, number> = {
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

// ========================================
// 개인 리그 토너먼트 시스템 (Phase 3)
// ========================================

// 개인 리그 상태
export type IndividualLeagueStatus =
  | 'NOT_STARTED'
  | 'ROUND_32'
  | 'ROUND_16_NOMINATION'  // 16강 지명 단계
  | 'ROUND_16'
  | 'QUARTER'
  | 'SEMI'
  | 'FINAL'
  | 'FINISHED';

// 16강 지명 단계
export interface NominationStep {
  groupId: string;           // 조 ID ('A' ~ 'H')
  nominatorId: string | null;  // 지명하는 참가자 ID
  nominatorPosition: number;   // 지명자의 조 내 순서 (1=시드, 2, 3)
  targetPosition: number;      // 지명할 위치 (2, 3, 4)
  nomineeId: string | null;    // 지명된 참가자 ID
  isCompleted: boolean;        // 지명 완료 여부
}

// 개인 리그 매치 형식
export type LeagueMatchFormat = '1WIN' | '2WIN' | '3WIN';

// 개인 리그 참가자
export interface LeagueParticipant {
  odId: string;           // 캐릭터 ID (선수 ID)
  odName: string;         // 캐릭터 이름
  crewId: string;         // 소속 크루 ID
  crewName: string;       // 소속 크루 이름
  isPlayerCrew: boolean;  // 플레이어 크루 소속 여부
  // 토너먼트 진행 상태
  status: 'ACTIVE' | 'ELIMINATED';
  eliminatedAt?: IndividualLeagueStatus;  // 탈락 라운드
  // 성적 (Phase 3 - 시드 결정용)
  wins?: number;          // 총 승리 수
  losses?: number;        // 총 패배 수
  dominantWins?: number;  // 압승 횟수 (HP 70% 이상 남기고 승리)
  totalStats?: number;    // 총 스탯
}

// 개인 리그 매치
export interface IndividualMatch {
  id: string;
  participant1: string;   // 참가자 odId
  participant2: string;   // 참가자 odId
  winner: string | null;  // 승자 odId
  score: { p1: number; p2: number };
  format: LeagueMatchFormat;
  played: boolean;
  arenas?: string[];      // 사용된 경기장 ID들
}

// 개인 리그 조 (16강 - 4명 조별 리그)
export interface LeagueGroup {
  id: string;             // 'A' ~ 'H'
  participants: string[]; // 참가자 odId (4명 - 시드 + 지명된 3명)
  seedId: string | null;  // 시드 참가자 ID
  matches: IndividualMatch[];
  winner: string | null;  // 조 우승자
  // 각 참가자별 승리 수
  winsCount: Record<string, number>;
}

// 개인 리그 대진표
export interface IndividualBrackets {
  round32: IndividualMatch[];     // 16경기 (32명 → 16명)
  round16: LeagueGroup[];         // 8개 조 (16명 → 8명)
  quarter: IndividualMatch[];     // 4경기 (8명 → 4명)
  semi: IndividualMatch[];        // 2경기 (4명 → 2명)
  final: IndividualMatch | null;  // 1경기 (2명 → 1명)
}

// 개인 리그 데이터
export interface IndividualLeague {
  season: number;
  status: IndividualLeagueStatus;
  participants: LeagueParticipant[];  // 32명
  brackets: IndividualBrackets;
  champion: string | null;            // 우승자 odId
  runnerUp: string | null;            // 준우승자 odId
  // 내 카드 현황 추적용
  myCardResults: {
    odId: string;
    finalResult: IndividualLeagueStatus;  // 탈락 라운드
    rewardClaimed: boolean;
  }[];
  // 16강 지명 시스템 (Phase 3)
  nominationSteps?: NominationStep[];      // 지명 단계들 (24단계)
  currentNominationIndex?: number;          // 현재 지명 단계
  round16Seeds?: string[];                  // 16강 시드 (32강 우승자 8명)
}

// 개인 리그 히스토리
export interface IndividualLeagueHistory {
  season: number;
  champion: string;           // 우승자 odId
  championName: string;       // 우승자 이름
  runnerUp: string;           // 준우승자 odId
  runnerUpName: string;       // 준우승자 이름
  myCardResults: {
    odId: string;
    odName: string;
    result: IndividualLeagueStatus;
    isChampion: boolean;
    isRunnerUp: boolean;
  }[];
}

// 개인 리그 스토어 상태
export interface IndividualLeagueState {
  currentSeason: number;
  currentLeague: IndividualLeague | null;
  history: IndividualLeagueHistory[];
  // 명예의 전당
  hallOfFame: {
    season: number;
    championId: string;
    championName: string;
    crewName: string;
  }[];
}

// 개인 리그 보상 설정
export const INDIVIDUAL_LEAGUE_REWARDS: Record<IndividualLeagueStatus, {
  exp: number;
  title?: string;
  badge?: string;
}> = {
  'NOT_STARTED': { exp: 0 },
  'ROUND_32': { exp: 50 },              // 32강 탈락
  'ROUND_16_NOMINATION': { exp: 75 },   // 16강 지명 (지명됨)
  'ROUND_16': { exp: 100 },             // 16강 진출
  'QUARTER': { exp: 200 },              // 8강 진출
  'SEMI': { exp: 300 },                 // 4강 진출
  'FINAL': { exp: 500 },                // 결승 진출 (준우승)
  'FINISHED': { exp: 1000, title: '챔피언', badge: '🏆' }  // 우승
};

// ========================================
// Phase 4: 추가 시스템들
// ========================================

// ========================================
// 에이스 결정전 시스템
// ========================================

// 에이스전 상태
export interface AceMatchState {
  isActive: boolean;
  playerAceId: string | null;
  aiAceId: string | null;
  result: 'PENDING' | 'PLAYER_WIN' | 'AI_WIN' | null;
}

// 에이스 카드 정보 (선택 UI용)
export interface AceCandidate {
  cardId: string;
  name: string;
  currentSeriesWins: number;
  currentSeriesLosses: number;
  condition: number;
  recommendation?: string;  // 추천 이유
}

// ========================================
// 올킬/역올킬 시즌 시스템
// ========================================

// 올킬 시즌 여부 체크 (3의 배수 시즌)
export const ALLKILL_SEASONS = [3, 6, 9, 12, 15, 18, 21, 24];

// 올킬 상태
export interface AllKillState {
  isAllKillSeason: boolean;
  currentStreakCardId: string | null;  // 연승 중인 카드
  currentStreak: number;               // 현재 연승 수
  remainingHp: number;                 // 남은 HP
  remainingHpPercent: number;          // 남은 HP %
  activeStatusEffects: string[];       // 유지 중인 상태이상
  conditionPenalty: number;            // 누적 컨디션 패널티
}

// 올킬 선택
export type AllKillChoice = 'CONTINUE' | 'NEW_CARD';

// 올킬 보상
export const ALLKILL_REWARDS = {
  allKill: { points: 10, badge: '🔥 올킬!' },       // 3연속 승리
  reverseAllKill: { points: 5, badge: '🛡️ 역올킬' } // 상대 올킬 저지
};

// 올킬 시스템 상수
export const ALLKILL_HP_DECAY = 15;         // 연승당 HP 감소 %
export const ALLKILL_CONDITION_DECAY = 10;  // 연승당 컨디션 감소 %

// ========================================
// 트레이드 마감 시스템
// ========================================

// 트레이드 마감 기준
export const TRADE_DEADLINE_THRESHOLD = 0.7;  // 70%

// 트레이드 상태
export interface TradeDeadlineState {
  isLocked: boolean;
  seasonProgress: number;      // 0.0 ~ 1.0
  remainingMatches: number;
  totalMatches: number;
  warningShown: boolean;       // 60% 경고 표시 여부
}

// ========================================
// FA (Free Agent) 시스템
// ========================================

// FA 자격 기준
export const FA_QUALIFICATION_SEASONS = 3;  // 3시즌 연속

// FA 상태
export interface FAStatus {
  cardId: string;
  cardName: string;
  currentCrewId: string;
  currentCrewName: string;
  seasonsWithCrew: number;     // 현재 크루에서 연속 시즌 수
  isFreeAgent: boolean;        // FA 자격 보유 여부
  hasDeclared: boolean;        // FA 선언 여부
}

// FA 이적 결과
export interface FATransferResult {
  cardId: string;
  fromCrewId: string;
  toCrewId: string;
  season: number;
}

// FA 스토어 상태
export interface FAState {
  eligibleCards: FAStatus[];           // FA 자격 카드들
  pendingDeclarations: string[];       // 선언 대기 중인 카드 ID
  transferHistory: FATransferResult[]; // 이적 히스토리
}

// ========================================
// 명예의 전당 시스템
// ========================================

// 시즌 챔피언 기록
export interface SeasonChampionRecord {
  season: number;
  crewId: string;
  crewName: string;
  crewCardIds: string[];  // 우승 당시 크루 카드 ID 목록
  wins: number;
  losses: number;
  isPlayoffChampion: boolean;
}

// 개인 리그 챔피언 기록
export interface IndividualChampionRecord {
  season: number;
  championId: string;  // 우승 카드 ID
  cardId: string;      // cardId 별칭 (호환성)
  cardName: string;
  crewName: string;
}

// 시즌 MVP 기록
export interface SeasonMvpRecord {
  season: number;
  cardId: string;
  cardName: string;
  wins: number;
  losses: number;
  winRate: number;
}

// 통산 기록 항목
export interface AllTimeRecord {
  cardId: string;
  cardName: string;
  value: number;  // 승수, 승률(%), 연승 등
  detail?: string;
}

// 명예의 전당 데이터
export interface HallOfFameData {
  seasonChampions: SeasonChampionRecord[];
  individualChampions: IndividualChampionRecord[];
  seasonMvps: SeasonMvpRecord[];
  allTimeRecords: {
    mostWins: AllTimeRecord[];
    highestWinRate: AllTimeRecord[];
    longestStreak: AllTimeRecord[];
  };
}

// ========================================
// 전투 해설 메시지 시스템
// ========================================

// 해설 메시지 타입
export type BattleCommentType =
  | 'battleStart'
  | 'critical'
  | 'ultimate'
  | 'lowHp'
  | 'comeback'
  | 'dominance'
  | 'closeMatch'
  | 'statusApplied'
  | 'battleEnd'
  | 'aceMatch'
  | 'allKill';

// 해설 메시지 파라미터
export interface BattleCommentParams {
  player?: string;
  enemy?: string;
  arena?: string;
  skillName?: string;
  character?: string;
  icon?: string;
  target?: string;
  status?: string;
  winner?: string;
  loser?: string;
  streak?: number;
}

// 해설 메시지 정의
export const BATTLE_COMMENTS: Record<BattleCommentType, string[]> = {
  battleStart: [
    "🎤 {player}와 {enemy}의 대결이 시작됩니다!",
    "🎤 양측 선수 입장! 긴장감이 감돕니다!",
    "🎤 {arena}에서 펼쳐지는 한판 승부!"
  ],
  critical: [
    "🎤 💥 치명타! 완벽한 타이밍입니다!",
    "🎤 💥 급소를 정확히 노렸습니다!",
    "🎤 💥 대단한 일격! 관중석이 들썩입니다!"
  ],
  ultimate: [
    "🎤 ⚡ 영역전개! {skillName}!",
    "🎤 ⚡ 필살기 발동! 승부수를 던집니다!",
    "🎤 ⚡ 이것이 {player}의 진정한 술식!"
  ],
  lowHp: [
    "🎤 😰 {character}가 위험합니다! HP가 얼마 남지 않았어요!",
    "🎤 😰 절체절명의 위기!",
    "🎤 😰 여기서 버틸 수 있을까요?"
  ],
  comeback: [
    "🎤 🔥 믿을 수 없습니다! 역전의 한 방!",
    "🎤 🔥 포기하지 않는 자만이 승리합니다!",
    "🎤 🔥 경기가 완전히 뒤집어졌습니다!"
  ],
  dominance: [
    "🎤 💪 {player}의 일방적인 경기입니다!",
    "🎤 💪 상대를 압도하고 있습니다!",
    "🎤 💪 이대로 끝나는 걸까요?"
  ],
  closeMatch: [
    "🎤 ⚔️ 박빙의 승부입니다!",
    "🎤 ⚔️ 양측 한 치의 양보도 없습니다!",
    "🎤 ⚔️ 어느 쪽이 이겨도 이상하지 않아요!"
  ],
  statusApplied: [
    "🎤 {icon} {target}에게 {status} 부여!",
    "🎤 {icon} 상태이상이 발동됩니다!"
  ],
  battleEnd: [
    "🎤 🏆 {winner}의 승리입니다!",
    "🎤 🏆 멋진 경기였습니다!",
    "🎤 🏆 {loser}도 잘 싸웠습니다!"
  ],
  aceMatch: [
    "🎤 ⚔️ 에이스 결정전! 시리즈의 운명이 결정됩니다!",
    "🎤 ⚔️ 2:2 동점! 에이스끼리의 진검 승부!",
    "🎤 ⚔️ 모든 것을 건 한 판 승부!"
  ],
  allKill: [
    "🎤 🔥 {player} {streak}연승 중! 올킬까지 {remaining}승!",
    "🎤 🔥 올킬 도전이 계속됩니다!",
    "🎤 🔥 역올킬을 노리는 상대의 반격!"
  ]
};

// ========================================
// 성장 시스템 데이터 및 유틸리티
// 8각형 능력치, 9단계 등급, 폼, 컨디션
// ========================================

import type {
  Stats,
  Grade,
  LegacyGrade,
  GradeId,
  GradeDefinition,
  FormState,
  FormConfig,
  CharacterCondition,
  ExpChangeDetails,
  LevelChangeResult
} from '../types';

// ========================================
// 9단계 등급 시스템
// ========================================

export const GRADES: GradeDefinition[] = [
  { id: 'S',  name: '특급',   minStat: 150, color: '#FFD700', textColor: '#000000', maxInDeck: 1 },
  { id: 'S-', name: '준특급', minStat: 135, color: '#FFA500', textColor: '#000000', maxInDeck: 1 },
  { id: 'A',  name: '1급',    minStat: 120, color: '#FF6B6B', textColor: '#FFFFFF', maxInDeck: 2 },
  { id: 'A-', name: '준1급',  minStat: 105, color: '#FF8E8E', textColor: '#000000', maxInDeck: 2 },
  { id: 'B',  name: '2급',    minStat: 90,  color: '#4ECDC4', textColor: '#000000', maxInDeck: 3 },
  { id: 'B-', name: '준2급',  minStat: 75,  color: '#7ED4CD', textColor: '#000000', maxInDeck: 3 },
  { id: 'C',  name: '3급',    minStat: 60,  color: '#95A5A6', textColor: '#FFFFFF', maxInDeck: 5 },
  { id: 'C-', name: '준3급',  minStat: 45,  color: '#BDC3C7', textColor: '#000000', maxInDeck: 5 },
  { id: 'D',  name: '비술사', minStat: 0,   color: '#7F8C8D', textColor: '#FFFFFF', maxInDeck: 5 }
];

// 등급별 기본 신규 스탯 (CRT, TEC, MNT)
// 기존 6등급 + 신규 3등급 모두 지원
export const GRADE_BASE_NEW_STATS: Record<LegacyGrade | Grade, { crt: number; tec: number; mnt: number }> = {
  // 기존 6등급 (캐릭터 데이터 파일에서 사용)
  '특급':   { crt: 15, tec: 15, mnt: 15 },
  '1급':    { crt: 12, tec: 12, mnt: 12 },
  '준1급':  { crt: 10, tec: 10, mnt: 10 },
  '2급':    { crt: 8,  tec: 8,  mnt: 8 },
  '준2급':  { crt: 6,  tec: 6,  mnt: 6 },
  '3급':    { crt: 5,  tec: 5,  mnt: 5 },
  // 신규 3등급 (성장 시스템에서 사용)
  '준특급': { crt: 14, tec: 14, mnt: 14 },
  '준3급':  { crt: 4,  tec: 4,  mnt: 4 },
  '비술사': { crt: 3,  tec: 3,  mnt: 3 }
};

/**
 * 총 스탯 계산
 */
export function calculateTotalStat(stats: Stats): number {
  return stats.atk + stats.def + stats.spd + stats.ce + stats.hp +
         stats.crt + stats.tec + stats.mnt;
}

/**
 * 스탯 기반 등급 계산
 */
export function calculateGrade(stats: Stats): GradeDefinition {
  const totalStat = calculateTotalStat(stats);

  for (const grade of GRADES) {
    if (totalStat >= grade.minStat) return grade;
  }
  return GRADES[GRADES.length - 1];
}

/**
 * 등급 ID로 등급 정의 가져오기
 */
export function getGradeById(id: GradeId): GradeDefinition | undefined {
  return GRADES.find(g => g.id === id);
}

/**
 * 등급 이름으로 등급 정의 가져오기
 */
export function getGradeByName(name: Grade): GradeDefinition | undefined {
  return GRADES.find(g => g.name === name);
}

// ========================================
// 폼 상태 시스템
// ========================================

export const FORM_CONFIG: Record<FormState, FormConfig> = {
  HOT:    { statBonus: 0.10,  expBonus: 1.5, icon: '🔥', name: '최고 폼', color: '#FF4500' },
  RISING: { statBonus: 0.05,  expBonus: 1.2, icon: '📈', name: '상승세', color: '#32CD32' },
  STABLE: { statBonus: 0,     expBonus: 1.0, icon: '➡️', name: '안정',   color: '#808080' },
  COLD:   { statBonus: -0.05, expBonus: 0.8, icon: '📉', name: '하락세', color: '#4169E1' },
  SLUMP:  { statBonus: -0.10, expBonus: 0.5, icon: '❄️', name: '슬럼프', color: '#191970' }
};

/**
 * 최근 5경기 결과로 폼 계산
 */
export function calculateForm(recentResults: boolean[]): FormState {
  const wins = recentResults.filter(r => r).length;

  if (wins >= 5) return 'HOT';       // 5승
  if (wins >= 4) return 'RISING';    // 4승 1패
  if (wins >= 2) return 'STABLE';    // 2~3승
  if (wins >= 1) return 'COLD';      // 1승 4패
  return 'SLUMP';                     // 5패
}

/**
 * 폼에 따른 스탯 수정자 적용
 */
export function applyFormModifier(stats: Stats, form: FormState): Stats {
  const config = FORM_CONFIG[form];
  const modifier = 1 + config.statBonus;

  return {
    atk: Math.floor(stats.atk * modifier),
    def: Math.floor(stats.def * modifier),
    spd: Math.floor(stats.spd * modifier),
    ce: Math.floor(stats.ce * modifier),
    hp: Math.floor(stats.hp * modifier),
    crt: Math.floor(stats.crt * modifier),
    tec: Math.floor(stats.tec * modifier),
    mnt: Math.floor(stats.mnt * modifier)
  };
}

// ========================================
// 컨디션 시스템
// ========================================

export const CONDITION_MIN = 50;
export const CONDITION_MAX = 100;

/**
 * 컨디션에 따른 스탯 수정자 적용
 */
export function applyConditionModifier(stats: Stats, condition: number): Stats {
  const modifier = condition / 100; // 0.5 ~ 1.0

  return {
    atk: Math.floor(stats.atk * modifier),
    def: Math.floor(stats.def * modifier),
    spd: Math.floor(stats.spd * modifier),
    ce: Math.floor(stats.ce * modifier),
    hp: Math.floor(stats.hp * modifier),
    crt: Math.floor(stats.crt * modifier),
    tec: Math.floor(stats.tec * modifier),
    mnt: Math.floor(stats.mnt * modifier)
  };
}

/**
 * 전투 후 컨디션 업데이트
 */
export function updateCondition(
  condition: CharacterCondition,
  battleResult: 'WIN' | 'LOSE'
): CharacterCondition {
  let newValue = condition.value;

  // 출전 시 기본 감소
  newValue -= 5;

  // 결과에 따른 추가 감소
  if (battleResult === 'WIN') {
    newValue -= 3; // 총 -8%
  } else {
    newValue -= 7; // 총 -12%
  }

  // 최소값 제한
  newValue = Math.max(CONDITION_MIN, newValue);

  return {
    ...condition,
    value: newValue,
    consecutiveBattles: condition.consecutiveBattles + 1
  };
}

/**
 * 휴식으로 컨디션 회복
 */
export function restCharacter(condition: CharacterCondition, currentRound: number): CharacterCondition {
  return {
    value: Math.min(CONDITION_MAX, condition.value + 15),
    consecutiveBattles: 0,
    lastRestRound: currentRound
  };
}

/**
 * 컨디션 아이콘 가져오기
 */
export function getConditionIcon(value: number): string {
  if (value >= 90) return '💚';
  if (value >= 70) return '💛';
  return '🧡';
}

/**
 * 컨디션 상태 텍스트
 */
export function getConditionStatus(value: number): string {
  if (value >= 90) return '최상';
  if (value >= 70) return '양호';
  return '주의';
}

// ========================================
// 경험치/레벨 시스템
// ========================================

export const MAX_LEVEL = 10;

export const LEVEL_THRESHOLDS = [
  0,      // Lv.1
  200,    // Lv.2
  500,    // Lv.3
  1000,   // Lv.4
  2000,   // Lv.5
  3500,   // Lv.6
  5500,   // Lv.7
  8000,   // Lv.8
  11000,  // Lv.9
  15000   // Lv.10 (만렙)
];

/**
 * 경험치 변화량 계산
 */
export function calculateExpChange(details: ExpChangeDetails, formExpBonus: number = 1.0): number {
  let exp = 0;

  if (details.result === 'WIN') {
    exp = 100;
    // 압승 보너스 (HP 70% 이상 남음)
    if (details.remainingHpPercent >= 70) {
      exp = 150;
    }
    // MVP 보너스
    if (details.isMvp) {
      exp += 50;
    }
    // 연승 보너스
    exp += details.winStreak * 10;
  } else {
    exp = -30;
    // 완패 (상대 HP 70% 이상)
    if (details.enemyHpPercent >= 70) {
      exp = -50;
    }
  }

  // 폼 보너스 적용
  exp = Math.floor(exp * formExpBonus);

  return exp;
}

/**
 * 총 경험치로 레벨 계산
 */
export function getLevelFromTotalExp(totalExp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/**
 * 현재 레벨 내 경험치 계산
 */
export function getExpInCurrentLevel(totalExp: number, level: number): number {
  if (level <= 1) return totalExp;
  const prevThreshold = LEVEL_THRESHOLDS[level - 1];
  return totalExp - prevThreshold;
}

/**
 * 다음 레벨까지 필요한 경험치
 */
export function getExpToNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return LEVEL_THRESHOLDS[level] - LEVEL_THRESHOLDS[level - 1];
}

/**
 * 레벨업/다운으로 인한 스탯 변화
 */
export function getStatChangeForLevelDiff(levelDiff: number): Stats {
  return {
    atk: levelDiff,
    def: levelDiff,
    spd: levelDiff,
    ce: levelDiff,
    hp: levelDiff * 2, // HP는 2씩 변화
    crt: levelDiff,
    tec: levelDiff,
    mnt: levelDiff
  };
}

/**
 * 레벨 업데이트 (경험치 변화 후)
 */
export function updateLevel(
  currentLevel: number,
  currentTotalExp: number,
  expChange: number
): LevelChangeResult {
  const newTotalExp = Math.max(0, currentTotalExp + expChange);
  const newLevel = getLevelFromTotalExp(newTotalExp);
  const levelDiff = newLevel - currentLevel;

  let notification: string | undefined;
  if (levelDiff > 0) {
    notification = `🎉 레벨업! Lv.${newLevel}`;
  } else if (levelDiff < 0) {
    notification = `📉 레벨 하락... Lv.${newLevel}`;
  }

  return {
    previousLevel: currentLevel,
    newLevel,
    previousExp: currentTotalExp,
    newExp: newTotalExp,
    statChange: levelDiff !== 0 ? getStatChangeForLevelDiff(levelDiff) : {},
    notification
  };
}

// ========================================
// 신규 스탯 효과 계산
// ========================================

/**
 * CRT(치명) 스탯 효과 계산
 * - 크리티컬 확률 = 5% + (CRT * 0.5%)
 * - 크리티컬 데미지 = 150% + (CRT * 1%)
 */
export function getCriticalStats(crt: number): { chance: number; damage: number } {
  return {
    chance: 5 + (crt * 0.5),      // 백분율
    damage: 150 + (crt * 1)       // 백분율
  };
}

/**
 * TEC(기술) 스탯 효과 계산
 * - 스킬 데미지 보너스 = TEC * 0.5%
 * - 상태이상 부여 확률 보너스 = TEC * 0.3%
 */
export function getTechStats(tec: number): { skillDamageBonus: number; statusChanceBonus: number } {
  return {
    skillDamageBonus: tec * 0.5,    // 백분율
    statusChanceBonus: tec * 0.3    // 백분율
  };
}

/**
 * MNT(정신) 스탯 효과 계산
 * - 상태이상 저항 = MNT * 0.5%
 * - 상태이상 지속시간 감소 = MNT * 0.02턴 (소수점 버림)
 */
export function getMentalStats(mnt: number): { statusResist: number; durationReduce: number } {
  return {
    statusResist: mnt * 0.5,           // 백분율
    durationReduce: Math.floor(mnt * 0.02) // 턴
  };
}

// ========================================
// 전투 스탯 최종 계산
// ========================================

/**
 * 전투 시작 시 최종 스탯 계산
 * 1. 기본 스탯 + 레벨 보너스
 * 2. 컨디션 적용
 * 3. 폼 적용
 */
export function getBattleStats(
  baseStats: Stats,
  bonusStats: Stats,
  condition: number,
  form: FormState
): Stats {
  // 1. 기본 스탯 + 레벨 보너스
  let stats: Stats = {
    atk: baseStats.atk + bonusStats.atk,
    def: baseStats.def + bonusStats.def,
    spd: baseStats.spd + bonusStats.spd,
    ce: baseStats.ce + bonusStats.ce,
    hp: baseStats.hp + bonusStats.hp,
    crt: baseStats.crt + bonusStats.crt,
    tec: baseStats.tec + bonusStats.tec,
    mnt: baseStats.mnt + bonusStats.mnt
  };

  // 2. 컨디션 적용
  stats = applyConditionModifier(stats, condition);

  // 3. 폼 적용
  stats = applyFormModifier(stats, form);

  return stats;
}

// ========================================
// 초기화 헬퍼
// ========================================

/**
 * 새 PlayerCard의 성장 데이터 초기화
 */
export function initializeGrowthData(): {
  totalExp: number;
  bonusStats: Stats;
  condition: CharacterCondition;
  currentForm: FormState;
  recentResults: boolean[];
  currentWinStreak: number;
  maxWinStreak: number;
} {
  return {
    totalExp: 0,
    bonusStats: {
      atk: 0, def: 0, spd: 0, ce: 0, hp: 0,
      crt: 0, tec: 0, mnt: 0
    },
    condition: {
      value: 100,
      consecutiveBattles: 0,
      lastRestRound: 0
    },
    currentForm: 'STABLE',
    recentResults: [],
    currentWinStreak: 0,
    maxWinStreak: 0
  };
}

/**
 * 기존 캐릭터 스탯에 신규 스탯 추가 (마이그레이션)
 */
export function migrateToFullStats(
  legacyStats: { atk: number; def: number; spd: number; ce: number; hp: number },
  grade: Grade
): Stats {
  const newStats = GRADE_BASE_NEW_STATS[grade] || GRADE_BASE_NEW_STATS['3급'];

  return {
    ...legacyStats,
    crt: newStats.crt,
    tec: newStats.tec,
    mnt: newStats.mnt
  };
}

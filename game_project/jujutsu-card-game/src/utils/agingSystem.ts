// ========================================
// 노화/은퇴 시스템 (Phase 5)
// 생애주기, 쇠퇴, 은퇴 처리
// ========================================

import type {
  Stats,
  Attribute,
  LegacyGrade,
  CareerPhase,
  RetirementResult
} from '../types';
import { RETIREMENT_CP_REWARD } from '../types';
import {
  COOLDOWN_SPECIAL_GRADE,
  COOLDOWN_NORMAL_GRADE,
  SUCCESSOR_EXP_BONUS
} from '../data/constants';

// ========================================
// 생애주기 정보
// ========================================

export const CAREER_PHASES: Record<CareerPhase, { label: string; icon: string; color: string }> = {
  ROOKIE:               { label: '신입', icon: '🌱', color: '#4CAF50' },
  GROWTH:               { label: '성장기', icon: '📈', color: '#2196F3' },
  PEAK:                 { label: '전성기', icon: '⭐', color: '#FFD700' },
  DECLINE:              { label: '쇠퇴기', icon: '📉', color: '#FF9800' },
  RETIREMENT_ELIGIBLE:  { label: '은퇴 권유', icon: '🌅', color: '#9E9E9E' },
};

// 등급별 생애주기 타이밍 (seasonsInCrew 기준)
export const LIFECYCLE_TABLE: Record<LegacyGrade, {
  peakStart: number;
  declineStart: number;
  retirementStart: number;
}> = {
  '특급':  { peakStart: 2, declineStart: 5, retirementStart: 8 },
  '1급':   { peakStart: 3, declineStart: 6, retirementStart: 9 },
  '준1급': { peakStart: 3, declineStart: 7, retirementStart: 10 },
  '2급':   { peakStart: 3, declineStart: 7, retirementStart: 10 },
  '준2급': { peakStart: 4, declineStart: 8, retirementStart: 11 },
  '3급':   { peakStart: 4, declineStart: 8, retirementStart: 11 },
};

// ========================================
// 생애주기 판정 함수
// ========================================

/**
 * 생애주기 판정
 */
export function determineCareerPhase(grade: LegacyGrade, seasonsInCrew: number): CareerPhase {
  const lifecycle = LIFECYCLE_TABLE[grade];

  if (seasonsInCrew === 0) return 'ROOKIE';
  if (seasonsInCrew < lifecycle.peakStart) return 'GROWTH';
  if (seasonsInCrew < lifecycle.declineStart) return 'PEAK';
  if (seasonsInCrew < lifecycle.retirementStart) return 'DECLINE';
  return 'RETIREMENT_ELIGIBLE';
}

/**
 * 다음 생애주기까지 남은 시즌
 */
export function getSeasonsUntilNextPhase(
  grade: LegacyGrade,
  seasonsInCrew: number,
  currentPhase: CareerPhase
): number {
  const lifecycle = LIFECYCLE_TABLE[grade];

  switch (currentPhase) {
    case 'ROOKIE':
      return 1 - seasonsInCrew;
    case 'GROWTH':
      return lifecycle.peakStart - seasonsInCrew;
    case 'PEAK':
      return lifecycle.declineStart - seasonsInCrew;
    case 'DECLINE':
      return lifecycle.retirementStart - seasonsInCrew;
    case 'RETIREMENT_ELIGIBLE':
      return 0;
  }
}

/**
 * 생애주기 진행률 (%) - UI 표시용
 */
export function getCareerProgress(
  grade: LegacyGrade,
  seasonsInCrew: number
): { current: number; max: number; percent: number } {
  const lifecycle = LIFECYCLE_TABLE[grade];
  const maxSeasons = lifecycle.retirementStart;
  const percent = Math.min(100, Math.floor((seasonsInCrew / maxSeasons) * 100));

  return {
    current: seasonsInCrew,
    max: maxSeasons,
    percent
  };
}

// ========================================
// 쇠퇴 처리 함수
// ========================================

/**
 * 시즌 종료 시 쇠퇴 처리
 * 쇠퇴기/은퇴권유 상태에서 스탯 감소
 */
export function applyDecline(
  careerPhase: CareerPhase,
  _currentBonusStats: Partial<Stats>
): { decreases: Partial<Stats>; message: string } {
  const statKeys: (keyof Stats)[] = ['atk', 'def', 'spd', 'ce', 'hp', 'crt', 'tec', 'mnt'];
  const decreases: Partial<Stats> = {};

  if (careerPhase === 'DECLINE') {
    // 쇠퇴기: 랜덤 1~3 스탯을 1씩 감소
    const numStats = 1 + Math.floor(Math.random() * 3);  // 1~3개
    const shuffled = [...statKeys].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numStats; i++) {
      decreases[shuffled[i]] = -1;
    }

    return {
      decreases,
      message: `쇠퇴기로 인해 ${numStats}개 스탯이 감소했습니다.`
    };
  }

  if (careerPhase === 'RETIREMENT_ELIGIBLE') {
    // 은퇴 권유: 더 심한 하락 (3~5 스탯 감소)
    const numStats = 3 + Math.floor(Math.random() * 3);  // 3~5개
    const shuffled = [...statKeys].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(numStats, statKeys.length); i++) {
      decreases[shuffled[i]] = -1;
    }

    return {
      decreases,
      message: `은퇴 권유 상태로 인해 ${numStats}개 스탯이 크게 감소했습니다.`
    };
  }

  return { decreases: {}, message: '' };
}

/**
 * 쇠퇴 스탯 적용
 */
export function applyDecreaseToStats(
  currentStats: Partial<Stats>,
  decreases: Partial<Stats>
): Partial<Stats> {
  const newStats = { ...currentStats };

  for (const [key, value] of Object.entries(decreases)) {
    const statKey = key as keyof Stats;
    if (statKey in newStats && value !== undefined) {
      // 최소 0 보장
      newStats[statKey] = Math.max(0, (newStats[statKey] || 0) + value);
    }
  }

  return newStats;
}

// ========================================
// 은퇴 처리 함수
// ========================================

/**
 * 카드 은퇴 처리
 */
export function retireCard(
  cardId: string,
  grade: LegacyGrade,
  attribute: Attribute
): RetirementResult {
  // CP 보상 계산
  const cpReward = RETIREMENT_CP_REWARD[grade];

  // 복귀 쿨다운 계산
  const cooldownSeasons = grade === '특급'
    ? COOLDOWN_SPECIAL_GRADE
    : COOLDOWN_NORMAL_GRADE;

  // 후계자 효과 (같은 속성 카드에 경험치 보너스)
  const successorBuff = {
    attribute,
    expBonus: SUCCESSOR_EXP_BONUS  // +30%
  };

  return {
    cardId,
    cpReward,
    successorBuff,
    cooldownSeasons
  };
}

/**
 * 은퇴 가능 여부 체크
 */
export function canRetire(careerPhase: CareerPhase): boolean {
  // 쇠퇴기 이후부터 은퇴 가능
  return careerPhase === 'DECLINE' || careerPhase === 'RETIREMENT_ELIGIBLE';
}

/**
 * 강제 은퇴 필요 여부 체크
 * (은퇴 권유 상태에서 2시즌 경과 시)
 */
export function needsForceRetirement(
  careerPhase: CareerPhase,
  seasonsInRetirementEligible: number
): boolean {
  return careerPhase === 'RETIREMENT_ELIGIBLE' && seasonsInRetirementEligible >= 2;
}

// ========================================
// 후계자 효과 함수
// ========================================

export interface SuccessorBuff {
  attribute: Attribute;
  expBonus: number;
  sourceCardId: string;
  expiresAfterSeason: number;
}

/**
 * 후계자 효과 적용 체크
 */
export function shouldApplySuccessorBuff(
  cardAttribute: Attribute,
  activeBuffs: SuccessorBuff[]
): number {
  // 같은 속성의 활성 버프 찾기
  const matchingBuff = activeBuffs.find(buff => buff.attribute === cardAttribute);
  return matchingBuff ? matchingBuff.expBonus : 0;
}

/**
 * 후계자 효과 만료 처리
 */
export function expireSuccessorBuffs(
  buffs: SuccessorBuff[],
  currentSeason: number
): SuccessorBuff[] {
  return buffs.filter(buff => buff.expiresAfterSeason > currentSeason);
}

// ========================================
// 카드 리셋 함수 (은퇴 후 드래프트 풀 복귀)
// ========================================

/**
 * 카드 리셋 (은퇴 후 드래프트 풀로)
 * 레벨 1로 초기화, 경험치 초기화
 */
export function resetCardForDraftPool(cardId: string): {
  cardId: string;
  level: number;
  exp: number;
  totalExp: number;
  seasonsInCrew: number;
  careerPhase: CareerPhase;
  bonusStats: Partial<Stats>;
} {
  return {
    cardId,
    level: 1,
    exp: 0,
    totalExp: 0,
    seasonsInCrew: 0,
    careerPhase: 'ROOKIE',
    bonusStats: {},
  };
}

// ========================================
// 노화 관련 UI 헬퍼
// ========================================

/**
 * 생애주기 색상 가져오기
 */
export function getCareerPhaseColor(phase: CareerPhase): string {
  return CAREER_PHASES[phase].color;
}

/**
 * 생애주기 아이콘 가져오기
 */
export function getCareerPhaseIcon(phase: CareerPhase): string {
  return CAREER_PHASES[phase].icon;
}

/**
 * 생애주기 라벨 가져오기
 */
export function getCareerPhaseLabel(phase: CareerPhase): string {
  return CAREER_PHASES[phase].label;
}

/**
 * 은퇴 경고 메시지 생성
 */
export function getRetirementWarning(
  careerPhase: CareerPhase,
  grade: LegacyGrade,
  seasonsInCrew: number
): string | null {
  const lifecycle = LIFECYCLE_TABLE[grade];

  if (careerPhase === 'PEAK') {
    const seasonsUntilDecline = lifecycle.declineStart - seasonsInCrew;
    if (seasonsUntilDecline <= 2) {
      return `${seasonsUntilDecline}시즌 후 쇠퇴기 진입 예정`;
    }
  }

  if (careerPhase === 'DECLINE') {
    const seasonsUntilRetirement = lifecycle.retirementStart - seasonsInCrew;
    return `${seasonsUntilRetirement}시즌 후 은퇴 권유 상태 진입 예정`;
  }

  if (careerPhase === 'RETIREMENT_ELIGIBLE') {
    return '은퇴를 권장합니다. 스탯이 크게 감소합니다.';
  }

  return null;
}

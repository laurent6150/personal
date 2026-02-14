// ========================================
// 연봉 시스템 (Phase 5)
// 등급/레벨/생애주기 기반 연봉 계산
// ========================================

import type { LegacyGrade } from '../types';

// ========================================
// 생애주기 타입
// ========================================

export type CareerPhase = 'ROOKIE' | 'GROWTH' | 'PEAK' | 'DECLINE' | 'RETIREMENT_ELIGIBLE';

export const CAREER_PHASE_INFO: Record<CareerPhase, { label: string; icon: string; color: string }> = {
  ROOKIE:               { label: '신입', icon: '🌱', color: '#4CAF50' },
  GROWTH:               { label: '성장기', icon: '📈', color: '#2196F3' },
  PEAK:                 { label: '전성기', icon: '⭐', color: '#FFD700' },
  DECLINE:              { label: '쇠퇴기', icon: '📉', color: '#FF9800' },
  RETIREMENT_ELIGIBLE:  { label: '은퇴 권유', icon: '🌅', color: '#9E9E9E' },
};

// ========================================
// 연봉 기본 설정
// ========================================

// 등급별 기본 연봉
export const BASE_SALARY: Record<LegacyGrade, number> = {
  '특급': 5000,
  '1급': 3000,
  '준1급': 2000,
  '2급': 1200,
  '준2급': 800,
  '3급': 500,
};

// 등급별 레벨당 추가 연봉
export const SALARY_PER_LEVEL: Record<LegacyGrade, number> = {
  '특급': 300,
  '1급': 200,
  '준1급': 150,
  '2급': 100,
  '준2급': 80,
  '3급': 50,
};

// 샐러리 캡 (크루 총 연봉 한도)
export const SALARY_CAP = 15000;

// 소프트 캡 (경고 표시 기준)
export const SOFT_SALARY_CAP = 12000;

// 최소 크루 인원
export const MIN_CREW_SIZE = 5;

// 최대 크루 인원
export const MAX_CREW_SIZE = 8;

// 루키 스케일 할인율
export const ROOKIE_SCALE_DISCOUNT = 0.6;  // 정가의 60%

// 루키 스케일 지속 기간
export const ROOKIE_SCALE_DURATION = 3;    // 3시즌

// ========================================
// 생애주기 테이블
// ========================================

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
// 연봉 계산 함수
// ========================================

/**
 * 카드 연봉 계산
 */
export function calculateSalary(
  grade: LegacyGrade,
  level: number,
  careerPhase: CareerPhase,
  isRookieScale: boolean
): number {
  // 기본 연봉 + 레벨 보너스
  let salary = BASE_SALARY[grade] + SALARY_PER_LEVEL[grade] * (level - 1);

  // 전성기: 연봉 ×1.2
  if (careerPhase === 'PEAK') {
    salary = Math.floor(salary * 1.2);
  }
  // 쇠퇴기: 연봉 ×0.8
  if (careerPhase === 'DECLINE') {
    salary = Math.floor(salary * 0.8);
  }
  // 은퇴 권유: 연봉 ×0.6
  if (careerPhase === 'RETIREMENT_ELIGIBLE') {
    salary = Math.floor(salary * 0.6);
  }
  // 루키 스케일: 연봉 ×0.6
  if (isRookieScale) {
    salary = Math.floor(salary * ROOKIE_SCALE_DISCOUNT);
  }

  return salary;
}

/**
 * 크루 총 연봉 계산
 */
export function calculateCrewTotalSalary(salaries: number[]): number {
  return salaries.reduce((sum, salary) => sum + salary, 0);
}

/**
 * 샐러리 캡 체크
 */
export function checkSalaryCap(totalSalary: number): {
  withinCap: boolean;
  withinSoftCap: boolean;
  overAmount: number;
} {
  return {
    withinCap: totalSalary <= SALARY_CAP,
    withinSoftCap: totalSalary <= SOFT_SALARY_CAP,
    overAmount: Math.max(0, totalSalary - SALARY_CAP),
  };
}

// ========================================
// 생애주기 함수
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
      return 0; // 더 이상 다음 단계 없음
  }
}

// ========================================
// 루키 스케일 함수
// ========================================

/**
 * 드래프트 선발 카드에 루키 스케일 적용
 */
export function applyRookieScale(baseSalary: number): number {
  return Math.floor(baseSalary * ROOKIE_SCALE_DISCOUNT);
}

/**
 * 루키 스케일 만료 체크
 */
export function checkRookieScaleExpiry(
  draftedSeason: number | undefined,
  currentSeason: number
): boolean {
  if (!draftedSeason) return false;
  return (currentSeason - draftedSeason) >= ROOKIE_SCALE_DURATION;
}

/**
 * 루키 스케일 남은 시즌
 */
export function getRookieScaleRemainingSeason(
  draftedSeason: number | undefined,
  currentSeason: number
): number {
  if (!draftedSeason) return 0;
  const remaining = ROOKIE_SCALE_DURATION - (currentSeason - draftedSeason);
  return Math.max(0, remaining);
}

// ========================================
// 연봉 예측 함수
// ========================================

/**
 * 다음 시즌 예상 연봉
 */
export function predictNextSeasonSalary(
  grade: LegacyGrade,
  currentLevel: number,
  currentSeasonsInCrew: number,
  isRookieScale: boolean,
  draftedSeason: number | undefined,
  currentSeason: number
): number {
  // 다음 시즌의 생애주기
  const nextSeasonPhase = determineCareerPhase(grade, currentSeasonsInCrew + 1);

  // 루키 스케일 만료 여부
  const willExpireRookieScale = isRookieScale && checkRookieScaleExpiry(draftedSeason, currentSeason + 1);
  const nextRookieScale = isRookieScale && !willExpireRookieScale;

  return calculateSalary(grade, currentLevel, nextSeasonPhase, nextRookieScale);
}

// ========================================
// 연봉 정보 타입
// ========================================

export interface SalaryInfo {
  baseSalary: number;          // 기본 연봉 (등급 기반)
  levelBonus: number;          // 레벨 보너스
  phaseModifier: number;       // 생애주기 배율
  rookieDiscount: number;      // 루키 스케일 할인
  finalSalary: number;         // 최종 연봉
}

/**
 * 연봉 상세 정보 계산
 */
export function getSalaryBreakdown(
  grade: LegacyGrade,
  level: number,
  careerPhase: CareerPhase,
  isRookieScale: boolean
): SalaryInfo {
  const baseSalary = BASE_SALARY[grade];
  const levelBonus = SALARY_PER_LEVEL[grade] * (level - 1);

  let phaseModifier = 1.0;
  if (careerPhase === 'PEAK') phaseModifier = 1.2;
  if (careerPhase === 'DECLINE') phaseModifier = 0.8;
  if (careerPhase === 'RETIREMENT_ELIGIBLE') phaseModifier = 0.6;

  const beforeRookie = Math.floor((baseSalary + levelBonus) * phaseModifier);
  const rookieDiscount = isRookieScale ? Math.floor(beforeRookie * (1 - ROOKIE_SCALE_DISCOUNT)) : 0;
  const finalSalary = beforeRookie - rookieDiscount;

  return {
    baseSalary,
    levelBonus,
    phaseModifier,
    rookieDiscount,
    finalSalary,
  };
}

// ========================================
// 샐러리 캡 유효성 검사
// ========================================

/**
 * 크루 변경 후 샐러리 캡 검사
 */
export function validateCrewSalary(
  currentSalaries: number[],
  addingSalary?: number,
  removingSalary?: number
): {
  valid: boolean;
  newTotal: number;
  message?: string;
} {
  let newTotal = calculateCrewTotalSalary(currentSalaries);

  if (removingSalary) {
    newTotal -= removingSalary;
  }
  if (addingSalary) {
    newTotal += addingSalary;
  }

  const { withinCap, overAmount } = checkSalaryCap(newTotal);

  if (!withinCap) {
    return {
      valid: false,
      newTotal,
      message: `샐러리 캡 초과! ${overAmount.toLocaleString()} CP 초과`,
    };
  }

  return { valid: true, newTotal };
}

/**
 * 트레이드 시 샐러리 검증
 */
export function validateTradeSalary(
  currentCrewSalaries: number[],
  outgoingSalary: number,
  incomingSalary: number
): {
  valid: boolean;
  newTotal: number;
  salaryDiff: number;
  message?: string;
} {
  const currentTotal = calculateCrewTotalSalary(currentCrewSalaries);
  const newTotal = currentTotal - outgoingSalary + incomingSalary;
  const salaryDiff = incomingSalary - outgoingSalary;

  const { withinCap, overAmount } = checkSalaryCap(newTotal);

  if (!withinCap) {
    return {
      valid: false,
      newTotal,
      salaryDiff,
      message: `샐러리 캡 초과! ${overAmount.toLocaleString()} CP 초과`,
    };
  }

  return { valid: true, newTotal, salaryDiff };
}

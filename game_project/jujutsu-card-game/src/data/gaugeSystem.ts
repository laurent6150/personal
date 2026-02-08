// ========================================
// 필살기 게이지 충전 시스템
// ========================================

import type { LegacyGrade } from '../types';

// ========================================
// 등급별 게이지 충전 보너스
// - 고등급 캐릭터 = 강한 캐릭터 = 빠른 충전 (직관적)
// - ceCost로 밸런스 조정 (고ceCost = 느린 충전)
// ========================================

export const GRADE_GAUGE_BONUS: Record<LegacyGrade, number> = {
  '특급': 0.30,    // +30% (최강 = 가장 빠름)
  '1급': 0.20,     // +20%
  '준1급': 0.15,   // +15%
  '2급': 0.10,     // +10%
  '준2급': 0.05,   // +5%
  '3급': 0.00,     // +0%
};

// ========================================
// ceCost 기반 충전 속도 보너스
// - ceCost가 낮을수록 = 물리 특화 = 빠른 충전
// - ceCost가 높을수록 = CE 특화 = 느린 충전 (확정 발동)
// ========================================

export function getCeCostChargeBonus(ceCost: number): number {
  if (ceCost === 0) return 0.30;      // +30% (물리 캐릭터)
  if (ceCost <= 3) return 0.20;       // +20%
  if (ceCost <= 6) return 0.10;       // +10%
  return 0.00;                         // +0% (고CE 캐릭터)
}

// ========================================
// 게이지 충전량 상수
// ========================================

// 기본 충전률: 입힌 데미지의 80%
// (기존 25~35 랜덤 충전 → 데미지 30 기준 약 24 충전으로 비슷하게 맞춤)
export const BASE_CHARGE_RATE = 0.80;

// 받은 데미지 충전률: 받은 데미지의 50%
export const DAMAGE_TAKEN_CHARGE_RATE = 0.50;

// 최대 게이지
export const MAX_GAUGE = 100;

// 필살기 발동 요구 게이지
export const GAUGE_REQUIRED = 100;

// ========================================
// 주력 없는 캐릭터 (ceCost = 0) 발동 확률 시스템
// ========================================

// 기본 발동 확률
export const BASE_ACTIVATION_CHANCE = 70;

// crt 스탯 기반 추가 확률: (crt / 2)%
export const CRT_ACTIVATION_BONUS_RATE = 0.5;

// 최대 발동 확률
export const MAX_ACTIVATION_CHANCE = 90;

// 발동 실패 시 게이지 유지율
export const FAILED_ACTIVATION_RETAIN_RATE = 0.50;

// ========================================
// 게이지 충전량 계산 함수
// ========================================

export interface GaugeChargeParams {
  damage: number;           // 입힌 데미지
  grade: LegacyGrade;       // 캐릭터 등급
  ceCost: number;           // 필살기 ceCost (0이면 물리 특화)
}

/**
 * 데미지 기반 게이지 충전량 계산
 * 공식: damage × BASE_CHARGE_RATE × (1 + 등급보너스 + ceCost보너스)
 */
export function calculateGaugeCharge(params: GaugeChargeParams): number {
  const { damage, grade, ceCost } = params;

  // 기본 충전량
  const baseCharge = damage * BASE_CHARGE_RATE;

  // 등급 보너스
  const gradeBonus = GRADE_GAUGE_BONUS[grade] || 0;

  // ceCost 보너스 (물리 특화)
  const ceCostBonus = getCeCostChargeBonus(ceCost);

  // 총 배율
  const totalMultiplier = 1 + gradeBonus + ceCostBonus;

  // 최종 충전량 (소수점 버림)
  return Math.floor(baseCharge * totalMultiplier);
}

/**
 * 받은 데미지 기반 게이지 충전량 계산 (피격 시 충전)
 */
export function calculateDamageTakenGaugeCharge(
  damageTaken: number,
  grade: LegacyGrade
): number {
  const baseCharge = damageTaken * DAMAGE_TAKEN_CHARGE_RATE;
  const gradeBonus = GRADE_GAUGE_BONUS[grade] || 0;

  return Math.floor(baseCharge * (1 + gradeBonus));
}

// ========================================
// 발동 확률 계산 (ceCost = 0 캐릭터 전용)
// ========================================

export interface ActivationParams {
  ceCost: number;           // 필살기 ceCost
  currentCe: number;        // 현재 CE
  crtStat: number;          // 치명 스탯
  currentGauge: number;     // 현재 게이지
}

/**
 * 필살기 발동 가능 여부 및 확률 계산
 */
export function calculateActivationResult(params: ActivationParams): {
  canActivate: boolean;
  isGuaranteed: boolean;    // CE 기반 확정 발동
  activationChance: number; // 발동 확률 (%)
  success: boolean;         // 실제 발동 성공 여부
  newGauge: number;         // 발동 후 게이지 (실패 시 50% 유지)
} {
  const { ceCost, currentCe, crtStat, currentGauge } = params;

  // 게이지가 100 미만이면 발동 불가
  if (currentGauge < GAUGE_REQUIRED) {
    return {
      canActivate: false,
      isGuaranteed: false,
      activationChance: 0,
      success: false,
      newGauge: currentGauge,
    };
  }

  // ceCost > 0: CE 기반 확정 발동
  if (ceCost > 0) {
    const hasEnoughCe = currentCe >= ceCost;
    return {
      canActivate: hasEnoughCe,
      isGuaranteed: true,
      activationChance: hasEnoughCe ? 100 : 0,
      success: hasEnoughCe,
      newGauge: hasEnoughCe ? 0 : currentGauge, // 성공 시 0, CE 부족 시 유지
    };
  }

  // ceCost = 0: 물리 특화 - 확률 기반 발동
  // 발동 확률 = 기본 70% + (crt / 2)%
  const crtBonus = crtStat * CRT_ACTIVATION_BONUS_RATE;
  const activationChance = Math.min(
    BASE_ACTIVATION_CHANCE + crtBonus,
    MAX_ACTIVATION_CHANCE
  );

  // 확률 판정
  const roll = Math.random() * 100;
  const success = roll < activationChance;

  // 실패 시 게이지 50% 유지
  const newGauge = success ? 0 : Math.floor(currentGauge * FAILED_ACTIVATION_RETAIN_RATE);

  return {
    canActivate: true,
    isGuaranteed: false,
    activationChance,
    success,
    newGauge,
  };
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 물리 특화 캐릭터인지 확인 (ceCost = 0)
 */
export function isPhysicalCharacter(ceCost: number): boolean {
  return ceCost === 0;
}

/**
 * 게이지 추가 (최대치 제한)
 */
export function addGauge(currentGauge: number, amount: number): number {
  return Math.min(currentGauge + amount, MAX_GAUGE);
}

/**
 * 게이지 충전 예상치 계산 (UI 표시용)
 */
export function estimateGaugeCharge(
  expectedDamage: number,
  grade: LegacyGrade,
  ceCost: number
): {
  perHit: number;           // 한 번 공격당 충전량
  hitsToFull: number;       // 100까지 필요한 타격 수
  turnsToFull: number;      // 대략적인 턴 수 (피격 충전 포함 추정)
} {
  const perHit = calculateGaugeCharge({
    damage: expectedDamage,
    grade,
    ceCost,
  });

  const hitsToFull = perHit > 0 ? Math.ceil(MAX_GAUGE / perHit) : Infinity;

  // 대략 2턴에 1회 공격 + 피격 충전을 고려한 추정치
  const turnsToFull = Math.ceil(hitsToFull * 1.5);

  return { perHit, hitsToFull, turnsToFull };
}

// ========================================
// 타입 export
// ========================================

export interface GaugeState {
  current: number;
  max: number;
  chargeRate: number;       // 현재 적용된 충전률
  isPhysical: boolean;      // 물리 특화 여부
  activationChance: number; // 발동 확률 (물리) 또는 100 (CE)
}

/**
 * 캐릭터의 게이지 상태 초기화
 */
export function initializeGaugeState(
  grade: LegacyGrade,
  ceCost: number,
  crtStat: number
): GaugeState {
  const gradeBonus = GRADE_GAUGE_BONUS[grade] || 0;
  const ceCostBonus = getCeCostChargeBonus(ceCost);
  const chargeRate = BASE_CHARGE_RATE * (1 + gradeBonus + ceCostBonus);

  const isPhysical = isPhysicalCharacter(ceCost);

  let activationChance: number;
  if (isPhysical) {
    const crtBonus = crtStat * CRT_ACTIVATION_BONUS_RATE;
    activationChance = Math.min(BASE_ACTIVATION_CHANCE + crtBonus, MAX_ACTIVATION_CHANCE);
  } else {
    activationChance = 100;
  }

  return {
    current: 0,
    max: MAX_GAUGE,
    chargeRate,
    isPhysical,
    activationChance,
  };
}

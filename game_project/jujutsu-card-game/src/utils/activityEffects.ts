// ========================================
// 활동 효과 유틸리티 (Phase 5)
// 활동 시스템의 효과를 전투/성장에 적용
// ========================================

import type { Stats } from '../types';
import { useActivityStore } from '../stores/activityStore';

// ========================================
// 전투 전 스탯 적용
// ========================================

/**
 * 카드의 임시 스탯 보너스 가져오기 (훈련 효과)
 */
export function getActivityStatBonus(
  cardId: string,
  currentMatch: number
): Partial<Stats> {
  return useActivityStore.getState().getCardTempStatBonus(cardId, currentMatch);
}

/**
 * 기본 스탯에 활동 보너스 적용
 */
export function applyActivityStatBonus(
  baseStats: Stats,
  cardId: string,
  currentMatch: number
): Stats {
  const bonus = getActivityStatBonus(cardId, currentMatch);

  return {
    atk: baseStats.atk + (bonus.atk || 0),
    def: baseStats.def + (bonus.def || 0),
    spd: baseStats.spd + (bonus.spd || 0),
    ce: baseStats.ce + (bonus.ce || 0),
    hp: baseStats.hp + (bonus.hp || 0),
    crt: baseStats.crt + (bonus.crt || 0),
    tec: baseStats.tec + (bonus.tec || 0),
    mnt: baseStats.mnt + (bonus.mnt || 0),
  };
}

// ========================================
// 컨디션 보너스 적용
// ========================================

/**
 * 카드의 컨디션 보너스 가져오기 (휴식 효과)
 */
export function getActivityConditionBonus(
  cardId: string,
  currentMatch: number
): number {
  return useActivityStore.getState().getCardConditionBonus(cardId, currentMatch);
}

/**
 * 컨디션에 활동 보너스 적용
 */
export function applyActivityConditionBonus(
  currentCondition: number,
  cardId: string,
  currentMatch: number,
  maxCondition: number = 100
): number {
  const bonus = getActivityConditionBonus(cardId, currentMatch);
  return Math.min(currentCondition + bonus, maxCondition);
}

// ========================================
// 경험치 보너스 적용
// ========================================

/**
 * 카드의 경험치 보너스 가져오기 (연습경기 효과)
 */
export function getActivityExpBonus(
  cardId: string,
  currentMatch: number
): number {
  return useActivityStore.getState().getCardExpBonus(cardId, currentMatch);
}

/**
 * 전투 후 경험치 계산에 활동 보너스 적용
 */
export function calculateExpWithActivityBonus(
  baseExp: number,
  cardId: string,
  currentMatch: number
): number {
  const bonus = getActivityExpBonus(cardId, currentMatch);
  return baseExp + bonus;
}

// ========================================
// 활동 효과 정보 조회
// ========================================

export interface ActivityEffectSummary {
  cardId: string;
  hasTrainingBonus: boolean;
  trainingStat?: Partial<Stats>;
  hasConditionBonus: boolean;
  conditionBonus?: number;
  hasExpBonus: boolean;
  expBonus?: number;
}

/**
 * 카드의 활성 활동 효과 요약
 */
export function getActivityEffectSummary(
  cardId: string,
  currentMatch: number
): ActivityEffectSummary {
  const statBonus = getActivityStatBonus(cardId, currentMatch);
  const conditionBonus = getActivityConditionBonus(cardId, currentMatch);
  const expBonus = getActivityExpBonus(cardId, currentMatch);

  const hasStatBonus = Object.values(statBonus).some(v => v > 0);

  return {
    cardId,
    hasTrainingBonus: hasStatBonus,
    trainingStat: hasStatBonus ? statBonus : undefined,
    hasConditionBonus: conditionBonus > 0,
    conditionBonus: conditionBonus > 0 ? conditionBonus : undefined,
    hasExpBonus: expBonus > 0,
    expBonus: expBonus > 0 ? expBonus : undefined,
  };
}

// ========================================
// 활동 포인트 관리 헬퍼
// ========================================

/**
 * 현재 AP 상태 조회
 */
export function getAPStatus(): {
  current: number;
  max: number;
  percentage: number;
} {
  const { currentAP, maxAP } = useActivityStore.getState();
  return {
    current: currentAP,
    max: maxAP,
    percentage: Math.round((currentAP / maxAP) * 100),
  };
}

/**
 * 경기 완료 후 AP 및 효과 처리
 */
export function processPostMatchActivity(currentMatch: number): void {
  const store = useActivityStore.getState();

  // 경기 AP 지급
  store.grantMatchAP();

  // 만료된 효과 정리
  store.processMatchEnd(currentMatch);
}

/**
 * 전환기 진입 시 처리
 */
export function processHalfTransitionActivity(): void {
  const store = useActivityStore.getState();
  store.grantHalfTransitionAP();
}

/**
 * 시즌 종료 처리
 */
export function processSeasonEndActivity(): void {
  const store = useActivityStore.getState();
  store.processSeasonEnd();
}

// ========================================
// 스카우트 헬퍼
// ========================================

/**
 * 스카우트 정보 유효성 체크
 */
export function isScoutInfoValid(season: number): boolean {
  const scoutInfo = useActivityStore.getState().getScoutInfo();
  return scoutInfo !== null && scoutInfo.season === season;
}

/**
 * 상대 크루 정보가 스카우트되었는지 확인
 */
export function hasScoutedCrew(crewId: string, season: number): boolean {
  const scoutInfo = useActivityStore.getState().getScoutInfo();
  return (
    scoutInfo !== null &&
    scoutInfo.season === season &&
    scoutInfo.targetCrewId === crewId
  );
}

// ========================================
// 올킬/역올킬 시즌 시스템
// 특수 시즌 (3, 6, 9, 12...) 에서 연승 시스템 적용
// ========================================

import type { AllKillState } from '../types';
import { ALLKILL_SEASONS, ALLKILL_HP_DECAY, ALLKILL_CONDITION_DECAY } from '../types';

/**
 * 올킬 시즌 초기 상태
 */
export const INITIAL_ALLKILL_STATE: AllKillState = {
  isAllKillSeason: false,
  currentStreakCardId: null,
  currentStreak: 0,
  remainingHp: 100,
  remainingHpPercent: 100,
  activeStatusEffects: [],
  conditionPenalty: 0
};

/**
 * 올킬 시즌 여부 확인
 */
export function isAllKillSeason(seasonNumber: number): boolean {
  return ALLKILL_SEASONS.includes(seasonNumber);
}

/**
 * 올킬 상태 시작
 */
export function startAllKillState(seasonNumber: number): AllKillState {
  return {
    isAllKillSeason: isAllKillSeason(seasonNumber),
    currentStreakCardId: null,
    currentStreak: 0,
    remainingHp: 100,
    remainingHpPercent: 100,
    activeStatusEffects: [],
    conditionPenalty: 0
  };
}

/**
 * 연승 시 상태 업데이트
 * - HP 감소 (연승당 15%)
 * - 컨디션 감소 (연승당 10%)
 * - 상태이상 누적
 */
export function updateAllKillStateOnWin(
  state: AllKillState,
  winnerId: string,
  currentHp: number,
  statusEffects: string[]
): AllKillState {
  const isContinuing = state.currentStreakCardId === winnerId;
  const newStreak = isContinuing ? state.currentStreak + 1 : 1;

  // HP 감소 계산 (누적)
  const hpDecay = isContinuing ? ALLKILL_HP_DECAY * newStreak : 0;
  const newHpPercent = Math.max(0, currentHp - hpDecay);

  // 컨디션 패널티 계산
  const conditionDecay = isContinuing ? ALLKILL_CONDITION_DECAY * newStreak : 0;

  // 상태이상 누적 (중복 제거)
  const allEffects = isContinuing
    ? [...new Set([...state.activeStatusEffects, ...statusEffects])]
    : statusEffects;

  return {
    ...state,
    currentStreakCardId: winnerId,
    currentStreak: newStreak,
    remainingHp: newHpPercent,
    remainingHpPercent: newHpPercent,
    activeStatusEffects: allEffects,
    conditionPenalty: conditionDecay
  };
}

/**
 * 연승 종료 (패배 시)
 */
export function resetAllKillStreak(state: AllKillState): AllKillState {
  return {
    ...state,
    currentStreakCardId: null,
    currentStreak: 0,
    remainingHp: 100,
    remainingHpPercent: 100,
    activeStatusEffects: [],
    conditionPenalty: 0
  };
}

/**
 * 올킬 보너스 계산
 * 연승 수에 따른 추가 보상
 */
export function calculateAllKillBonus(streak: number): {
  expMultiplier: number;
  goldMultiplier: number;
  bonusTitle?: string;
} {
  if (streak >= 5) {
    return {
      expMultiplier: 3.0,
      goldMultiplier: 3.0,
      bonusTitle: '무쌍'
    };
  } else if (streak >= 4) {
    return {
      expMultiplier: 2.5,
      goldMultiplier: 2.5,
      bonusTitle: '올킬러'
    };
  } else if (streak >= 3) {
    return {
      expMultiplier: 2.0,
      goldMultiplier: 2.0
    };
  } else if (streak >= 2) {
    return {
      expMultiplier: 1.5,
      goldMultiplier: 1.5
    };
  }
  return {
    expMultiplier: 1.0,
    goldMultiplier: 1.0
  };
}

/**
 * 역올킬 여부 확인
 * 상대가 2연승 이상 중에 내가 이겼을 때
 */
export function checkReverseAllKill(
  opponentStreak: number,
  didPlayerWin: boolean
): boolean {
  return didPlayerWin && opponentStreak >= 2;
}

/**
 * 역올킬 보너스 계산
 */
export function calculateReverseAllKillBonus(
  opponentStreak: number
): {
  expBonus: number;
  goldBonus: number;
  title?: string;
} {
  const baseBonus = opponentStreak * 50;

  if (opponentStreak >= 4) {
    return {
      expBonus: baseBonus * 2,
      goldBonus: baseBonus * 2,
      title: '역전의 영웅'
    };
  } else if (opponentStreak >= 3) {
    return {
      expBonus: baseBonus * 1.5,
      goldBonus: baseBonus * 1.5,
      title: '역전왕'
    };
  }
  return {
    expBonus: baseBonus,
    goldBonus: baseBonus
  };
}

/**
 * 올킬/역올킬 연출 메시지
 */
export const ALLKILL_MESSAGES = {
  seasonStart: [
    '🔥 올킬 시즌이 시작됩니다!',
    '⚡ 이번 시즌은 올킬 시즌입니다!',
    '💀 연승의 시즌... 끝까지 버텨라!'
  ],
  streakStart: (name: string) => `${name}의 연승이 시작됩니다!`,
  streakContinue: (name: string, streak: number) =>
    `${name} ${streak}연승 중! HP와 컨디션이 감소합니다!`,
  allKill: (name: string, streak: number) =>
    `🎉 ${name} ${streak}연승 올킬 달성!`,
  reverseAllKill: (name: string, opponentStreak: number) =>
    `⚡ ${name}이(가) ${opponentStreak}연승을 끊었습니다! 역올킬!`,
  hpWarning: (hp: number) =>
    `⚠️ 연승 카드 HP ${hp}%! 위험합니다!`,
  conditionWarning: (penalty: number) =>
    `컨디션 -${penalty}% 상태로 다음 경기를 진행합니다.`
};

/**
 * 랜덤 메시지 선택
 */
export function getRandomAllKillMessage(type: 'seasonStart'): string {
  const messages = ALLKILL_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 올킬 상태 표시 텍스트
 */
export function getAllKillStatusText(state: AllKillState): string {
  if (!state.isAllKillSeason) return '';
  if (!state.currentStreakCardId) return '올킬 시즌 - 연승자 없음';

  return `올킬 시즌 - ${state.currentStreak}연승 중 (HP: ${state.remainingHpPercent}%)`;
}

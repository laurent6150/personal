// ========================================
// 트레이드 데드라인 시스템
// 시즌 70% 진행 후 트레이드 불가
// ========================================

import { TRADE_DEADLINE_THRESHOLD } from '../types';

/**
 * 트레이드 가능 여부 확인
 */
export function canTrade(
  currentMatch: number,
  totalMatches: number
): boolean {
  const progress = currentMatch / totalMatches;
  return progress < TRADE_DEADLINE_THRESHOLD;
}

/**
 * 시즌 진행률 계산
 */
export function getSeasonProgress(
  currentMatch: number,
  totalMatches: number
): number {
  return Math.floor((currentMatch / totalMatches) * 100);
}

/**
 * 데드라인까지 남은 경기 수
 */
export function getMatchesUntilDeadline(
  currentMatch: number,
  totalMatches: number
): number {
  const deadlineMatch = Math.floor(totalMatches * TRADE_DEADLINE_THRESHOLD);
  return Math.max(0, deadlineMatch - currentMatch);
}

/**
 * 데드라인 상태 정보
 */
export interface TradeDeadlineStatus {
  canTrade: boolean;
  progress: number;
  matchesUntilDeadline: number;
  isNearDeadline: boolean; // 10경기 이내
  deadlineMatch: number;
  currentMatch: number;
  totalMatches: number;
}

/**
 * 데드라인 상태 가져오기
 */
export function getTradeDeadlineStatus(
  currentMatch: number,
  totalMatches: number
): TradeDeadlineStatus {
  const progress = getSeasonProgress(currentMatch, totalMatches);
  const matchesUntilDeadline = getMatchesUntilDeadline(currentMatch, totalMatches);
  const deadlineMatch = Math.floor(totalMatches * TRADE_DEADLINE_THRESHOLD);

  return {
    canTrade: canTrade(currentMatch, totalMatches),
    progress,
    matchesUntilDeadline,
    isNearDeadline: matchesUntilDeadline > 0 && matchesUntilDeadline <= 10,
    deadlineMatch,
    currentMatch,
    totalMatches
  };
}

/**
 * 데드라인 알림 메시지
 */
export const TRADE_DEADLINE_MESSAGES = {
  nearDeadline: (matchesLeft: number) =>
    `⚠️ 트레이드 데드라인까지 ${matchesLeft}경기 남았습니다!`,
  atDeadline: '🔒 트레이드 데드라인! 더 이상 트레이드가 불가능합니다.',
  pastDeadline: '🔒 트레이드 데드라인이 지났습니다. 다음 시즌까지 트레이드가 불가능합니다.',
  canTrade: (matchesLeft: number) =>
    `트레이드 가능 (데드라인까지 ${matchesLeft}경기)`
};

/**
 * 현재 상태에 맞는 메시지 가져오기
 */
export function getDeadlineMessage(status: TradeDeadlineStatus): string {
  if (!status.canTrade) {
    return TRADE_DEADLINE_MESSAGES.pastDeadline;
  }
  if (status.matchesUntilDeadline === 0) {
    return TRADE_DEADLINE_MESSAGES.atDeadline;
  }
  if (status.isNearDeadline) {
    return TRADE_DEADLINE_MESSAGES.nearDeadline(status.matchesUntilDeadline);
  }
  return TRADE_DEADLINE_MESSAGES.canTrade(status.matchesUntilDeadline);
}

/**
 * 데드라인 진행 바 색상
 */
export function getDeadlineBarColor(status: TradeDeadlineStatus): string {
  if (!status.canTrade) {
    return 'bg-red-500'; // 데드라인 지남
  }
  if (status.isNearDeadline) {
    return 'bg-yellow-500'; // 임박
  }
  return 'bg-green-500'; // 여유 있음
}

/**
 * 시즌 시작 시 트레이드 관련 설정
 */
export function initializeTradeDeadline(totalMatches: number): {
  deadlineMatch: number;
  isActive: boolean;
} {
  return {
    deadlineMatch: Math.floor(totalMatches * TRADE_DEADLINE_THRESHOLD),
    isActive: true
  };
}

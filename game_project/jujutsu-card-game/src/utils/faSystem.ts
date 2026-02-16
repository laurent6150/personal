// ========================================
// FA (Free Agent) 시스템
// 3시즌 연속 같은 크루 소속 시 FA 자격 획득
// ========================================

import type { OwnedCard, CharacterCard } from '../types';
import { FA_QUALIFICATION_SEASONS } from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';

/**
 * FA 상태 정보 (유틸리티용)
 */
export interface FAStatusInfo {
  isFA: boolean;
  seasonsUntilFA: number;
  canDeclareFA: boolean;
  consecutiveSeasons: number;
}

/**
 * FA 자격 확인
 */
export function checkFAQualification(card: OwnedCard): boolean {
  const consecutiveSeasons = card.consecutiveSeasons || 0;
  return consecutiveSeasons >= FA_QUALIFICATION_SEASONS;
}

/**
 * 카드의 FA 상태 가져오기
 */
export function getFAStatus(card: OwnedCard): FAStatusInfo {
  const consecutive = card.consecutiveSeasons || 0;
  const qualified = consecutive >= FA_QUALIFICATION_SEASONS;
  const seasonsUntil = Math.max(0, FA_QUALIFICATION_SEASONS - consecutive);

  return {
    isFA: qualified && (card.faStatus === 'PENDING' || card.faStatus === 'FA'),
    seasonsUntilFA: seasonsUntil,
    canDeclareFA: qualified && card.faStatus !== 'RENEWED',
    consecutiveSeasons: consecutive
  };
}

/**
 * 크루의 FA 대상 카드 목록
 */
export function getFAEligibleCards(cards: OwnedCard[]): OwnedCard[] {
  return cards.filter(card => checkFAQualification(card));
}

/**
 * FA 선언 처리
 */
export function declareFA(card: OwnedCard): OwnedCard {
  if (!checkFAQualification(card)) {
    return card;
  }

  return {
    ...card,
    faStatus: 'FA'
  };
}

/**
 * 재계약 처리
 */
export function renewContract(card: OwnedCard): OwnedCard {
  return {
    ...card,
    faStatus: 'RENEWED',
    // 재계약 시 커리어 진행 유지 (0으로 리셋하면 ROOKIE로 퇴행)
    consecutiveSeasons: card.consecutiveSeasons ?? 0
  };
}

/**
 * FA 카드 이적 처리
 */
export function transferFACard(card: OwnedCard, newCrewId: string): OwnedCard {
  return {
    ...card,
    crewId: newCrewId,
    faStatus: undefined,
    consecutiveSeasons: 1 // 새 크루에서 첫 시즌
  };
}

/**
 * 시즌 종료 시 FA 상태 업데이트
 */
export function updateFAStatusesForSeasonEnd(cards: OwnedCard[]): OwnedCard[] {
  return cards.map(card => {
    // 재계약 상태 초기화
    if (card.faStatus === 'RENEWED') {
      return {
        ...card,
        faStatus: undefined
      };
    }

    // FA 상태였는데 이적 안 한 경우 유지
    if (card.faStatus === 'FA') {
      return card;
    }

    // 연속 시즌 증가
    const newConsecutive = (card.consecutiveSeasons || 0) + 1;

    // FA 자격 달성 시 PENDING 상태로
    if (newConsecutive >= FA_QUALIFICATION_SEASONS) {
      return {
        ...card,
        consecutiveSeasons: newConsecutive,
        faStatus: 'PENDING'
      };
    }

    return {
      ...card,
      consecutiveSeasons: newConsecutive
    };
  });
}

/**
 * FA 시장 정보 타입
 */
export interface FAMarketInfo {
  availableFAs: FACardInfo[];
  myFACandidates: FACardInfo[];
  pendingFAs: FACardInfo[];
}

export interface FACardInfo {
  card: OwnedCard;
  characterData: CharacterCard | undefined;
  faStatus: FAStatusInfo;
  estimatedValue: number;
}

/**
 * FA 카드 정보 생성
 */
export function getFACardInfo(card: OwnedCard): FACardInfo {
  const charData = CHARACTERS_BY_ID[card.cardId];
  const faStatus = getFAStatus(card);
  const estimatedValue = calculateFAValue(card, charData);

  return {
    card,
    characterData: charData,
    faStatus,
    estimatedValue
  };
}

/**
 * FA 카드 가치 계산
 */
export function calculateFAValue(
  card: OwnedCard,
  charData: CharacterCard | undefined
): number {
  if (!charData) return 0;

  // 기본 스탯 점수
  const stats = charData.baseStats;
  const statsScore = stats.atk + stats.def + stats.spd + stats.ce + stats.hp;

  // 등급 배율
  const gradeMultiplier: Record<string, number> = {
    '특급': 4,
    '준특급': 3.5,
    '1급': 3,
    '준1급': 2.5,
    '2급': 2,
    '준2급': 1.5,
    '3급': 1
  };
  const multiplier = gradeMultiplier[charData.grade] || 1;

  // 레벨 보너스
  const levelBonus = (card.level || 1) * 10;

  // 경험치 보너스
  const expBonus = (card.exp || 0) / 50;

  return Math.floor((statsScore * multiplier + levelBonus + expBonus) * 100);
}

/**
 * FA 관련 메시지
 */
export const FA_MESSAGES = {
  qualificationReached: (name: string) =>
    `${name}이(가) FA 자격을 획득했습니다!`,
  faDeclared: (name: string) =>
    `${name}이(가) FA를 선언했습니다!`,
  renewed: (name: string) =>
    `${name}과(와) 재계약을 완료했습니다.`,
  transferred: (name: string, crew: string) =>
    `${name}이(가) ${crew}(으)로 이적했습니다.`,
  seasonsRemaining: (name: string, seasons: number) =>
    `${name}: FA까지 ${seasons}시즌 남음`,
  faAvailable: (count: number) =>
    `FA 시장에 ${count}명의 선수가 있습니다.`
};

/**
 * FA 자격까지 진행률
 */
export function getFAProgress(card: OwnedCard): number {
  const consecutive = card.consecutiveSeasons || 0;
  return Math.min(100, (consecutive / FA_QUALIFICATION_SEASONS) * 100);
}

/**
 * FA 관련 알림 생성
 */
export interface FANotification {
  type: 'QUALIFICATION' | 'PENDING' | 'MARKET_OPEN' | 'DEADLINE';
  message: string;
  cardId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function generateFANotifications(
  cards: OwnedCard[],
  isSeasonEnd: boolean
): FANotification[] {
  const notifications: FANotification[] = [];

  for (const card of cards) {
    const charData = CHARACTERS_BY_ID[card.cardId];
    const name = charData?.name.ko || '???';
    const faStatus = getFAStatus(card);

    // FA 자격 달성 예정 (1시즌 남음)
    if (faStatus.seasonsUntilFA === 1) {
      notifications.push({
        type: 'PENDING',
        message: FA_MESSAGES.seasonsRemaining(name, 1),
        cardId: card.cardId,
        priority: 'MEDIUM'
      });
    }

    // FA 자격 달성
    if (isSeasonEnd && faStatus.seasonsUntilFA === 0 && !card.faStatus) {
      notifications.push({
        type: 'QUALIFICATION',
        message: FA_MESSAGES.qualificationReached(name),
        cardId: card.cardId,
        priority: 'HIGH'
      });
    }
  }

  return notifications;
}

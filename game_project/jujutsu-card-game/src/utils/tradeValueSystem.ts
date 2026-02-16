// ========================================
// 트레이드 가치 시스템 (Phase 5)
// Trade Value 계산 및 패키지 검증
// ========================================

import { CHARACTERS_BY_ID } from '../data/characters';
import { ITEMS_BY_ID } from '../data/items';
import type {
  LegacyGrade,
  CareerPhase,
  TradePackage,
  DraftPickReference
} from '../types';
import { BASE_SALARY } from './salarySystem';
import { SALARY_CAP } from '../data/constants';

// ========================================
// Trade Value 기본 설정
// ========================================

// TV 검증 허용 오차 (±20%)
export const TV_TOLERANCE = 0.2;

// 등급별 기본 TV
export const BASE_TV: Record<LegacyGrade, number> = {
  '특급': 5000,
  '준특급': 4000,
  '1급': 3000,
  '준1급': 2000,
  '2급': 1200,
  '준2급': 800,
  '3급': 500,
};

// 생애주기 TV 배율
export const PHASE_TV_MODIFIER: Record<CareerPhase, number> = {
  ROOKIE: 1.1,          // 신입: 잠재력 프리미엄
  GROWTH: 1.2,          // 성장기: 최고 가치
  PEAK: 1.0,            // 전성기: 기준
  DECLINE: 0.6,         // 쇠퇴기: 하락
  RETIREMENT_ELIGIBLE: 0.3, // 은퇴 권유: 최저
};

// 레벨 TV 배율 (Lv1 = 0.8, Lv5 = 1.0, Lv10 = 1.3)
export function getLevelModifier(level: number): number {
  return 0.8 + (level - 1) * (0.5 / 9);
}

// 드래프트 픽 기본 TV
export const BASE_PICK_TV = 1200;

// 미래 픽 프리미엄
export const FUTURE_PICK_PREMIUM = 1.3;

// ========================================
// 카드 TV 계산
// ========================================

export interface CardTVInfo {
  cardId: string;
  baseSalary: number;
  levelModifier: number;
  phaseModifier: number;
  totalTV: number;
  breakdown: {
    base: number;
    levelBonus: number;
    phaseBonus: number;
  };
}

/**
 * 단일 카드의 Trade Value 계산
 */
export function calculateCardTV(
  cardId: string,
  level: number,
  careerPhase: CareerPhase
): CardTVInfo {
  const character = CHARACTERS_BY_ID[cardId];

  if (!character) {
    return {
      cardId,
      baseSalary: 0,
      levelModifier: 1,
      phaseModifier: 1,
      totalTV: 0,
      breakdown: { base: 0, levelBonus: 0, phaseBonus: 0 },
    };
  }

  const grade = character.grade as LegacyGrade;
  const baseSalary = BASE_SALARY[grade];
  const levelModifier = getLevelModifier(level);
  const phaseModifier = PHASE_TV_MODIFIER[careerPhase] ?? 1.0;

  const baseTV = BASE_TV[grade];
  const levelBonus = Math.floor(baseTV * (levelModifier - 1));
  const phaseBonus = Math.floor((baseTV + levelBonus) * (phaseModifier - 1));

  const totalTV = Math.floor(baseTV * levelModifier * phaseModifier);

  return {
    cardId,
    baseSalary,
    levelModifier,
    phaseModifier,
    totalTV,
    breakdown: {
      base: baseTV,
      levelBonus,
      phaseBonus,
    },
  };
}

/**
 * 간단한 TV 계산 (PlayerCard 정보 사용)
 */
export function getCardTV(
  cardId: string,
  level: number,
  careerPhase: CareerPhase
): number {
  return calculateCardTV(cardId, level, careerPhase).totalTV;
}

// ========================================
// 드래프트 픽 TV 계산
// ========================================

/**
 * 드래프트 픽 TV 계산
 */
export function calculatePickTV(
  pick: DraftPickReference,
  currentSeason: number
): number {
  const isFuturePick = pick.season > currentSeason;
  const multiplier = isFuturePick ? FUTURE_PICK_PREMIUM : 1.0;
  return Math.floor(BASE_PICK_TV * multiplier);
}

// ========================================
// 아이템 TV 계산
// ========================================

// 아이템 TV = 구매가의 70%
export const ITEM_TV_RATIO = 0.7;

/**
 * 아이템 TV 계산
 */
export function calculateItemTV(itemId: string): number {
  const item = ITEMS_BY_ID[itemId];
  if (!item) return 0;
  return Math.floor(item.price * ITEM_TV_RATIO);
}

// ========================================
// 패키지 TV 계산
// ========================================

export interface PackageTVInfo {
  totalTV: number;
  cardTV: number;
  cpTV: number;
  itemTV: number;
  pickTV: number;
  breakdown: {
    cards: Array<{ cardId: string; tv: number }>;
    items: Array<{ itemId: string; tv: number }>;
    picks: Array<{ season: number; tv: number }>;
  };
}

/**
 * 트레이드 패키지 총 TV 계산
 */
export function calculatePackageTV(
  pkg: TradePackage,
  getCardInfo: (cardId: string) => { level: number; careerPhase: CareerPhase } | null,
  currentSeason: number
): PackageTVInfo {
  let cardTV = 0;
  let itemTV = 0;
  let pickTV = 0;

  const cardBreakdown: Array<{ cardId: string; tv: number }> = [];
  const itemBreakdown: Array<{ itemId: string; tv: number }> = [];
  const pickBreakdown: Array<{ season: number; tv: number }> = [];

  // 카드 TV
  for (const cardId of pkg.cards) {
    const info = getCardInfo(cardId);
    if (info) {
      const tv = getCardTV(cardId, info.level, info.careerPhase);
      cardTV += tv;
      cardBreakdown.push({ cardId, tv });
    }
  }

  // CP: 1 CP = 1 TV
  const cpTV = pkg.cp;

  // 아이템 TV
  for (const itemId of pkg.items) {
    const tv = calculateItemTV(itemId);
    itemTV += tv;
    itemBreakdown.push({ itemId, tv });
  }

  // 드래프트 픽 TV
  for (const pick of pkg.draftPicks) {
    const tv = calculatePickTV(pick, currentSeason);
    pickTV += tv;
    pickBreakdown.push({ season: pick.season, tv });
  }

  const totalTV = cardTV + cpTV + itemTV + pickTV;

  return {
    totalTV,
    cardTV,
    cpTV,
    itemTV,
    pickTV,
    breakdown: {
      cards: cardBreakdown,
      items: itemBreakdown,
      picks: pickBreakdown,
    },
  };
}

// ========================================
// 트레이드 검증
// ========================================

export interface TradeValidationResult {
  valid: boolean;
  reason?: string;
  proposerTV: number;
  targetTV: number;
  tvDiff: number;
  maxAllowed: number;
}

/**
 * 트레이드 유효성 검증 (TV 기반)
 */
export function validateTrade(
  proposerPkg: TradePackage,
  targetPkg: TradePackage,
  getCardInfo: (cardId: string) => { level: number; careerPhase: CareerPhase } | null,
  currentSeason: number
): TradeValidationResult {
  const proposerTVInfo = calculatePackageTV(proposerPkg, getCardInfo, currentSeason);
  const targetTVInfo = calculatePackageTV(targetPkg, getCardInfo, currentSeason);

  const proposerTV = proposerTVInfo.totalTV;
  const targetTV = targetTVInfo.totalTV;

  // ±20% 이내 체크
  const diff = Math.abs(proposerTV - targetTV);
  const maxAllowed = Math.floor(Math.max(proposerTV, targetTV) * TV_TOLERANCE);

  if (diff > maxAllowed) {
    return {
      valid: false,
      reason: `TV 차이 ${diff.toLocaleString()}가 허용 범위 ${maxAllowed.toLocaleString()}를 초과`,
      proposerTV,
      targetTV,
      tvDiff: proposerTV - targetTV,
      maxAllowed,
    };
  }

  return {
    valid: true,
    proposerTV,
    targetTV,
    tvDiff: proposerTV - targetTV,
    maxAllowed,
  };
}

// ========================================
// 샐러리 검증
// ========================================

export interface SalaryValidationResult {
  valid: boolean;
  reason?: string;
  currentTotal: number;
  afterTradeTotal: number;
  capRemaining: number;
}

/**
 * 트레이드 후 샐러리캡 검증
 */
export function validateTradeSalary(
  currentCrewSalaries: number[],
  outgoingSalaries: number[],
  incomingSalaries: number[]
): SalaryValidationResult {
  const currentTotal = currentCrewSalaries.reduce((a, b) => a + b, 0);
  const outgoingTotal = outgoingSalaries.reduce((a, b) => a + b, 0);
  const incomingTotal = incomingSalaries.reduce((a, b) => a + b, 0);

  const afterTradeTotal = currentTotal - outgoingTotal + incomingTotal;
  const capRemaining = SALARY_CAP - afterTradeTotal;

  if (afterTradeTotal > SALARY_CAP) {
    return {
      valid: false,
      reason: `샐러리캡 초과! ${(afterTradeTotal - SALARY_CAP).toLocaleString()} CP 초과`,
      currentTotal,
      afterTradeTotal,
      capRemaining,
    };
  }

  return {
    valid: true,
    currentTotal,
    afterTradeTotal,
    capRemaining,
  };
}

// ========================================
// AI 트레이드 평가
// ========================================

export interface AITradeEvaluation {
  shouldAccept: boolean;
  reason: string;
  tvAdvantage: number;  // 양수면 AI에게 유리
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * AI의 트레이드 평가
 */
export function evaluateTradeForAI(
  proposerPkg: TradePackage,  // AI가 받는 것
  targetPkg: TradePackage,     // AI가 주는 것
  getCardInfo: (cardId: string) => { level: number; careerPhase: CareerPhase; grade: LegacyGrade } | null,
  currentSeason: number
): AITradeEvaluation {
  const getBasicCardInfo = (cardId: string) => {
    const info = getCardInfo(cardId);
    return info ? { level: info.level, careerPhase: info.careerPhase } : null;
  };

  const proposerTV = calculatePackageTV(proposerPkg, getBasicCardInfo, currentSeason).totalTV;
  const targetTV = calculatePackageTV(targetPkg, getBasicCardInfo, currentSeason).totalTV;

  const tvAdvantage = proposerTV - targetTV;

  // TV 차이가 심하면 거절
  if (tvAdvantage < -500) {
    return {
      shouldAccept: false,
      reason: '불리한 거래',
      tvAdvantage,
      riskLevel: 'HIGH',
    };
  }

  // 특급 카드를 내주는 것은 거절 확률 높음
  for (const cardId of targetPkg.cards) {
    const info = getCardInfo(cardId);
    if (info?.grade === '특급') {
      if (Math.random() < 0.8) {
        return {
          shouldAccept: false,
          reason: '특급 카드 방출 거부',
          tvAdvantage,
          riskLevel: 'HIGH',
        };
      }
    }
    if (info?.grade === '1급') {
      if (Math.random() < 0.5) {
        return {
          shouldAccept: false,
          reason: '1급 카드 방출 거부',
          tvAdvantage,
          riskLevel: 'MEDIUM',
        };
      }
    }
  }

  // TV가 유리하면 수락
  if (tvAdvantage > 0) {
    return {
      shouldAccept: true,
      reason: '유리한 거래',
      tvAdvantage,
      riskLevel: 'LOW',
    };
  }

  // 동등하면 50% 확률로 수락
  if (Math.abs(tvAdvantage) <= 100) {
    const accept = Math.random() < 0.5;
    return {
      shouldAccept: accept,
      reason: accept ? '공정한 거래' : '관심 없음',
      tvAdvantage,
      riskLevel: 'LOW',
    };
  }

  // 약간 불리하면 30% 확률로 수락
  const accept = Math.random() < 0.3;
  return {
    shouldAccept: accept,
    reason: accept ? '수락' : '거절',
    tvAdvantage,
    riskLevel: 'MEDIUM',
  };
}

// ========================================
// 트레이드 제안 생성 (AI용)
// ========================================

/**
 * AI가 원하는 카드와 제안할 카드 찾기
 */
export function findPotentialTrade(
  aiCrewCards: string[],
  targetCrewCards: string[],
  getCardInfo: (cardId: string) => { level: number; careerPhase: CareerPhase; grade: LegacyGrade } | null,
  _currentSeason: number
): { offerCardId: string; requestCardId: string } | null {
  // AI가 보유한 카드 중 가치가 낮은 것 찾기
  const aiCardValues = aiCrewCards.map(cardId => {
    const info = getCardInfo(cardId);
    if (!info) return { cardId, tv: 0 };
    return { cardId, tv: getCardTV(cardId, info.level, info.careerPhase) };
  }).sort((a, b) => a.tv - b.tv);

  // 상대 크루에서 가치가 비슷한 카드 찾기
  const targetCardValues = targetCrewCards.map(cardId => {
    const info = getCardInfo(cardId);
    if (!info) return { cardId, tv: 0 };
    return { cardId, tv: getCardTV(cardId, info.level, info.careerPhase) };
  }).sort((a, b) => a.tv - b.tv);

  // TV가 비슷한 쌍 찾기
  for (const offer of aiCardValues) {
    for (const request of targetCardValues) {
      const diff = Math.abs(offer.tv - request.tv);
      const tolerance = Math.max(offer.tv, request.tv) * TV_TOLERANCE;

      if (diff <= tolerance && request.tv > offer.tv) {
        // AI에게 유리한 거래 발견
        return {
          offerCardId: offer.cardId,
          requestCardId: request.cardId,
        };
      }
    }
  }

  return null;
}

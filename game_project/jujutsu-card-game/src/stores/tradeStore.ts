// ========================================
// 트레이드 스토어
// Phase 5: CP 기반 트레이드 시스템
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHARACTERS_BY_ID } from '../data/characters';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { useNewsFeedStore } from './newsFeedStore';
import {
  calculateCardValue,
  determineCareerPhase,
  validateTradeValue
} from '../utils/salarySystem';
import { TRADE_DEADLINE_GAME } from '../data/constants';
import type {
  TradeOffer,
  TradeEvaluation,
  TradeRejectReason,
  ChampionshipBonus,
  LegacyGrade,
  AICrew,
  TradePackage,
  TradeOfferPhase5
} from '../types';
import { GRADE_POINTS } from '../types';

// 기본 등급 제한
const BASE_GRADE_LIMITS: Record<LegacyGrade, number> = {
  '특급': 1,
  '1급': 2,
  '준1급': 5,
  '2급': 5,
  '준2급': 5,
  '3급': 5
};

// ========================================
// CP 기반 트레이드 유틸리티 함수
// ========================================

/**
 * 카드의 CP 가치 계산
 * 카드 데이터에서 등급, 레벨, 생애주기를 기반으로 계산
 * 참고: CharacterCard는 level이 없으므로 기본값 1 사용
 *       실제 레벨은 PlayerCard에 저장되어 있음
 */
function getCardCPValue(cardId: string, seasonsInCrew: number = 0, level: number = 1): number {
  const card = CHARACTERS_BY_ID[cardId];
  if (!card) return 0;

  const careerPhase = determineCareerPhase(card.grade as LegacyGrade, seasonsInCrew);
  return calculateCardValue(card.grade as LegacyGrade, level, careerPhase);
}

/**
 * 트레이드 패키지의 총 CP 가치 계산
 */
function calculatePackageValue(pkg: TradePackage, cardSeasonsMap?: Record<string, number>): number {
  let total = pkg.cp || 0;

  // 카드 가치 합산
  for (const cardId of pkg.cards) {
    const seasons = cardSeasonsMap?.[cardId] || 0;
    total += getCardCPValue(cardId, seasons);
  }

  // TODO: 아이템 가치, 드래프트 픽 가치 추가 가능

  return total;
}

/**
 * 트레이드 마감 여부 확인
 */
function isTradeDeadlinePassed(currentGame: number): boolean {
  return currentGame > TRADE_DEADLINE_GAME;
}

interface TradeStore {
  tradeHistory: TradeOffer[];
  pendingOffers: TradeOffer[];
  championships: ChampionshipBonus[];

  // 트레이드 제안 (플레이어 → AI)
  proposeTrade: (params: {
    seasonNumber: number;
    targetCrewId: string;
    offeredCardId: string;
    requestedCardId: string;
    playerCrew: string[];
    targetCrew: AICrew;
  }) => TradeEvaluation;

  // 강제 트레이드 (플레이어만 가능)
  forceTrade: (params: {
    seasonNumber: number;
    targetCrewId: string;
    offeredCardId: string;
    requestedCardId: string;
  }) => TradeOffer;

  // AI끼리 자동 트레이드
  autoAITrades: (seasonNumber: number, aiCrews: AICrew[]) => TradeOffer[];

  // 트레이드 실행 (크루 배열 반환)
  executeTrade: (tradeId: string, playerCrew: string[], aiCrews: AICrew[]) => {
    success: boolean;
    updatedPlayerCrew?: string[];
    updatedAICrews?: AICrew[];
    error?: string;
  };

  // 등급 제한 계산 (우승 보너스 포함)
  getGradeLimits: () => Record<LegacyGrade, number>;

  // 우승 보너스 추가
  addChampionshipBonus: (seasonNumber: number) => void;

  // 카드의 포인트 계산
  getCardPoint: (cardId: string) => number;

  // 트레이드 히스토리 가져오기
  getTradeHistory: (seasonNumber?: number) => TradeOffer[];

  // 대기 중인 트레이드 가져오기
  getPendingOffers: () => TradeOffer[];

  // ========================================
  // Phase 5: CP 기반 트레이드 메서드
  // ========================================

  // 카드의 CP 가치 계산
  getCardCPValue: (cardId: string, seasonsInCrew?: number) => number;

  // 트레이드 패키지 가치 계산
  calculatePackageValue: (pkg: TradePackage, cardSeasonsMap?: Record<string, number>) => number;

  // 트레이드 마감 확인
  isTradeDeadlinePassed: (currentGame: number) => boolean;

  // CP 기반 트레이드 제안 (Phase 5)
  proposeTradePhase5: (params: {
    seasonNumber: number;
    currentGame: number;
    targetCrewId: string;
    proposerPackage: TradePackage;
    targetPackage: TradePackage;
    playerCrew: string[];
    targetCrew: AICrew;
    cardSeasonsMap?: Record<string, number>;
  }) => {
    success: boolean;
    evaluation?: TradeEvaluation;
    trade?: TradeOfferPhase5;
    error?: string;
  };

  // 트레이드 가치 밸런스 확인
  validateTradeBalance: (
    proposerPackage: TradePackage,
    targetPackage: TradePackage,
    cardSeasonsMap?: Record<string, number>
  ) => {
    valid: boolean;
    proposerValue: number;
    targetValue: number;
    difference: number;
    differencePercent: number;
    message?: string;
  };

  // 스토어 초기화
  reset: () => void;
}

// AI가 트레이드를 평가하는 로직
function evaluateTradeForAI(
  offeredCardId: string,
  requestedCardId: string,
  targetCrew: string[],
  targetGradeLimits: Record<LegacyGrade, number>
): TradeEvaluation {
  const offeredCard = CHARACTERS_BY_ID[offeredCardId];
  const requestedCard = CHARACTERS_BY_ID[requestedCardId];

  if (!offeredCard || !requestedCard) {
    return { shouldAccept: false, reason: 'NOT_INTERESTED', pointDifference: 0 };
  }

  const offeredPoints = GRADE_POINTS[offeredCard.grade];
  const requestedPoints = GRADE_POINTS[requestedCard.grade];
  const pointDiff = offeredPoints - requestedPoints;

  // 포인트 차이가 ±1 초과면 거절
  if (Math.abs(pointDiff) > 1) {
    return {
      shouldAccept: false,
      reason: 'POINT_DIFF_TOO_HIGH',
      pointDifference: pointDiff
    };
  }

  // 받을 카드로 등급 제한 확인
  const targetCrewCards = targetCrew.filter(id => id !== requestedCardId);
  const newCrewCards = [...targetCrewCards, offeredCardId];

  // 등급별 카운트
  const gradeCounts: Record<LegacyGrade, number> = {
    '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0
  };

  for (const cardId of newCrewCards) {
    const card = CHARACTERS_BY_ID[cardId];
    if (card) gradeCounts[card.grade as LegacyGrade]++;
  }

  // 등급 제한 확인
  for (const grade of Object.keys(gradeCounts) as LegacyGrade[]) {
    if (gradeCounts[grade] > targetGradeLimits[grade]) {
      return {
        shouldAccept: false,
        reason: 'GRADE_LIMIT',
        pointDifference: pointDiff
      };
    }
  }

  // 특급이나 1급 카드를 내주는 것은 거절 확률 높음
  if (requestedCard.grade === '특급') {
    // 특급은 80% 확률로 거절
    if (Math.random() < 0.8) {
      return {
        shouldAccept: false,
        reason: 'NEED_THIS_CARD',
        pointDifference: pointDiff
      };
    }
  } else if (requestedCard.grade === '1급') {
    // 1급은 50% 확률로 거절
    if (Math.random() < 0.5) {
      return {
        shouldAccept: false,
        reason: 'NEED_THIS_CARD',
        pointDifference: pointDiff
      };
    }
  }

  // 받는 포인트가 더 높으면 좋은 거래
  if (pointDiff > 0) {
    return { shouldAccept: true, reason: 'GOOD_DEAL', pointDifference: pointDiff };
  }

  // 동등하면 공정한 거래
  return { shouldAccept: true, reason: 'FAIR_TRADE', pointDifference: pointDiff };
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      tradeHistory: [],
      pendingOffers: [],
      championships: [],

      proposeTrade: (params) => {
        const {
          seasonNumber,
          targetCrewId,
          offeredCardId,
          requestedCardId,
          targetCrew
        } = params;

        const gradeLimits = get().getGradeLimits();

        // AI 평가
        const evaluation = evaluateTradeForAI(
          offeredCardId,
          requestedCardId,
          targetCrew.crew,
          gradeLimits
        );

        // 트레이드 기록 생성
        const tradeOffer: TradeOffer = {
          id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          seasonNumber,
          timestamp: Date.now(),
          proposerCrewId: PLAYER_CREW_ID,
          targetCrewId,
          offeredCardId,
          requestedCardId,
          status: evaluation.shouldAccept ? 'ACCEPTED' : 'REJECTED',
          rejectReason: evaluation.shouldAccept ? undefined : evaluation.reason as TradeRejectReason
        };

        set(state => ({
          tradeHistory: [tradeOffer, ...state.tradeHistory]
        }));

        // 뉴스 추가
        if (evaluation.shouldAccept) {
          const { addNews } = useNewsFeedStore.getState();
          const offeredCard = CHARACTERS_BY_ID[offeredCardId];
          const requestedCard = CHARACTERS_BY_ID[requestedCardId];
          if (offeredCard && requestedCard) {
            addNews({
              type: 'TRADE',
              seasonNumber,
              title: `🔄 트레이드 성사!`,
              content: `${offeredCard.name.ko} ↔️ ${requestedCard.name.ko}`,
              highlight: offeredCard.grade === '특급' || requestedCard.grade === '특급',
              relatedCards: [offeredCardId, requestedCardId]
            });
          }
        }

        return evaluation;
      },

      forceTrade: (params) => {
        const { seasonNumber, targetCrewId, offeredCardId, requestedCardId } = params;

        const tradeOffer: TradeOffer = {
          id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          seasonNumber,
          timestamp: Date.now(),
          proposerCrewId: PLAYER_CREW_ID,
          targetCrewId,
          offeredCardId,
          requestedCardId,
          status: 'ACCEPTED',
          isForced: true
        };

        set(state => ({
          tradeHistory: [tradeOffer, ...state.tradeHistory]
        }));

        // 강제 트레이드 뉴스
        const { addNews } = useNewsFeedStore.getState();
        const offeredCard = CHARACTERS_BY_ID[offeredCardId];
        const requestedCard = CHARACTERS_BY_ID[requestedCardId];
        if (offeredCard && requestedCard) {
          addNews({
            type: 'TRADE',
            seasonNumber,
            title: `⚡ 강제 트레이드!`,
            content: `${offeredCard.name.ko} ↔️ ${requestedCard.name.ko}`,
            highlight: true,
            relatedCards: [offeredCardId, requestedCardId]
          });
        }

        return tradeOffer;
      },

      autoAITrades: (seasonNumber, aiCrews) => {
        const completedTrades: TradeOffer[] = [];
        const gradeLimits = get().getGradeLimits();

        // 각 AI 크루 쌍에 대해 트레이드 시도
        for (let i = 0; i < aiCrews.length; i++) {
          for (let j = i + 1; j < aiCrews.length; j++) {
            // 30% 확률로 트레이드 시도
            if (Math.random() > 0.3) continue;

            const crew1 = aiCrews[i];
            const crew2 = aiCrews[j];

            // 랜덤으로 카드 선택
            const card1Index = Math.floor(Math.random() * crew1.crew.length);
            const card2Index = Math.floor(Math.random() * crew2.crew.length);

            const card1Id = crew1.crew[card1Index];
            const card2Id = crew2.crew[card2Index];

            // 평가
            const eval1 = evaluateTradeForAI(card2Id, card1Id, crew1.crew, gradeLimits);
            const eval2 = evaluateTradeForAI(card1Id, card2Id, crew2.crew, gradeLimits);

            // 양쪽 모두 수락하면 트레이드 성사
            if (eval1.shouldAccept && eval2.shouldAccept) {
              const tradeOffer: TradeOffer = {
                id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                seasonNumber,
                timestamp: Date.now(),
                proposerCrewId: crew1.id,
                targetCrewId: crew2.id,
                offeredCardId: card1Id,
                requestedCardId: card2Id,
                status: 'ACCEPTED'
              };

              completedTrades.push(tradeOffer);

              // 뉴스 추가
              const { addNews } = useNewsFeedStore.getState();
              const card1 = CHARACTERS_BY_ID[card1Id];
              const card2 = CHARACTERS_BY_ID[card2Id];
              if (card1 && card2) {
                addNews({
                  type: 'TRADE',
                  seasonNumber,
                  title: `🔄 ${crew1.name} ↔️ ${crew2.name} 트레이드`,
                  content: `${card1.name.ko} ↔️ ${card2.name.ko}`,
                  relatedCards: [card1Id, card2Id],
                  relatedCrews: [crew1.id, crew2.id]
                });
              }
            }
          }
        }

        if (completedTrades.length > 0) {
          set(state => ({
            tradeHistory: [...completedTrades, ...state.tradeHistory]
          }));
        }

        return completedTrades;
      },

      executeTrade: (tradeId, playerCrew, aiCrews) => {
        const trade = get().tradeHistory.find(t => t.id === tradeId);
        if (!trade || trade.status !== 'ACCEPTED') {
          return { success: false, error: '유효하지 않은 트레이드입니다.' };
        }

        const { proposerCrewId, targetCrewId, offeredCardId, requestedCardId } = trade;

        // 플레이어가 제안한 트레이드인 경우
        if (proposerCrewId === PLAYER_CREW_ID) {
          const newPlayerCrew = playerCrew
            .filter(id => id !== offeredCardId)
            .concat(requestedCardId);

          const targetCrewIndex = aiCrews.findIndex(c => c.id === targetCrewId);
          if (targetCrewIndex === -1) {
            return { success: false, error: '상대 크루를 찾을 수 없습니다.' };
          }

          const newAICrews = [...aiCrews];
          newAICrews[targetCrewIndex] = {
            ...newAICrews[targetCrewIndex],
            crew: newAICrews[targetCrewIndex].crew
              .filter(id => id !== requestedCardId)
              .concat(offeredCardId)
          };

          return {
            success: true,
            updatedPlayerCrew: newPlayerCrew,
            updatedAICrews: newAICrews
          };
        }

        // AI끼리 트레이드인 경우
        const proposerIndex = aiCrews.findIndex(c => c.id === proposerCrewId);
        const targetIndex = aiCrews.findIndex(c => c.id === targetCrewId);

        if (proposerIndex === -1 || targetIndex === -1) {
          return { success: false, error: '크루를 찾을 수 없습니다.' };
        }

        const newAICrews = [...aiCrews];
        newAICrews[proposerIndex] = {
          ...newAICrews[proposerIndex],
          crew: newAICrews[proposerIndex].crew
            .filter(id => id !== offeredCardId)
            .concat(requestedCardId)
        };
        newAICrews[targetIndex] = {
          ...newAICrews[targetIndex],
          crew: newAICrews[targetIndex].crew
            .filter(id => id !== requestedCardId)
            .concat(offeredCardId)
        };

        return {
          success: true,
          updatedPlayerCrew: playerCrew,
          updatedAICrews: newAICrews
        };
      },

      getGradeLimits: () => {
        const { championships } = get();
        const limits = { ...BASE_GRADE_LIMITS };

        // 우승 보너스 적용
        for (const bonus of championships) {
          limits['특급'] += bonus.specialGradeBonus;
          limits['1급'] += bonus.grade1Bonus;
        }

        return limits;
      },

      addChampionshipBonus: (seasonNumber) => {
        const newBonus: ChampionshipBonus = {
          seasonNumber,
          specialGradeBonus: 1,  // 특급 +1
          grade1Bonus: 0         // 1급은 항상 2장 제한 (보너스 없음)
        };

        set(state => ({
          championships: [...state.championships, newBonus]
        }));

        // 뉴스 추가
        const { addNews } = useNewsFeedStore.getState();
        addNews({
          type: 'AWARD',
          seasonNumber,
          title: '👑 우승 보너스 획득!',
          content: '특급 선수 1명을 추가로 영입할 수 있습니다.',
          highlight: true
        });
      },

      getCardPoint: (cardId) => {
        const card = CHARACTERS_BY_ID[cardId];
        return card ? GRADE_POINTS[card.grade] : 0;
      },

      getTradeHistory: (seasonNumber) => {
        const { tradeHistory } = get();
        if (seasonNumber === undefined) return tradeHistory;
        return tradeHistory.filter(t => t.seasonNumber === seasonNumber);
      },

      getPendingOffers: () => {
        return get().pendingOffers;
      },

      // ========================================
      // Phase 5: CP 기반 트레이드 메서드 구현
      // ========================================

      getCardCPValue: (cardId, seasonsInCrew = 0) => {
        return getCardCPValue(cardId, seasonsInCrew);
      },

      calculatePackageValue: (pkg, cardSeasonsMap) => {
        return calculatePackageValue(pkg, cardSeasonsMap);
      },

      isTradeDeadlinePassed: (currentGame) => {
        return isTradeDeadlinePassed(currentGame);
      },

      proposeTradePhase5: (params) => {
        const {
          seasonNumber,
          currentGame,
          targetCrewId,
          proposerPackage,
          targetPackage,
          targetCrew,
          cardSeasonsMap
        } = params;

        // 트레이드 마감 확인
        if (isTradeDeadlinePassed(currentGame)) {
          return {
            success: false,
            error: `트레이드 마감됨 (${TRADE_DEADLINE_GAME}경기 이후)`
          };
        }

        // 패키지 가치 계산
        const proposerValue = calculatePackageValue(proposerPackage, cardSeasonsMap);
        const targetValue = calculatePackageValue(targetPackage, cardSeasonsMap);

        // 가치 밸런스 검증 (20% 허용)
        const balanceResult = validateTradeValue(proposerValue, targetValue, 20);

        // AI 평가 (기존 로직 + CP 가치 기반)
        const gradeLimits = get().getGradeLimits();

        // 등급 제한 확인 (받을 카드들 기준)
        const targetCrewCards = targetCrew.crew.filter(id => !targetPackage.cards.includes(id));
        const newCrewCards = [...targetCrewCards, ...proposerPackage.cards];

        const gradeCounts: Record<LegacyGrade, number> = {
          '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0
        };

        for (const cardId of newCrewCards) {
          const card = CHARACTERS_BY_ID[cardId];
          if (card) gradeCounts[card.grade as LegacyGrade]++;
        }

        for (const grade of Object.keys(gradeCounts) as LegacyGrade[]) {
          if (gradeCounts[grade] > gradeLimits[grade]) {
            return {
              success: false,
              evaluation: {
                shouldAccept: false,
                reason: 'GRADE_LIMIT',
                pointDifference: targetValue - proposerValue
              },
              error: `등급 제한 초과: ${grade}`
            };
          }
        }

        // 가치 불균형 시 거절
        if (!balanceResult.valid) {
          return {
            success: false,
            evaluation: {
              shouldAccept: false,
              reason: 'POINT_DIFF_TOO_HIGH',
              pointDifference: targetValue - proposerValue
            },
            error: balanceResult.message
          };
        }

        // 특급/1급 카드 보호 로직
        for (const cardId of targetPackage.cards) {
          const card = CHARACTERS_BY_ID[cardId];
          if (card?.grade === '특급' && Math.random() < 0.8) {
            return {
              success: false,
              evaluation: {
                shouldAccept: false,
                reason: 'NEED_THIS_CARD',
                pointDifference: targetValue - proposerValue
              }
            };
          }
          if (card?.grade === '1급' && Math.random() < 0.5) {
            return {
              success: false,
              evaluation: {
                shouldAccept: false,
                reason: 'NEED_THIS_CARD',
                pointDifference: targetValue - proposerValue
              }
            };
          }
        }

        // 트레이드 성사
        const trade: TradeOfferPhase5 = {
          id: `trade5-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          seasonNumber,
          timestamp: Date.now(),
          proposerCrewId: PLAYER_CREW_ID,
          targetCrewId,
          proposerPackage,
          targetPackage,
          status: 'ACCEPTED',
          proposerTV: proposerValue,
          targetTV: targetValue
        };

        // 뉴스 추가
        const { addNews } = useNewsFeedStore.getState();
        const cardNames = proposerPackage.cards
          .map(id => CHARACTERS_BY_ID[id]?.name.ko)
          .filter(Boolean)
          .join(', ');
        const targetCardNames = targetPackage.cards
          .map(id => CHARACTERS_BY_ID[id]?.name.ko)
          .filter(Boolean)
          .join(', ');

        addNews({
          type: 'TRADE',
          seasonNumber,
          title: `🔄 트레이드 성사!`,
          content: `${cardNames || 'CP'} ↔️ ${targetCardNames || 'CP'} (${proposerValue.toLocaleString()} ↔️ ${targetValue.toLocaleString()} CP)`,
          highlight: proposerPackage.cards.some(id => CHARACTERS_BY_ID[id]?.grade === '특급'),
          relatedCards: [...proposerPackage.cards, ...targetPackage.cards]
        });

        return {
          success: true,
          evaluation: {
            shouldAccept: true,
            reason: proposerValue > targetValue ? 'GOOD_DEAL' : 'FAIR_TRADE',
            pointDifference: targetValue - proposerValue
          },
          trade
        };
      },

      validateTradeBalance: (proposerPackage, targetPackage, cardSeasonsMap) => {
        const proposerValue = calculatePackageValue(proposerPackage, cardSeasonsMap);
        const targetValue = calculatePackageValue(targetPackage, cardSeasonsMap);
        const result = validateTradeValue(proposerValue, targetValue, 20);

        return {
          valid: result.valid,
          proposerValue,
          targetValue,
          difference: result.difference,
          differencePercent: result.differencePercent,
          message: result.message
        };
      },

      reset: () => {
        set({
          tradeHistory: [],
          pendingOffers: [],
          championships: []
        });
      }
    }),
    {
      name: 'jjk-trade',
      version: 1
    }
  )
);

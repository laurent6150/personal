// ========================================
// 드래프트 시스템 스토어 (Phase 5.1)
// NBA 스타일 드래프트 + 픽 트레이드
// playerStore 연동: 드래프트로 획득한 카드가 ownedCards에 추가됨
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHARACTERS_BY_ID, ALL_CHARACTERS } from '../data/characters';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import {
  DRAFT_POOL_MIN,
  DRAFT_POOL_MAX,
  STEFAN_RULE_CONSECUTIVE_SEASONS
} from '../data/constants';
import type {
  DraftPoolCard,
  DraftPick,
  DraftResult,
  CooldownCard,
  LegacyGrade,
  DraftSource
} from '../types';

// playerStore와의 연동을 위한 lazy import (circular dependency 방지)
let playerStorePromise: Promise<typeof import('./playerStore')> | null = null;
function getPlayerStore() {
  if (!playerStorePromise) {
    playerStorePromise = import('./playerStore');
  }
  return playerStorePromise;
}

// ========================================
// 드래프트 스토어 인터페이스
// ========================================

interface DraftState {
  // 드래프트 풀 (무소속 카드들)
  draftPool: DraftPoolCard[];

  // 각 크루의 드래프트 픽 보유 현황
  draftPicks: Record<string, DraftPick[]>;

  // 드래프트 히스토리
  draftHistory: DraftResult[];

  // 은퇴 후 쿨다운 중인 카드
  cooldownCards: CooldownCard[];

  // 드래프트 진행 상태
  isDraftInProgress: boolean;
  currentDraftSeason: number | null;
  currentPickIndex: number;
  draftOrder: string[];  // 크루 ID 순서

  // 액션
  addToDraftPool: (cardId: string, source: DraftSource, season: number, isResetCard?: boolean) => void;
  removeFromDraftPool: (cardId: string) => void;
  initializeDraftPool: (seasonNumber: number, allCrewCards: string[]) => void;
  startDraft: (seasonNumber: number, standings: Array<{ crewId: string; points: number; goalDifference: number }>) => void;
  makePlayerPick: (cardId: string) => void;
  makeAIPick: (crewId: string) => string | null;
  executeDraftPick: (crewId: string, cardId: string) => void;
  finishDraft: () => DraftResult | null;
  processCooldowns: () => string[];  // 복귀한 카드 ID 반환
  tradePick: (fromCrewId: string, toCrewId: string, pick: DraftPick) => boolean;
  canTradePick: (crewId: string, pickSeason: number) => boolean;
  initializePicksForSeason: (seasonNumber: number, crewIds: string[]) => void;
  getCrewPicks: (crewId: string) => DraftPick[];
  getDraftPoolCards: () => DraftPoolCard[];

  // 초기화
  reset: () => void;
}

// 초기 상태
const initialState = {
  draftPool: [],
  draftPicks: {},
  draftHistory: [],
  cooldownCards: [],
  isDraftInProgress: false,
  currentDraftSeason: null,
  currentPickIndex: 0,
  draftOrder: [],
};

// ========================================
// 드래프트 순서 결정 (역순위)
// ========================================

function determineDraftOrder(
  standings: Array<{ crewId: string; points: number; goalDifference: number }>
): string[] {
  return [...standings]
    .sort((a, b) => {
      // 포인트 오름차순 (적은 포인트 = 약한 팀 = 먼저 선택)
      if (a.points !== b.points) return a.points - b.points;
      // 동점 시: 골득실 오름차순
      return a.goalDifference - b.goalDifference;
    })
    .map(s => s.crewId);
}

// ========================================
// AI 카드 선택 로직
// Phase 5.3: CP 가치 기반으로 변경
// ========================================

import { calculateCardValue, determineCareerPhase } from '../utils/salarySystem';

function selectBestCardForAI(
  availableCards: DraftPoolCard[],
  _crewId: string
): string | null {
  if (availableCards.length === 0) return null;

  // Phase 5.3: CP 가치 기반 선택
  // 각 카드의 CP 가치 계산
  const cardsWithValue = availableCards.map(card => {
    const char = CHARACTERS_BY_ID[card.cardId];
    if (!char) return { card, value: 0 };

    const careerPhase = determineCareerPhase(char.grade as LegacyGrade, 0);  // 신규 카드는 시즌 0
    const value = calculateCardValue(char.grade as LegacyGrade, 1, careerPhase);
    return { card, value };
  });

  // CP 가치 내림차순 정렬
  cardsWithValue.sort((a, b) => b.value - a.value);

  // 가장 높은 가치 그룹 (상위 20% 이내 또는 최고 가치와 동등한 것들)
  const maxValue = cardsWithValue[0].value;
  const topCandidates = cardsWithValue.filter(
    c => c.value >= maxValue * 0.9  // 최고 가치의 90% 이상
  );

  // 상위 그룹 중 랜덤 선택 (약간의 변동성)
  const randomIndex = Math.floor(Math.random() * topCandidates.length);
  return topCandidates[randomIndex].card.cardId;
}

// ========================================
// 스토어 구현
// ========================================

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 드래프트 풀에 카드 추가
      addToDraftPool: (cardId: string, source: DraftSource, season: number, isResetCard = false) => {
        const { draftPool } = get();

        // 중복 체크
        if (draftPool.some(c => c.cardId === cardId)) {
          console.warn(`[Draft] 이미 드래프트 풀에 있는 카드: ${cardId}`);
          return;
        }

        const newCard: DraftPoolCard = {
          cardId,
          source,
          addedSeason: season,
          isResetCard,
        };

        set({ draftPool: [...draftPool, newCard] });
        console.log(`[Draft] 드래프트 풀에 추가: ${cardId} (${source})`);
      },

      // 드래프트 풀에서 카드 제거
      removeFromDraftPool: (cardId: string) => {
        set(state => ({
          draftPool: state.draftPool.filter(c => c.cardId !== cardId)
        }));
      },

      // 드래프트 풀 초기화 (시즌 시작 시)
      initializeDraftPool: (seasonNumber: number, allCrewCards: string[]) => {
        const { cooldownCards, draftPool, addToDraftPool, processCooldowns } = get();

        // 1. 쿨다운 완료 카드 복귀
        const returnedCards = processCooldowns();
        console.log(`[Draft] 쿨다운 완료 복귀 카드: ${returnedCards.length}장`);

        // 2. 미배정 카드 찾기 (전체 캐릭터 - 크루 보유 카드)
        const unassignedCards = ALL_CHARACTERS
          .map(c => c.id)
          .filter(id => !allCrewCards.includes(id))
          .filter(id => !draftPool.some(p => p.cardId === id))
          .filter(id => !cooldownCards.some(c => c.cardId === id));

        // 3. 드래프트 풀 최소 보장 (시즌 1~3에서 은퇴 카드 없을 때)
        const currentPoolSize = draftPool.length;
        const neededCards = Math.max(0, DRAFT_POOL_MIN - currentPoolSize);

        if (neededCards > 0 && unassignedCards.length > 0) {
          // 랜덤으로 미배정 카드 추가
          const shuffled = [...unassignedCards].sort(() => Math.random() - 0.5);
          const toAdd = shuffled.slice(0, Math.min(neededCards, DRAFT_POOL_MAX - currentPoolSize));

          for (const cardId of toAdd) {
            addToDraftPool(cardId, 'INITIAL_POOL', seasonNumber);
          }
        }

        console.log(`[Draft] 시즌 ${seasonNumber} 드래프트 풀 초기화 완료. 총 ${get().draftPool.length}장`);
      },

      // 드래프트 시작
      startDraft: (seasonNumber: number, standings) => {
        const draftOrder = determineDraftOrder(standings);

        set({
          isDraftInProgress: true,
          currentDraftSeason: seasonNumber,
          currentPickIndex: 0,
          draftOrder,
        });

        console.log(`[Draft] 시즌 ${seasonNumber} 드래프트 시작. 순서: ${draftOrder.join(' -> ')}`);
      },

      // 플레이어 픽
      makePlayerPick: (cardId: string) => {
        const { draftPool, currentPickIndex, draftOrder, executeDraftPick } = get();

        const currentCrewId = draftOrder[currentPickIndex];
        if (currentCrewId !== PLAYER_CREW_ID) {
          console.warn('[Draft] 현재 플레이어 차례가 아닙니다.');
          return;
        }

        if (!draftPool.some(c => c.cardId === cardId)) {
          console.warn('[Draft] 선택한 카드가 드래프트 풀에 없습니다.');
          return;
        }

        executeDraftPick(PLAYER_CREW_ID, cardId);
      },

      // AI 픽
      makeAIPick: (crewId: string) => {
        const { draftPool, draftPicks, currentDraftSeason, executeDraftPick } = get();

        // 이 크루가 해당 시즌 픽을 보유하고 있는지 확인
        const crewPickList = draftPicks[crewId] || [];
        const hasPick = crewPickList.some(
          p => p.season === currentDraftSeason && !p.used && p.currentOwner === crewId
        );

        if (!hasPick) {
          console.log(`[Draft] ${crewId}는 픽을 트레이드로 넘겼으므로 스킵`);
          return null;
        }

        const selectedCardId = selectBestCardForAI(draftPool, crewId);

        if (selectedCardId) {
          executeDraftPick(crewId, selectedCardId);
        }

        return selectedCardId;
      },

      // 드래프트 픽 실행
      executeDraftPick: (crewId: string, cardId: string) => {
        const { currentPickIndex, draftPicks, currentDraftSeason } = get();

        // 풀에서 제거
        set(state => ({
          draftPool: state.draftPool.filter(c => c.cardId !== cardId)
        }));

        // 픽 사용 처리
        const crewPickList = draftPicks[crewId] || [];
        const updatedPicks = crewPickList.map(p => {
          if (p.season === currentDraftSeason && !p.used && p.currentOwner === crewId) {
            return { ...p, used: true, pickOrder: currentPickIndex + 1 };
          }
          return p;
        });

        set(state => ({
          draftPicks: { ...state.draftPicks, [crewId]: updatedPicks },
          currentPickIndex: state.currentPickIndex + 1,
        }));

        const charName = CHARACTERS_BY_ID[cardId]?.name.ko || cardId;
        console.log(`[Draft] ${crewId}가 ${charName} 선택 (${currentPickIndex + 1}순위)`);

        // Phase 5.1: 플레이어 크루인 경우 ownedCards에 카드 추가
        if (crewId === PLAYER_CREW_ID) {
          getPlayerStore().then(({ usePlayerStore }) => {
            const { addOwnedCard } = usePlayerStore.getState();
            const success = addOwnedCard(cardId);
            if (success) {
              console.log(`[Draft] 플레이어 ownedCards에 ${charName} 추가 완료`);
            } else {
              console.error(`[Draft] 플레이어 ownedCards에 ${charName} 추가 실패`);
            }
          });
        }
      },

      // 드래프트 종료
      finishDraft: () => {
        const { currentDraftSeason, draftOrder, draftPicks, draftHistory } = get();

        if (!currentDraftSeason) return null;

        // 드래프트 결과 생성
        const picks: DraftResult['picks'] = [];

        for (let i = 0; i < draftOrder.length; i++) {
          const crewId = draftOrder[i];
          const crewPickList = draftPicks[crewId] || [];
          const usedPick = crewPickList.find(
            p => p.season === currentDraftSeason && p.used && p.pickOrder === i + 1
          );

          if (usedPick) {
            // 실제 선택된 카드는 별도로 추적해야 함
            // 여기서는 픽 순서만 기록
            picks.push({
              pickOrder: i + 1,
              crewId,
              cardId: '', // 실제 카드 ID는 executeDraftPick에서 기록해야 함
              isPlayerPick: crewId === PLAYER_CREW_ID,
            });
          }
        }

        const result: DraftResult = {
          season: currentDraftSeason,
          picks,
        };

        set({
          draftHistory: [...draftHistory, result],
          isDraftInProgress: false,
          currentDraftSeason: null,
          currentPickIndex: 0,
          draftOrder: [],
        });

        console.log(`[Draft] 시즌 ${currentDraftSeason} 드래프트 종료`);
        return result;
      },

      // 쿨다운 처리 (시즌 종료 시)
      processCooldowns: () => {
        const { cooldownCards, addToDraftPool } = get();
        const returnedCards: string[] = [];

        const updatedCooldowns = cooldownCards
          .map(card => ({
            ...card,
            cooldownRemaining: card.cooldownRemaining - 1
          }))
          .filter(card => {
            if (card.cooldownRemaining <= 0) {
              // 쿨다운 완료 → 드래프트 풀로
              addToDraftPool(card.cardId, 'RETIREMENT_RESET', card.retiredSeason + card.cooldownRemaining + 1, true);
              returnedCards.push(card.cardId);
              return false;
            }
            return true;
          });

        set({ cooldownCards: updatedCooldowns });
        return returnedCards;
      },

      // 픽 트레이드
      tradePick: (fromCrewId: string, toCrewId: string, pick: DraftPick) => {
        const { draftPicks, canTradePick } = get();

        // 스테판 규칙 체크
        if (!canTradePick(fromCrewId, pick.season)) {
          console.warn('[Draft] 스테판 규칙 위반: 연속 2시즌 픽을 모두 트레이드할 수 없습니다.');
          return false;
        }

        // 픽 소유권 이전
        const fromPicks = draftPicks[fromCrewId] || [];
        const toPicks = draftPicks[toCrewId] || [];

        const updatedFromPicks = fromPicks.filter(
          p => !(p.season === pick.season && p.originalOwner === pick.originalOwner)
        );

        const updatedToPicks = [...toPicks, { ...pick, currentOwner: toCrewId }];

        set({
          draftPicks: {
            ...draftPicks,
            [fromCrewId]: updatedFromPicks,
            [toCrewId]: updatedToPicks,
          }
        });

        console.log(`[Draft] 픽 트레이드: ${fromCrewId} -> ${toCrewId} (시즌 ${pick.season})`);
        return true;
      },

      // 스테판 규칙 체크
      canTradePick: (crewId: string, pickSeason: number) => {
        const { draftPicks } = get();
        const crewPickList = draftPicks[crewId] || [];

        // 연속 시즌 픽 확인
        for (let i = 1; i <= STEFAN_RULE_CONSECUTIVE_SEASONS; i++) {
          const adjacentSeason = pickSeason + i;
          const hasAdjacentPick = crewPickList.some(
            p => p.season === adjacentSeason && p.currentOwner === crewId && !p.used
          );

          if (hasAdjacentPick) {
            return true;  // 인접 시즌 픽이 있으면 OK
          }

          const prevSeason = pickSeason - i;
          const hasPrevPick = crewPickList.some(
            p => p.season === prevSeason && p.currentOwner === crewId && !p.used
          );

          if (hasPrevPick) {
            return true;  // 이전 시즌 픽이 있으면 OK
          }
        }

        // 모든 인접 시즌 픽을 이미 트레이드했으면 불가
        return false;
      },

      // 시즌별 픽 초기화
      initializePicksForSeason: (seasonNumber: number, crewIds: string[]) => {
        const { draftPicks } = get();
        const updatedPicks = { ...draftPicks };

        for (const crewId of crewIds) {
          const existingPicks = updatedPicks[crewId] || [];

          // 해당 시즌 픽이 없으면 추가
          const hasSeasonPick = existingPicks.some(p => p.season === seasonNumber);
          if (!hasSeasonPick) {
            existingPicks.push({
              season: seasonNumber,
              originalOwner: crewId,
              currentOwner: crewId,
              used: false,
            });
          }

          // 다음 시즌 픽도 미리 생성 (트레이드용)
          const nextSeason = seasonNumber + 1;
          const hasNextSeasonPick = existingPicks.some(p => p.season === nextSeason);
          if (!hasNextSeasonPick) {
            existingPicks.push({
              season: nextSeason,
              originalOwner: crewId,
              currentOwner: crewId,
              used: false,
            });
          }

          updatedPicks[crewId] = existingPicks;
        }

        set({ draftPicks: updatedPicks });
        console.log(`[Draft] 시즌 ${seasonNumber} 픽 초기화 완료. ${crewIds.length}개 크루`);
      },

      // 크루별 픽 조회
      getCrewPicks: (crewId: string) => {
        return get().draftPicks[crewId] || [];
      },

      // 드래프트 풀 카드 조회
      getDraftPoolCards: () => {
        return get().draftPool;
      },

      // 초기화
      reset: () => {
        set(initialState);
        console.log('[Draft] 스토어 초기화 완료');
      },
    }),
    {
      name: 'jjk-draft',
      version: 1,
    }
  )
);

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 드래프트 풀 카드 정보 (UI용)
 */
export function getDraftPoolCardInfo(card: DraftPoolCard): {
  cardId: string;
  name: string;
  grade: LegacyGrade;
  isResetCard: boolean;
  source: DraftSource;
} {
  const character = CHARACTERS_BY_ID[card.cardId];
  return {
    cardId: card.cardId,
    name: character?.name.ko || card.cardId,
    grade: (character?.grade as LegacyGrade) || '3급',
    isResetCard: card.isResetCard,
    source: card.source,
  };
}

/**
 * 드래프트 픽 Trade Value 계산
 */
export function calculatePickTV(
  pick: DraftPick,
  currentSeason: number
): number {
  // 기본 픽 가치
  const BASE_PICK_TV = 1200;

  // 미래 시즌 픽은 불확실성 프리미엄
  const isFuturePick = pick.season > currentSeason;
  const multiplier = isFuturePick ? 1.3 : 1.0;

  return Math.floor(BASE_PICK_TV * multiplier);
}

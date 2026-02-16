// ========================================
// 드래프트 시스템 스토어
// 스네이크 드래프트: 10팀 × 6라운드 = 60픽
// 71캐릭터 중 11장은 비계약(FA) 카드로 남음
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ALL_CHARACTERS, CHARACTERS_BY_ID } from '../data/characters';
import { PLAYER_CREW_ID, AI_CREW_TEMPLATES } from '../data/aiCrews';
import { DRAFT_ROUNDS } from '../data/constants';
import type {
  DraftPoolCard,
  DraftResult,
  LegacyGrade,
  DraftSource
} from '../types';

// ========================================
// 유틸리티
// ========================================

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ========================================
// 드래프트 순서 결정 (역순위)
// ========================================

function determineDraftOrder(
  standings: Array<{ crewId: string; points: number; goalDifference: number }>
): string[] {
  return [...standings]
    .sort((a, b) => {
      if (a.points !== b.points) return a.points - b.points;
      if (a.goalDifference !== b.goalDifference) return a.goalDifference - b.goalDifference;
      return Math.random() - 0.5; // 동점 시 랜덤
    })
    .map(s => s.crewId);
}

/**
 * 스네이크 드래프트 순서 생성
 * 홀수 라운드: 정방향 (약한 팀 → 강한 팀)
 * 짝수 라운드: 역방향 (강한 팀 → 약한 팀)
 */
function generateSnakeDraftOrder(baseOrder: string[], rounds: number): string[] {
  const fullOrder: string[] = [];
  for (let round = 0; round < rounds; round++) {
    if (round % 2 === 0) {
      fullOrder.push(...baseOrder);
    } else {
      fullOrder.push(...[...baseOrder].reverse());
    }
  }
  return fullOrder;
}

// ========================================
// AI 카드 선택 로직 (CP 가치 기반)
// ========================================

import { calculateCardValue, determineCareerPhase } from '../utils/salarySystem';

function selectBestCardForAI(
  availableCards: DraftPoolCard[],
  _crewId: string
): string | null {
  if (availableCards.length === 0) return null;

  const cardsWithValue = availableCards.map(card => {
    const char = CHARACTERS_BY_ID[card.cardId];
    if (!char) return { card, value: 0 };
    const careerPhase = determineCareerPhase(char.grade as LegacyGrade, 0);
    const value = calculateCardValue(char.grade as LegacyGrade, 1, careerPhase);
    return { card, value };
  });

  cardsWithValue.sort((a, b) => b.value - a.value);

  const maxValue = cardsWithValue[0].value;
  const topCandidates = cardsWithValue.filter(
    c => c.value >= maxValue * 0.9
  );

  const randomIndex = Math.floor(Math.random() * topCandidates.length);
  return topCandidates[randomIndex].card.cardId;
}

// ========================================
// 드래프트 스토어 인터페이스
// ========================================

interface DraftState {
  // 드래프트 풀
  draftPool: DraftPoolCard[];

  // 드래프트 진행 상태
  isDraftInProgress: boolean;
  currentDraftSeason: number | null;
  currentPickIndex: number;
  draftOrder: string[];
  draftRounds: number;
  teamsPerRound: number;

  // 드래프트 결과
  crewDraftResults: Record<string, string[]>; // crewId → 드래프트된 카드 ID 배열
  freeAgentCards: string[]; // 미선택(비계약) 카드 ID 배열

  // 드래프트 히스토리
  draftHistory: DraftResult[];

  // 액션
  startDraft: (
    seasonNumber: number,
    standings: Array<{ crewId: string; points: number; goalDifference: number }>,
    rounds?: number
  ) => void;
  makePlayerPick: (cardId: string) => void;
  makeAIPick: (crewId: string) => string | null;
  executeDraftPick: (crewId: string, cardId: string) => void;
  finishDraft: () => { crews: Record<string, string[]>; freeAgents: string[] } | null;
  getDraftCrewResults: () => Record<string, string[]>;
  getFreeAgentCards: () => string[];

  // 초기화
  reset: () => void;
}

// 초기 상태
const initialState = {
  draftPool: [] as DraftPoolCard[],
  isDraftInProgress: false,
  currentDraftSeason: null as number | null,
  currentPickIndex: 0,
  draftOrder: [] as string[],
  draftRounds: DRAFT_ROUNDS,
  teamsPerRound: 10,
  crewDraftResults: {} as Record<string, string[]>,
  freeAgentCards: [] as string[],
  draftHistory: [] as DraftResult[],
};

// ========================================
// 스토어 구현
// ========================================

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // 드래프트 시작 (전체 카드 풀 초기화 + 스네이크 순서 생성)
      // ========================================
      startDraft: (seasonNumber, standings, rounds) => {
        const effectiveRounds = rounds || DRAFT_ROUNDS;

        // 1. 전체 캐릭터를 드래프트 풀에 투입
        const allCards: DraftPoolCard[] = ALL_CHARACTERS.map(c => ({
          cardId: c.id,
          source: 'INITIAL_POOL' as DraftSource,
          addedSeason: seasonNumber,
          isResetCard: false,
        }));

        // 2. 드래프트 순서 결정
        let baseOrder: string[];
        if (standings.length === 0) {
          // 시즌 1: 랜덤 순서
          const allCrewIds = [PLAYER_CREW_ID, ...AI_CREW_TEMPLATES.map(t => t.id)];
          baseOrder = shuffleArray(allCrewIds);
        } else {
          // 시즌 2+: 역순위 (약한 팀 먼저)
          baseOrder = determineDraftOrder(standings);
        }

        // 3. 스네이크 드래프트 순서 생성
        const draftOrder = generateSnakeDraftOrder(baseOrder, effectiveRounds);

        set({
          draftPool: allCards,
          isDraftInProgress: true,
          currentDraftSeason: seasonNumber,
          currentPickIndex: 0,
          draftOrder,
          draftRounds: effectiveRounds,
          teamsPerRound: baseOrder.length,
          crewDraftResults: {},
          freeAgentCards: [],
        });

        console.log(`[Draft] 시즌 ${seasonNumber} 스네이크 드래프트 시작`);
        console.log(`[Draft] ${effectiveRounds}라운드 × ${baseOrder.length}팀 = ${draftOrder.length}픽`);
        console.log(`[Draft] 풀: ${allCards.length}장 (비계약 예상: ${allCards.length - draftOrder.length}장)`);
        console.log(`[Draft] 기본 순서: ${baseOrder.join(' → ')}`);
      },

      // ========================================
      // 플레이어 픽
      // ========================================
      makePlayerPick: (cardId: string) => {
        const { draftPool, currentPickIndex, draftOrder, executeDraftPick } = get();

        if (currentPickIndex >= draftOrder.length) {
          console.warn('[Draft] 드래프트가 이미 완료되었습니다.');
          return;
        }

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

      // ========================================
      // AI 픽
      // ========================================
      makeAIPick: (crewId: string) => {
        const { draftPool, executeDraftPick } = get();

        const selectedCardId = selectBestCardForAI(draftPool, crewId);

        if (selectedCardId) {
          executeDraftPick(crewId, selectedCardId);
        }

        return selectedCardId;
      },

      // ========================================
      // 드래프트 픽 실행
      // ========================================
      executeDraftPick: (crewId: string, cardId: string) => {
        const { currentPickIndex, crewDraftResults } = get();

        // 크루 결과에 카드 추가
        const crewCards = crewDraftResults[crewId] || [];

        set(state => ({
          draftPool: state.draftPool.filter(c => c.cardId !== cardId),
          crewDraftResults: {
            ...state.crewDraftResults,
            [crewId]: [...crewCards, cardId],
          },
          currentPickIndex: state.currentPickIndex + 1,
        }));

        const charName = CHARACTERS_BY_ID[cardId]?.name.ko || cardId;
        const pickNum = currentPickIndex + 1;
        console.log(`[Draft] ${crewId}가 ${charName} 선택 (${pickNum}번째 픽)`);
      },

      // ========================================
      // 드래프트 종료
      // ========================================
      finishDraft: () => {
        const { currentDraftSeason, draftPool, crewDraftResults, draftHistory } = get();

        if (!currentDraftSeason) return null;

        // 남은 풀 카드 → 비계약(FA) 카드
        const freeAgents = draftPool.map(c => c.cardId);

        // 드래프트 결과 기록
        const picks: DraftResult['picks'] = [];
        const { draftOrder, currentPickIndex } = get();
        for (let i = 0; i < Math.min(currentPickIndex, draftOrder.length); i++) {
          picks.push({
            pickOrder: i + 1,
            crewId: draftOrder[i],
            cardId: '', // 간소화
            isPlayerPick: draftOrder[i] === PLAYER_CREW_ID,
          });
        }

        const result: DraftResult = {
          season: currentDraftSeason,
          picks,
        };

        // 크루별 드래프트 결과 로그
        console.log(`[Draft] 시즌 ${currentDraftSeason} 드래프트 종료`);
        Object.entries(crewDraftResults).forEach(([crewId, cards]) => {
          const names = cards.map(id => CHARACTERS_BY_ID[id]?.name.ko || id).join(', ');
          console.log(`[Draft]   ${crewId}: ${cards.length}장 [${names}]`);
        });
        console.log(`[Draft]   비계약(FA): ${freeAgents.length}장`);

        set({
          draftHistory: [...draftHistory, result],
          isDraftInProgress: false,
          currentDraftSeason: null,
          currentPickIndex: 0,
          draftOrder: [],
          draftPool: [],
          freeAgentCards: freeAgents,
          // crewDraftResults는 유지 (App.tsx에서 읽어야 함)
        });

        return { crews: crewDraftResults, freeAgents };
      },

      // 드래프트 결과 조회
      getDraftCrewResults: () => get().crewDraftResults,
      getFreeAgentCards: () => get().freeAgentCards,

      // 초기화
      reset: () => {
        set(initialState);
        console.log('[Draft] 스토어 초기화 완료');
      },
    }),
    {
      name: 'jjk-draft',
      version: 2, // v2: 스네이크 드래프트 전면 재설계
    }
  )
);

// ========================================
// 게임 상태 관리 (Zustand)
// ========================================

import { create } from 'zustand';
import type {
  GameSession,
  GameStatus,
  Difficulty,
  RoundResult,
  CharacterCard
} from '../types';
import { getRandomArena } from '../data/arenas';
import { aiSelectCard } from '../utils/aiLogic';
import { resolveRound } from '../utils/battleCalculator';
import { CHARACTERS_BY_ID } from '../data/characters';
import { WIN_SCORE, MAX_ROUNDS } from '../data/constants';

interface GameState {
  // 현재 게임 세션
  session: GameSession | null;

  // UI 상태
  selectedCardId: string | null;
  isAnimating: boolean;
  showResult: boolean;
  lastRoundResult: RoundResult | null;

  // 액션
  startGame: (playerCrew: string[], aiCrew: string[], difficulty: Difficulty) => void;
  selectCard: (cardId: string) => void;
  executeRound: () => RoundResult | null;
  endGame: () => { winner: 'PLAYER' | 'AI'; score: { player: number; ai: number } } | null;
  resetGame: () => void;

  // UI 액션
  setAnimating: (value: boolean) => void;
  setShowResult: (value: boolean) => void;
  clearLastResult: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  selectedCardId: null,
  isAnimating: false,
  showResult: false,
  lastRoundResult: null,

  startGame: (playerCrew: string[], aiCrew: string[], difficulty: Difficulty) => {
    // 시즌에서 배정된 AI 크루 사용 (중복 방지)
    // 첫 번째 경기장 선택
    const firstArena = getRandomArena();

    const session: GameSession = {
      id: `game_${Date.now()}`,
      player: {
        crew: playerCrew,
        score: 0,
        usedCards: []
      },
      ai: {
        difficulty,
        crew: aiCrew, // 시즌에서 배정된 AI 크루 사용
        score: 0,
        usedCards: []
      },
      rounds: [],
      currentRound: 1,
      status: 'IN_PROGRESS',
      currentArena: firstArena
    };

    set({
      session,
      selectedCardId: null,
      isAnimating: false,
      showResult: false,
      lastRoundResult: null
    });
  },

  selectCard: (cardId: string) => {
    const { session } = get();
    if (!session || session.status !== 'IN_PROGRESS') return;

    // 이미 사용한 카드인지 확인
    if (session.player.usedCards.includes(cardId)) return;

    // 플레이어 크루에 있는 카드인지 확인
    if (!session.player.crew.includes(cardId)) return;

    set({ selectedCardId: cardId });
  },

  executeRound: () => {
    const { session, selectedCardId } = get();
    if (!session || !selectedCardId || session.status !== 'IN_PROGRESS') {
      return null;
    }

    const arena = session.currentArena!;

    // AI 카드 선택
    const aiAvailableCards = session.ai.crew
      .filter(id => !session.ai.usedCards.includes(id))
      .map(id => CHARACTERS_BY_ID[id])
      .filter(Boolean) as CharacterCard[];

    const aiCard = aiSelectCard(
      session.ai.difficulty,
      aiAvailableCards,
      arena,
      session.player.usedCards,
      session.player.crew.filter(id => !session.player.usedCards.includes(id)),
      { player: session.player.score, ai: session.ai.score },
      session.currentRound
    );

    // 플레이어 카드 (기본 스탯으로)
    const playerCharCard = CHARACTERS_BY_ID[selectedCardId];
    if (!playerCharCard) return null;

    // 라운드 실행
    const roundResult = resolveRound(
      {
        cardId: selectedCardId,
        level: 1,
        exp: 0,
        equipment: [null, null],
        stats: { totalWins: 0, totalLosses: 0, vsRecord: {}, arenaRecord: {} },
        unlockedAchievements: []
      },
      aiCard,
      arena,
      session.currentRound
    );

    // 상태 업데이트
    const newPlayerUsedCards = [...session.player.usedCards, selectedCardId];
    const newAiUsedCards = [...session.ai.usedCards, aiCard.id];

    let newPlayerScore = session.player.score;
    let newAiScore = session.ai.score;

    if (roundResult.winner === 'PLAYER') {
      newPlayerScore++;
    } else if (roundResult.winner === 'AI') {
      newAiScore++;
    }

    // 게임 종료 조건 체크
    let newStatus: GameStatus = 'IN_PROGRESS';
    if (newPlayerScore >= WIN_SCORE) {
      newStatus = 'PLAYER_WIN';
    } else if (newAiScore >= WIN_SCORE) {
      newStatus = 'AI_WIN';
    } else if (session.currentRound >= MAX_ROUNDS) {
      // 5라운드 종료 후 점수로 판정
      if (newPlayerScore > newAiScore) {
        newStatus = 'PLAYER_WIN';
      } else if (newAiScore > newPlayerScore) {
        newStatus = 'AI_WIN';
      } else {
        // 동점이면 추가 라운드 (에이스전) 필요하지만 일단 AI 승으로 처리
        newStatus = 'AI_WIN';
      }
    }

    // 다음 경기장 선택 (게임 진행 중인 경우)
    const nextArena = newStatus === 'IN_PROGRESS' ? getRandomArena() : null;

    const newSession: GameSession = {
      ...session,
      player: {
        ...session.player,
        score: newPlayerScore,
        usedCards: newPlayerUsedCards
      },
      ai: {
        ...session.ai,
        score: newAiScore,
        usedCards: newAiUsedCards
      },
      rounds: [...session.rounds, roundResult],
      currentRound: session.currentRound + 1,
      status: newStatus,
      currentArena: nextArena
    };

    set({
      session: newSession,
      selectedCardId: null,
      lastRoundResult: roundResult,
      showResult: true
    });

    return roundResult;
  },

  endGame: () => {
    const { session } = get();
    if (!session) return null;

    const winner = session.status === 'PLAYER_WIN' ? 'PLAYER' : 'AI';
    const score = {
      player: session.player.score,
      ai: session.ai.score
    };

    return { winner, score };
  },

  resetGame: () => {
    set({
      session: null,
      selectedCardId: null,
      isAnimating: false,
      showResult: false,
      lastRoundResult: null
    });
  },

  setAnimating: (value: boolean) => {
    set({ isAnimating: value });
  },

  setShowResult: (value: boolean) => {
    set({ showResult: value });
  },

  clearLastResult: () => {
    set({ lastRoundResult: null, showResult: false });
  }
}));

// 선택자 (Selector) 함수들
export const selectIsGameInProgress = (state: GameState) =>
  state.session?.status === 'IN_PROGRESS';

export const selectPlayerAvailableCards = (state: GameState) => {
  if (!state.session) return [];
  return state.session.player.crew.filter(
    id => !state.session!.player.usedCards.includes(id)
  );
};

export const selectAiAvailableCards = (state: GameState) => {
  if (!state.session) return [];
  return state.session.ai.crew.filter(
    id => !state.session!.ai.usedCards.includes(id)
  );
};

export const selectCurrentScore = (state: GameState) => {
  if (!state.session) return { player: 0, ai: 0 };
  return {
    player: state.session.player.score,
    ai: state.session.ai.score
  };
};

export const selectCurrentRound = (state: GameState) =>
  state.session?.currentRound ?? 0;

export const selectCurrentArena = (state: GameState) =>
  state.session?.currentArena ?? null;

export const selectGameStatus = (state: GameState) =>
  state.session?.status ?? 'PREPARING';

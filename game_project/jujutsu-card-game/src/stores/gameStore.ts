// ========================================
// 게임 상태 관리 (Zustand)
// ========================================

import { create } from 'zustand';
import type {
  GameSession,
  GameStatus,
  Difficulty,
  RoundResult,
  CharacterCard,
  PlayerCard,
  BanPickInfo,
  CardAssignment,
  BanPickPhase
} from '../types';
import { getRandomArena, getRandomArenaExcluding } from '../data/arenas';
import { aiSelectCard } from '../utils/aiLogic';
import { resolveRound } from '../utils/battleCalculator';
import { CHARACTERS_BY_ID } from '../data/characters';
import { WIN_SCORE, MAX_ROUNDS } from '../data/constants';
import { initializeGrowthData } from '../data/growthSystem';
import { executeBanPickProcess } from '../utils/banPickSystem';

interface GameState {
  // 현재 게임 세션
  session: GameSession | null;

  // UI 상태
  selectedCardId: string | null;
  isAnimating: boolean;
  showResult: boolean;
  lastRoundResult: RoundResult | null;

  // 밴픽 & 배치 상태 (Phase 2)
  banPickPhase: BanPickPhase | null;
  pendingBanPickInfo: BanPickInfo | null;

  // 기존 액션 (레거시 모드)
  startGame: (playerCrew: string[], aiCrew: string[], difficulty: Difficulty) => void;
  selectCard: (cardId: string) => void;
  executeRound: () => RoundResult | null;
  updateRoundWinner: (winner: 'PLAYER' | 'AI' | 'DRAW') => void;
  endGame: () => { winner: 'PLAYER' | 'AI'; score: { player: number; ai: number } } | null;
  resetGame: () => void;

  // 밴픽 & 배치 액션 (Phase 2)
  initBanPick: (playerCrew: string[], aiCrew: string[], difficulty: Difficulty) => void;
  submitPlayerBan: (arenaId: string) => void;
  confirmBanResult: () => void;
  submitCardPlacements: (assignments: CardAssignment[]) => void;
  startGameWithPlacements: () => void;

  // UI 액션
  setAnimating: (value: boolean) => void;
  setShowResult: (value: boolean) => void;
  clearLastResult: () => void;
  setBanPickPhase: (phase: BanPickPhase | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  selectedCardId: null,
  isAnimating: false,
  showResult: false,
  lastRoundResult: null,
  banPickPhase: null,
  pendingBanPickInfo: null,

  // 밴픽 초기화 (Phase 2)
  initBanPick: (playerCrew: string[], aiCrew: string[], difficulty: Difficulty) => {
    // 세션 초기화 (아직 시작 안 함)
    const session: GameSession = {
      id: `game_${Date.now()}`,
      player: {
        crew: playerCrew,
        score: 0,
        usedCards: []
      },
      ai: {
        difficulty,
        crew: aiCrew,
        score: 0,
        usedCards: []
      },
      rounds: [],
      currentRound: 1,
      status: 'PREPARING',
      currentArena: null
    };

    set({
      session,
      selectedCardId: null,
      isAnimating: false,
      showResult: false,
      lastRoundResult: null,
      banPickPhase: 'PLAYER_BAN',
      pendingBanPickInfo: null
    });
  },

  // 플레이어 밴 제출 (Phase 2)
  submitPlayerBan: (arenaId: string) => {
    const { session } = get();
    if (!session) return;

    // 밴픽 프로세스 실행 (AI 밴 포함)
    const banPickInfo = executeBanPickProcess(
      arenaId,
      session.player.crew,
      session.ai.crew
    );

    set({
      banPickPhase: 'BAN_RESULT',
      pendingBanPickInfo: banPickInfo
    });
  },

  // 밴 결과 확인 후 카드 배치로 이동
  confirmBanResult: () => {
    set({ banPickPhase: 'CARD_PLACEMENT' });
  },

  // 카드 배치 제출
  submitCardPlacements: (assignments: CardAssignment[]) => {
    const { session, pendingBanPickInfo } = get();
    if (!session || !pendingBanPickInfo) return;

    // 세션에 밴픽 정보와 배치 정보 저장
    const updatedSession: GameSession = {
      ...session,
      banPickInfo: pendingBanPickInfo,
      cardAssignments: assignments,
      currentArena: pendingBanPickInfo.selectedArenas[0] // 첫 경기장
    };

    set({
      session: updatedSession,
      banPickPhase: 'READY'
    });
  },

  // 배치 완료 후 게임 시작
  startGameWithPlacements: () => {
    const { session } = get();
    if (!session || !session.cardAssignments || !session.banPickInfo) return;

    const updatedSession: GameSession = {
      ...session,
      status: 'IN_PROGRESS',
      currentArena: session.banPickInfo.selectedArenas[0]
    };

    set({
      session: updatedSession,
      banPickPhase: null
    });
  },

  setBanPickPhase: (phase: BanPickPhase | null) => {
    set({ banPickPhase: phase });
  },

  // 기존 레거시 startGame (밴픽 없이 바로 시작)
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

    // 라운드 실행 - 임시 결과 (점수는 아직 업데이트하지 않음)
    // TurnBattleModal에서 실제 전투 후 updateRoundWinner로 점수 업데이트
    const growthData = initializeGrowthData();
    const playerCard: PlayerCard = {
      cardId: selectedCardId,
      level: 1,
      exp: 0,
      totalExp: 0,
      equipment: [null, null],
      stats: { totalWins: 0, totalLosses: 0, vsRecord: {}, arenaRecord: {} },
      unlockedAchievements: [],
      bonusStats: growthData.bonusStats,
      condition: growthData.condition,
      currentForm: growthData.currentForm,
      recentResults: [],
      currentWinStreak: 0,
      maxWinStreak: 0
    };
    const roundResult = resolveRound(
      playerCard,
      aiCard,
      arena,
      session.currentRound
    );

    // 상태 업데이트 - 점수는 아직 반영하지 않음!
    // 사용한 카드만 기록하고 점수는 updateRoundWinner에서 업데이트
    const newPlayerUsedCards = [...session.player.usedCards, selectedCardId];
    const newAiUsedCards = [...session.ai.usedCards, aiCard.id];

    const newSession: GameSession = {
      ...session,
      player: {
        ...session.player,
        usedCards: newPlayerUsedCards
        // score는 아직 업데이트하지 않음
      },
      ai: {
        ...session.ai,
        usedCards: newAiUsedCards
        // score는 아직 업데이트하지 않음
      },
      rounds: [...session.rounds, roundResult],
      currentRound: session.currentRound + 1
      // status와 currentArena는 updateRoundWinner에서 업데이트
    };

    set({
      session: newSession,
      selectedCardId: null,
      lastRoundResult: roundResult,
      showResult: true
    });

    return roundResult;
  },

  // 실제 전투 결과로 점수 업데이트 (TurnBattleModal에서 호출)
  updateRoundWinner: (winner: 'PLAYER' | 'AI' | 'DRAW') => {
    const { session, lastRoundResult } = get();
    if (!session || !lastRoundResult) return;

    // 밴픽 모드인지 확인 (pre-assigned arenas 사용)
    const hasBanPickMode = session.banPickInfo && session.cardAssignments;

    // 점수 업데이트
    let newPlayerScore = session.player.score;
    let newAiScore = session.ai.score;

    if (winner === 'PLAYER') {
      newPlayerScore++;
    } else if (winner === 'AI') {
      newAiScore++;
    }

    // 게임 종료 조건 체크
    let newStatus: GameStatus = 'IN_PROGRESS';
    if (newPlayerScore >= WIN_SCORE) {
      newStatus = 'PLAYER_WIN';
    } else if (newAiScore >= WIN_SCORE) {
      newStatus = 'AI_WIN';
    } else if (session.currentRound > MAX_ROUNDS) {
      // 5라운드 이후 점수로 판정
      if (newPlayerScore > newAiScore) {
        newStatus = 'PLAYER_WIN';
      } else if (newAiScore > newPlayerScore) {
        newStatus = 'AI_WIN';
      } else {
        // 동점이면 플레이어 승리 (홈 어드밴티지)
        newStatus = 'PLAYER_WIN';
      }
    }

    // 다음 경기장 선택 (게임 진행 중인 경우)
    let nextArena = null;
    if (newStatus === 'IN_PROGRESS') {
      if (hasBanPickMode && session.banPickInfo) {
        // 밴픽 모드: 미리 정해진 경기장 순서 사용
        const nextRoundIndex = session.currentRound - 1; // 0-indexed (이미 currentRound가 1 증가된 상태)
        if (nextRoundIndex < session.banPickInfo.selectedArenas.length) {
          nextArena = session.banPickInfo.selectedArenas[nextRoundIndex];
        }
      } else {
        // 레거시 모드: 랜덤 경기장
        const usedArenaIds = session.rounds.map(r => r.arena.id);
        nextArena = getRandomArenaExcluding(usedArenaIds);
      }
    }

    // 라운드 결과에 실제 승자 반영
    const updatedRounds = session.rounds.map((r, idx) =>
      idx === session.rounds.length - 1
        ? { ...r, winner }
        : r
    );

    const newSession: GameSession = {
      ...session,
      player: {
        ...session.player,
        score: newPlayerScore
      },
      ai: {
        ...session.ai,
        score: newAiScore
      },
      rounds: updatedRounds,
      status: newStatus,
      currentArena: nextArena
    };

    set({ session: newSession });
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
      lastRoundResult: null,
      banPickPhase: null,
      pendingBanPickInfo: null
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

// 안정적인 참조를 위한 상수 (React 19 호환)
const EMPTY_ARRAY: string[] = [];
const EMPTY_SCORE = { player: 0, ai: 0 };

// 선택자 (Selector) 함수들
export const selectIsGameInProgress = (state: GameState) =>
  state.session?.status === 'IN_PROGRESS';

export const selectPlayerAvailableCards = (state: GameState) => {
  if (!state.session) return EMPTY_ARRAY;
  return state.session.player.crew.filter(
    id => !state.session!.player.usedCards.includes(id)
  );
};

export const selectAiAvailableCards = (state: GameState) => {
  if (!state.session) return EMPTY_ARRAY;
  return state.session.ai.crew.filter(
    id => !state.session!.ai.usedCards.includes(id)
  );
};

export const selectCurrentScore = (state: GameState) => {
  if (!state.session) return EMPTY_SCORE;
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

// 밴픽 관련 선택자 (Phase 2)
export const selectBanPickPhase = (state: GameState) =>
  state.banPickPhase;

export const selectPendingBanPickInfo = (state: GameState) =>
  state.pendingBanPickInfo;

export const selectBanPickInfo = (state: GameState) =>
  state.session?.banPickInfo ?? null;

export const selectCardAssignments = (state: GameState) =>
  state.session?.cardAssignments ?? null;

export const selectSelectedArenas = (state: GameState) =>
  state.session?.banPickInfo?.selectedArenas ?? state.pendingBanPickInfo?.selectedArenas ?? EMPTY_ARRAY;

// 현재 라운드에 배치된 플레이어 카드 ID 가져오기
export const selectAssignedCardForCurrentRound = (state: GameState) => {
  if (!state.session?.cardAssignments) return null;
  const currentRoundIndex = (state.session.currentRound ?? 1) - 1;
  return state.session.cardAssignments[currentRoundIndex]?.cardId ?? null;
};

// 시리즈 스코어보드 데이터
export const selectSeriesScoreboard = (state: GameState) => {
  if (!state.session) return null;
  return {
    playerScore: state.session.player.score,
    aiScore: state.session.ai.score,
    currentRound: state.session.currentRound,
    totalRounds: state.session.banPickInfo?.selectedArenas.length ?? MAX_ROUNDS,
    rounds: state.session.rounds,
    selectedArenas: state.session.banPickInfo?.selectedArenas ?? EMPTY_ARRAY,
    cardAssignments: state.session.cardAssignments ?? EMPTY_ARRAY
  };
};

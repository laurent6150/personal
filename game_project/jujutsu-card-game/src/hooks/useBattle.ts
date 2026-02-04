// ========================================
// 대전 진행 커스텀 훅
// ========================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSeasonStore } from '../stores/seasonStore';
import { useCardRecordStore } from '../stores/cardRecordStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { CREW_SIZE } from '../data/constants';
import type { Difficulty, CharacterCard, RoundResult, CardAssignment, Arena } from '../types';

// 안정적인 참조를 위한 상수 (React 19 호환)
const EMPTY_ARENA_ARRAY: Arena[] = [];
const EMPTY_ASSIGNMENT_ARRAY: CardAssignment[] = [];

export interface GameEndResult {
  won: boolean;
  expGained: Record<string, number>;
  levelUps: string[];
  newAchievements: string[];
}

export function useBattle() {
  // Game store (useShallow로 안정적인 참조 유지 - React 19 호환)
  const {
    session,
    selectedCardId,
    isAnimating,
    showResult,
    lastRoundResult,
    banPickPhase,
    pendingBanPickInfo,
    startGame,
    selectCard,
    executeRound,
    updateRoundWinner,
    endGame,
    resetGame,
    setAnimating,
    setShowResult,
    clearLastResult,
    // 밴픽 액션 (Phase 2)
    initBanPick,
    submitPlayerBan,
    confirmBanResult,
    submitCardPlacements,
    startGameWithPlacements,
    setBanPickPhase
  } = useGameStore(useShallow(state => ({
    session: state.session,
    selectedCardId: state.selectedCardId,
    isAnimating: state.isAnimating,
    showResult: state.showResult,
    lastRoundResult: state.lastRoundResult,
    banPickPhase: state.banPickPhase,
    pendingBanPickInfo: state.pendingBanPickInfo,
    startGame: state.startGame,
    selectCard: state.selectCard,
    executeRound: state.executeRound,
    updateRoundWinner: state.updateRoundWinner,
    endGame: state.endGame,
    resetGame: state.resetGame,
    setAnimating: state.setAnimating,
    setShowResult: state.setShowResult,
    clearLastResult: state.clearLastResult,
    initBanPick: state.initBanPick,
    submitPlayerBan: state.submitPlayerBan,
    confirmBanResult: state.confirmBanResult,
    submitCardPlacements: state.submitCardPlacements,
    startGameWithPlacements: state.startGameWithPlacements,
    setBanPickPhase: state.setBanPickPhase
  })));

  // 밴픽 관련 셀렉터 (안정적인 참조를 위해 상수 사용 - React 19 호환)
  const seriesScoreboard = useGameStore(useShallow(state => {
    if (!state.session) return null;
    return {
      playerScore: state.session.player.score,
      aiScore: state.session.ai.score,
      currentRound: state.session.currentRound,
      totalRounds: state.session.banPickInfo?.selectedArenas.length ?? 5,
      rounds: state.session.rounds,
      selectedArenas: state.session.banPickInfo?.selectedArenas ?? EMPTY_ARENA_ARRAY,
      cardAssignments: state.session.cardAssignments ?? EMPTY_ASSIGNMENT_ARRAY
    };
  }));
  const selectedArenas = useGameStore(state =>
    state.session?.banPickInfo?.selectedArenas ?? state.pendingBanPickInfo?.selectedArenas ?? EMPTY_ARENA_ARRAY
  );
  const assignedCardForCurrentRound = useGameStore(state => {
    if (!state.session?.cardAssignments) return null;
    const currentRoundIndex = (state.session.currentRound ?? 1) - 1;
    return state.session.cardAssignments[currentRoundIndex]?.cardId ?? null;
  });

  // Player store (useShallow로 안정적인 참조 유지)
  const { player, processGameResult } = usePlayerStore(useShallow(state => ({
    player: state.player,
    processGameResult: state.processGameResult
  })));

  // Season store (플레이어 크루 가져오기)
  const { playerCrew, currentSeason } = useSeasonStore(useShallow(state => ({
    playerCrew: state.playerCrew,
    currentSeason: state.currentSeason
  })));

  // Card record store (개인 기록)
  const recordBattle = useCardRecordStore(state => state.recordBattle);

  // Game end result
  const [gameEndResult, setGameEndResult] = useState<GameEndResult | null>(null);

  // 게임 상태
  const isGameActive = session?.status === 'IN_PROGRESS';
  const isGameOver = session?.status === 'PLAYER_WIN' || session?.status === 'AI_WIN';
  const isPlayerWin = session?.status === 'PLAYER_WIN';

  // 게임 종료 시 자동으로 gameEndResult 설정 (안전망)
  useEffect(() => {
    if (isGameOver && session && !gameEndResult) {
      const won = session.status === 'PLAYER_WIN';
      const expResult = processGameResult(
        won,
        session.rounds,
        session.ai.difficulty
      );

      setGameEndResult({
        won,
        expGained: expResult.expGained,
        levelUps: expResult.levelUps,
        newAchievements: expResult.newAchievements
      });
    }
  }, [isGameOver, session, gameEndResult, processGameResult]);

  // 현재 점수
  const currentScore = useMemo(() => ({
    player: session?.player.score ?? 0,
    ai: session?.ai.score ?? 0
  }), [session]);

  // 현재 라운드
  const currentRound = session?.currentRound ?? 0;

  // 현재 경기장
  const currentArena = session?.currentArena ?? null;

  // 플레이어 사용 가능 카드
  const playerAvailableCards = useMemo(() => {
    if (!session) return [];
    return session.player.crew
      .filter(id => !session.player.usedCards.includes(id))
      .map(id => CHARACTERS_BY_ID[id])
      .filter(Boolean) as CharacterCard[];
  }, [session]);

  // AI 남은 카드 수
  const aiRemainingCardCount = useMemo(() => {
    if (!session) return 0;
    return session.ai.crew.length - session.ai.usedCards.length;
  }, [session]);

  // ========================================
  // 밴픽 플로우 핸들러 (Phase 2)
  // ========================================

  // 밴픽 모드로 게임 시작 (customPlayerCrew: 개인 리그 1v1용)
  const handleStartGameWithBanPick = useCallback((aiCrew: string[], difficulty: Difficulty, customPlayerCrew?: string[]) => {
    // 커스텀 플레이어 크루가 있으면 사용 (개인 리그 1v1)
    const crew = customPlayerCrew || (playerCrew.length === CREW_SIZE ? playerCrew : player.currentCrew);
    if (crew.length !== CREW_SIZE || aiCrew.length !== CREW_SIZE) {
      console.error('크루 사이즈가 맞지 않습니다. player:', crew.length, 'ai:', aiCrew.length);
      return false;
    }
    initBanPick(crew, aiCrew, difficulty);
    return true;
  }, [playerCrew, player.currentCrew, initBanPick]);

  // 플레이어 밴 제출
  const handleSubmitBan = useCallback((arenaId: string) => {
    submitPlayerBan(arenaId);
  }, [submitPlayerBan]);

  // 밴 결과 확인
  const handleConfirmBanResult = useCallback(() => {
    confirmBanResult();
  }, [confirmBanResult]);

  // 카드 배치 제출
  const handleSubmitPlacements = useCallback((assignments: CardAssignment[]) => {
    submitCardPlacements(assignments);
  }, [submitCardPlacements]);

  // 배치 완료 후 게임 시작
  const handleStartAfterPlacements = useCallback(() => {
    startGameWithPlacements();
  }, [startGameWithPlacements]);

  // ========================================
  // 기존 레거시 핸들러
  // ========================================

  // 게임 시작 (시즌에서 배정된 AI 크루 사용) - 레거시 모드 (밴픽 없이)
  const handleStartGame = useCallback((aiCrew: string[], difficulty: Difficulty) => {
    // seasonStore의 playerCrew 사용 (첫 시즌 시작 시 선택한 크루)
    const crew = playerCrew.length === CREW_SIZE ? playerCrew : player.currentCrew;
    if (crew.length !== CREW_SIZE) {
      console.error(`크루가 ${CREW_SIZE}장이 아닙니다: ${crew.length}장`);
      return false;
    }
    if (aiCrew.length !== CREW_SIZE) {
      console.error(`AI 크루가 ${CREW_SIZE}장이 아닙니다: ${aiCrew.length}장`);
      return false;
    }
    startGame(crew, aiCrew, difficulty);
    return true;
  }, [playerCrew, player.currentCrew, startGame]);

  // 카드 선택
  const handleSelectCard = useCallback((cardId: string) => {
    if (isAnimating) return;
    selectCard(cardId);
  }, [isAnimating, selectCard]);

  // 라운드 실행
  const handleExecuteRound = useCallback(async (): Promise<RoundResult | null> => {
    if (!selectedCardId || isAnimating) return null;

    setAnimating(true);

    // 애니메이션 딜레이 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = executeRound();

    // 카드 개인 기록 저장 (승패가 있을 때만)
    if (result && result.winner !== 'DRAW' && currentSeason) {
      const isPlayerWinner = result.winner === 'PLAYER';
      const winnerCardId = isPlayerWinner ? result.playerCardId : result.aiCardId;
      const loserCardId = isPlayerWinner ? result.aiCardId : result.playerCardId;

      // 확장 통계 데이터 추출
      const { playerDamage, aiDamage, skillActivated } = result.calculation;
      const winnerDamage = isPlayerWinner ? playerDamage : aiDamage;
      const loserDamage = isPlayerWinner ? aiDamage : playerDamage;
      const winnerSkillActivated = isPlayerWinner ? skillActivated.player : skillActivated.ai;
      const loserSkillActivated = isPlayerWinner ? skillActivated.ai : skillActivated.player;

      recordBattle({
        seasonNumber: currentSeason.number,
        winnerCardId,
        loserCardId,
        arenaId: result.arena.id,
        winnerDamage,
        loserDamage,
        winnerSkillActivated,
        loserSkillActivated
      });
    }

    // 결과 표시 후 애니메이션 종료
    await new Promise(resolve => setTimeout(resolve, 1500));

    setAnimating(false);

    return result;
  }, [selectedCardId, isAnimating, setAnimating, executeRound, currentSeason, recordBattle]);

  // 결과 확인 후 다음 진행
  const handleContinue = useCallback(() => {
    clearLastResult();

    // 게임 종료 체크
    if (isGameOver && session) {
      const won = session.status === 'PLAYER_WIN';
      const result = processGameResult(
        won,
        session.rounds,
        session.ai.difficulty
      );

      setGameEndResult({
        won,
        expGained: result.expGained,
        levelUps: result.levelUps,
        newAchievements: result.newAchievements
      });
    }
  }, [clearLastResult, isGameOver, session, processGameResult]);

  // 게임 종료 및 결과 처리
  const handleEndGame = useCallback(() => {
    if (!session) return null;

    const result = endGame();

    if (result) {
      // 게임 결과를 플레이어 데이터에 반영
      const expResult = processGameResult(
        result.winner === 'PLAYER',
        session.rounds,
        session.ai.difficulty
      );

      // gameEndResult 설정 (카드별 경험치 표시용)
      setGameEndResult({
        won: result.winner === 'PLAYER',
        expGained: expResult.expGained,
        levelUps: expResult.levelUps,
        newAchievements: expResult.newAchievements
      });
    }

    return result;
  }, [session, endGame, processGameResult]);

  // 재대전 (같은 AI 크루와 재대전)
  const handleRematch = useCallback((difficulty?: Difficulty) => {
    const diff = difficulty ?? session?.ai.difficulty ?? 'NORMAL';
    const aiCrew = session?.ai.crew ?? [];
    setGameEndResult(null);
    resetGame();
    if (aiCrew.length === 5) {
      handleStartGame(aiCrew, diff);
    }
  }, [session?.ai.difficulty, session?.ai.crew, resetGame, handleStartGame]);

  // 메인 메뉴로
  const handleReturnToMenu = useCallback(() => {
    setGameEndResult(null);
    resetGame();
  }, [resetGame]);

  // 라운드 결과 정보 가공
  const roundResultInfo = useMemo(() => {
    if (!lastRoundResult) return null;

    const playerCard = CHARACTERS_BY_ID[lastRoundResult.playerCardId];
    const aiCard = CHARACTERS_BY_ID[lastRoundResult.aiCardId];

    return {
      ...lastRoundResult,
      playerCard,
      aiCard,
      isPlayerWinner: lastRoundResult.winner === 'PLAYER',
      isAIWinner: lastRoundResult.winner === 'AI',
      isDraw: lastRoundResult.winner === 'DRAW'
    };
  }, [lastRoundResult]);

  // 선택된 카드 정보
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return CHARACTERS_BY_ID[selectedCardId] ?? null;
  }, [selectedCardId]);

  return {
    // 상태
    session,
    isGameActive,
    isGameOver,
    isPlayerWin,
    currentScore,
    currentRound,
    currentArena,
    playerAvailableCards,
    aiRemainingCardCount,
    selectedCardId,
    selectedCard,
    isAnimating,
    showResult,
    lastRoundResult,
    roundResultInfo,
    gameEndResult,

    // 밴픽 상태 (Phase 2)
    banPickPhase,
    pendingBanPickInfo,
    seriesScoreboard,
    selectedArenas,
    assignedCardForCurrentRound,

    // 기존 액션 (레거시 모드)
    startGame: handleStartGame,
    selectCard: handleSelectCard,
    executeRound: handleExecuteRound,
    updateRoundWinner,
    continueGame: handleContinue,
    endGame: handleEndGame,
    rematch: handleRematch,
    returnToMenu: handleReturnToMenu,
    setShowResult,

    // 밴픽 액션 (Phase 2)
    startGameWithBanPick: handleStartGameWithBanPick,
    submitBan: handleSubmitBan,
    confirmBanResult: handleConfirmBanResult,
    submitPlacements: handleSubmitPlacements,
    startAfterPlacements: handleStartAfterPlacements,
    setBanPickPhase
  };
}

// 크루 관리 훅
export function useCrewManagement() {
  const {
    player,
    setCurrentCrew,
    addCardToCrew,
    removeCardFromCrew,
    swapCrewCard,
    canAddToCrew,
    isCardInCrew
  } = usePlayerStore(useShallow(state => ({
    player: state.player,
    setCurrentCrew: state.setCurrentCrew,
    addCardToCrew: state.addCardToCrew,
    removeCardFromCrew: state.removeCardFromCrew,
    swapCrewCard: state.swapCrewCard,
    canAddToCrew: state.canAddToCrew,
    isCardInCrew: state.isCardInCrew
  })));

  // 현재 크루 카드 정보
  const crewCards = useMemo(() => {
    return player.currentCrew
      .map(id => ({
        character: CHARACTERS_BY_ID[id],
        playerCard: player.ownedCards[id]
      }))
      .filter(item => item.character && item.playerCard);
  }, [player.currentCrew, player.ownedCards]);

  // 소유한 모든 카드 (크루 제외)
  const availableCards = useMemo(() => {
    return Object.values(player.ownedCards)
      .filter(pc => !player.currentCrew.includes(pc.cardId))
      .map(pc => ({
        character: CHARACTERS_BY_ID[pc.cardId],
        playerCard: pc,
        canAdd: canAddToCrew(pc.cardId)
      }))
      .filter(item => item.character);
  }, [player.ownedCards, player.currentCrew, canAddToCrew]);

  // 등급별 카드 수
  const gradeCount = useMemo(() => {
    const counts: Record<string, number> = { '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0 };
    for (const cardId of player.currentCrew) {
      const char = CHARACTERS_BY_ID[cardId];
      if (char) counts[char.grade]++;
    }
    return counts;
  }, [player.currentCrew]);

  return {
    crewCards,
    availableCards,
    gradeCount,
    crewSize: player.currentCrew.length,
    maxCrewSize: CREW_SIZE,
    setCurrentCrew,
    addCardToCrew,
    removeCardFromCrew,
    swapCrewCard,
    canAddToCrew,
    isCardInCrew
  };
}

// 플레이어 통계 훅
export function usePlayerStats() {
  const player = usePlayerStore(state => state.player);

  const totalStats = player.totalStats;

  const winRate = useMemo(() => {
    const total = totalStats.totalWins + totalStats.totalLosses;
    if (total === 0) return 0;
    return Math.round((totalStats.totalWins / total) * 100);
  }, [totalStats]);

  return {
    totalWins: totalStats.totalWins,
    totalLosses: totalStats.totalLosses,
    winStreak: totalStats.winStreak,
    maxWinStreak: totalStats.maxWinStreak,
    winRate
  };
}

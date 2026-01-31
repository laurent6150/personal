// ========================================
// 대전 진행 커스텀 훅
// ========================================

import { useCallback, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import type { Difficulty, CharacterCard, RoundResult } from '../types';

export function useBattle() {
  // Game store
  const {
    session,
    selectedCardId,
    isAnimating,
    showResult,
    lastRoundResult,
    startGame,
    selectCard,
    executeRound,
    endGame,
    resetGame,
    setAnimating,
    setShowResult,
    clearLastResult
  } = useGameStore();

  // Player store
  const {
    player,
    processGameResult
  } = usePlayerStore();

  // 게임 상태
  const isGameActive = session?.status === 'IN_PROGRESS';
  const isGameOver = session?.status === 'PLAYER_WIN' || session?.status === 'AI_WIN';
  const isPlayerWin = session?.status === 'PLAYER_WIN';

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

  // 게임 시작
  const handleStartGame = useCallback((difficulty: Difficulty) => {
    const crew = player.currentCrew;
    if (crew.length !== 5) {
      console.error('크루가 5장이 아닙니다');
      return false;
    }
    startGame(crew, difficulty);
    return true;
  }, [player.currentCrew, startGame]);

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

    // 결과 표시 후 애니메이션 종료
    await new Promise(resolve => setTimeout(resolve, 1500));

    setAnimating(false);

    return result;
  }, [selectedCardId, isAnimating, setAnimating, executeRound]);

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
      console.log('게임 결과 처리:', result);
    }
  }, [clearLastResult, isGameOver, session, processGameResult]);

  // 게임 종료 및 결과 처리
  const handleEndGame = useCallback(() => {
    if (!session) return null;

    const result = endGame();

    if (result) {
      // 게임 결과를 플레이어 데이터에 반영
      processGameResult(
        result.winner === 'PLAYER',
        session.rounds,
        session.ai.difficulty
      );
    }

    return result;
  }, [session, endGame, processGameResult]);

  // 재대전
  const handleRematch = useCallback((difficulty?: Difficulty) => {
    const diff = difficulty ?? session?.ai.difficulty ?? 'NORMAL';
    resetGame();
    handleStartGame(diff);
  }, [session?.ai.difficulty, resetGame, handleStartGame]);

  // 메인 메뉴로
  const handleReturnToMenu = useCallback(() => {
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

    // 액션
    startGame: handleStartGame,
    selectCard: handleSelectCard,
    executeRound: handleExecuteRound,
    continueGame: handleContinue,
    endGame: handleEndGame,
    rematch: handleRematch,
    returnToMenu: handleReturnToMenu,
    setShowResult
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
  } = usePlayerStore();

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
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
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
    maxCrewSize: 5,
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
  const { player } = usePlayerStore();

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

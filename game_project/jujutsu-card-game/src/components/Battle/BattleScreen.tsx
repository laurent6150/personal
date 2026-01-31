// ========================================
// 대전 화면 - MVP v2 개선
// ========================================

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattle } from '../../hooks/useBattle';
import { CardDisplay } from '../Card/CardDisplay';
import { CardSelector } from '../Card/CardSelector';
import { CardDetailPanel } from '../Card/CardDetailPanel';
import { ArenaDisplay } from './ArenaDisplay';
import { BattleNarration } from './BattleNarration';
import { Button } from '../UI/Button';
import { ExitConfirmModal } from '../UI/ExitConfirmModal';
import { WIN_SCORE } from '../../data/constants';
import { CHARACTERS_BY_ID } from '../../data';

interface BattleEndResult {
  won: boolean;
  levelUps?: string[];
  newAchievements?: string[];
  expGained?: Record<string, number>;
}

interface BattleScreenProps {
  onReturnToMenu: () => void;
  onBattleEnd?: (result: BattleEndResult) => void;
  opponentName?: string;
}

export function BattleScreen({ onReturnToMenu, onBattleEnd, opponentName }: BattleScreenProps) {
  const {
    session,
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
    roundResultInfo,
    gameEndResult,
    selectCard,
    executeRound,
    continueGame,
    returnToMenu
  } = useBattle();

  const hasCalledBattleEnd = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNarration, setShowNarration] = useState(false);
  const [pendingResult, setPendingResult] = useState<typeof roundResultInfo>(null);

  const selectedCardData = selectedCardId ? CHARACTERS_BY_ID[selectedCardId] : null;

  // 게임 종료 콜백
  useEffect(() => {
    if (gameEndResult && onBattleEnd && !hasCalledBattleEnd.current) {
      hasCalledBattleEnd.current = true;
      onBattleEnd({
        won: gameEndResult.won,
        levelUps: gameEndResult.levelUps,
        newAchievements: gameEndResult.newAchievements,
        expGained: gameEndResult.expGained
      });
    }
  }, [gameEndResult, onBattleEnd]);

  useEffect(() => {
    if (!isGameOver) {
      hasCalledBattleEnd.current = false;
    }
  }, [isGameOver]);

  // 라운드 결과가 나오면 나레이션 표시
  useEffect(() => {
    if (roundResultInfo && !showNarration && !pendingResult) {
      setPendingResult(roundResultInfo);
      setShowNarration(true);
    }
  }, [roundResultInfo, showNarration, pendingResult]);

  const handleExit = () => {
    setShowExitModal(false);
    if (onBattleEnd) {
      onBattleEnd({ won: false });
    }
    returnToMenu();
    onReturnToMenu();
  };

  const handleReturnToMenuClick = () => {
    returnToMenu();
    onReturnToMenu();
  };

  const handleNarrationComplete = () => {
    setShowNarration(false);
    setPendingResult(null);
    continueGame();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-text-secondary mb-4">세션이 없습니다</div>
          <Button onClick={onReturnToMenu} variant="primary">
            메인 메뉴로
          </Button>
        </div>
      </div>
    );
  }

  // 게임 종료 화면
  if (isGameOver) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="bg-bg-secondary rounded-xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`text-6xl mb-4 ${isPlayerWin ? 'text-win' : 'text-lose'}`}
          >
            {isPlayerWin ? '🎉' : '😢'}
          </motion.div>

          <h1 className={`text-3xl font-bold mb-2 ${isPlayerWin ? 'text-win' : 'text-lose'}`}>
            {isPlayerWin ? '승리!' : '패배'}
          </h1>

          <p className="text-text-secondary mb-4">
            최종 스코어: {currentScore.player} - {currentScore.ai}
          </p>

          {gameEndResult?.expGained && Object.keys(gameEndResult.expGained).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/30 rounded-lg p-4 mb-4 text-left"
            >
              <h3 className="text-sm text-text-secondary mb-2">획득 경험치</h3>
              <div className="space-y-1">
                {Object.entries(gameEndResult.expGained).map(([cardId, exp]) => (
                  <div key={cardId} className="flex justify-between text-sm">
                    <span className="truncate">{CHARACTERS_BY_ID[cardId]?.name.ko || cardId}</span>
                    <span className="text-win">+{exp} EXP</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {gameEndResult?.levelUps && gameEndResult.levelUps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-accent/20 border border-accent/50 rounded-lg p-3 mb-4"
            >
              <div className="text-accent font-bold">레벨 업!</div>
              <div className="text-sm text-text-secondary">
                {gameEndResult.levelUps.length}장의 카드가 레벨 업했습니다
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            <Button onClick={handleReturnToMenuClick} variant="primary" className="w-full">
              시즌 허브로
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 모달들 */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />

      <AnimatePresence>
        {showNarration && pendingResult && (
          <BattleNarration
            playerCard={CHARACTERS_BY_ID[pendingResult.playerCardId]!}
            aiCard={CHARACTERS_BY_ID[pendingResult.aiCardId]!}
            result={pendingResult}
            onComplete={handleNarrationComplete}
          />
        )}
      </AnimatePresence>

      {/* 나가기 버튼 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setShowExitModal(true)}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-bg-card/80 backdrop-blur-sm rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/30 transition-all"
      >
        <span>←</span>
        <span className="text-sm">나가기</span>
      </motion.button>

      {/* 스코어 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto px-4 pt-4"
      >
        <div className="flex items-center justify-between bg-bg-card rounded-xl p-4 border border-white/10">
          <div className="text-center flex-1">
            <div className="text-sm text-text-secondary">당신</div>
            <div className="text-4xl font-bold text-win">{currentScore.player}</div>
          </div>

          <div className="text-center px-6">
            <div className="text-sm text-text-secondary">라운드</div>
            <div className="text-2xl font-bold text-accent">{currentRound} / 5</div>
            <div className="text-xs text-text-secondary">{WIN_SCORE}점 선승</div>
          </div>

          <div className="text-center flex-1">
            <div className="text-sm text-text-secondary">{opponentName || 'AI'}</div>
            <div className="text-4xl font-bold text-lose">{currentScore.ai}</div>
          </div>
        </div>
      </motion.div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* 경기장 */}
        {currentArena && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl mb-4"
          >
            <ArenaDisplay arena={currentArena} size="md" />
          </motion.div>
        )}

        {/* 대결 영역 */}
        <div className="w-full max-w-4xl mb-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* 플레이어 카드 */}
            <div className="text-center">
              <div className="text-sm text-text-secondary mb-2">당신의 카드</div>
              {selectedCard ? (
                <motion.div
                  key={selectedCard.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <CardDisplay character={selectedCard} size="md" isSelected />
                </motion.div>
              ) : (
                <div className="w-36 md:w-44 h-52 md:h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-text-secondary text-sm text-center px-2">
                    아래에서<br />카드 선택
                  </span>
                </div>
              )}
            </div>

            {/* VS + 대결 버튼 */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl md:text-5xl font-bold text-accent">VS</div>
              <Button
                onClick={() => executeRound()}
                disabled={!selectedCardId || isAnimating}
                size="lg"
                isLoading={isAnimating}
                className="px-8"
              >
                {isAnimating ? '대결 중...' : '⚔️ 대결!'}
              </Button>
            </div>

            {/* AI 카드 */}
            <div className="text-center">
              <div className="text-sm text-text-secondary mb-2">
                상대 (남은: {aiRemainingCardCount})
              </div>
              <div className="w-36 md:w-44 h-52 md:h-60 rounded-xl bg-bg-card border-2 border-white/20 flex items-center justify-center">
                <span className="text-5xl">🎴</span>
              </div>
            </div>
          </div>
        </div>

        {/* 카드 선택 영역 */}
        <div className="w-full max-w-5xl">
          <CardSelector
            cards={playerAvailableCards}
            selectedCardId={selectedCardId}
            usedCardIds={session.player.usedCards}
            onSelect={selectCard}
            disabled={isAnimating}
          />
        </div>

        {/* 카드 상세 정보 (하단 가로 배치) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl mt-4"
        >
          {selectedCardData ? (
            <CardDetailPanel card={selectedCardData} arena={currentArena} />
          ) : (
            <div className="bg-bg-card/30 rounded-xl border border-dashed border-white/10 p-4 text-center">
              <span className="text-text-secondary text-sm">
                👆 카드를 선택하면 상세 정보가 표시됩니다
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

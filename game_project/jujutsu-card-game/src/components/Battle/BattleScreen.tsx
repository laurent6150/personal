import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useBattle } from '../../hooks/useBattle';
import { CardDisplay } from '../Card/CardDisplay';
import { CardSelector } from '../Card/CardSelector';
import { CardDetailPanel } from '../Card/CardDetailPanel';
import { ArenaDisplay } from './ArenaDisplay';
import { RoundResult } from './RoundResult';
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
  onBattleEnd?: (result: BattleEndResult) => void;
}

export function BattleScreen({ onBattleEnd }: BattleScreenProps) {
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
    showResult,
    roundResultInfo,
    gameEndResult,
    selectCard,
    executeRound,
    continueGame,
    rematch,
    returnToMenu
  } = useBattle();

  // Track if we've already called onBattleEnd for this game
  const hasCalledBattleEnd = useRef(false);

  // 나가기 모달 상태
  const [showExitModal, setShowExitModal] = useState(false);

  // 선택된 카드의 상세 정보
  const selectedCardData = selectedCardId ? CHARACTERS_BY_ID[selectedCardId] : null;

  // Call onBattleEnd when game ends
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

  // Reset the ref when starting a new game
  useEffect(() => {
    if (!isGameOver) {
      hasCalledBattleEnd.current = false;
    }
  }, [isGameOver]);

  if (!session) {
    return null;
  }

  // 게임 종료 화면
  if (isGameOver) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="bg-bg-secondary rounded-xl p-8 max-w-md w-full text-center border border-white/10">
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

          {/* 경험치 획득 정보 */}
          {gameEndResult && gameEndResult.expGained && Object.keys(gameEndResult.expGained).length > 0 && (
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
                    <span className="truncate">{cardId.replace(/_/g, ' ')}</span>
                    <span className="text-win">+{exp} EXP</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 레벨업 알림 */}
          {gameEndResult && gameEndResult.levelUps && gameEndResult.levelUps.length > 0 && (
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
            <Button onClick={() => rematch()} variant="primary" className="w-full">
              재대전
            </Button>
            <Button onClick={returnToMenu} variant="secondary" className="w-full">
              메인 메뉴로
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 나가기 처리
  const handleExit = () => {
    setShowExitModal(false);
    // 패배로 처리하고 메뉴로 돌아감
    if (onBattleEnd) {
      onBattleEnd({ won: false });
    }
    returnToMenu();
  };

  return (
    <div className="min-h-screen p-4 relative">
      {/* 나가기 확인 모달 */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />

      {/* 라운드 결과 모달 */}
      {showResult && roundResultInfo && (
        <RoundResult
          result={roundResultInfo}
          playerCard={roundResultInfo.playerCard!}
          aiCard={roundResultInfo.aiCard!}
          onContinue={continueGame}
        />
      )}

      {/* 나가기 버튼 (좌상단) */}
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
        className="max-w-2xl mx-auto mb-4"
      >
        <div className="flex items-center justify-between bg-bg-card rounded-xl p-4 border border-white/10">
          <div className="text-center">
            <div className="text-sm text-text-secondary">당신</div>
            <div className="text-3xl font-bold text-win">{currentScore.player}</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-text-secondary">라운드</div>
            <div className="text-2xl font-bold text-accent">{currentRound} / 5</div>
            <div className="text-xs text-text-secondary">{WIN_SCORE}점 선승</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-text-secondary">AI</div>
            <div className="text-3xl font-bold text-lose">{currentScore.ai}</div>
          </div>
        </div>
      </motion.div>

      {/* 경기장 */}
      {currentArena && (
        <div className="max-w-2xl mx-auto mb-4">
          <ArenaDisplay arena={currentArena} size="md" />
        </div>
      )}

      {/* 대결 영역 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-8">
          {/* 선택된 카드 */}
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-2">당신의 카드</div>
            {selectedCard ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <CardDisplay
                  character={selectedCard}
                  size="md"
                  isSelected
                />
              </motion.div>
            ) : (
              <div className="w-44 h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <span className="text-text-secondary">카드를 선택하세요</span>
              </div>
            )}
          </div>

          {/* VS */}
          <div className="text-4xl font-bold text-accent">VS</div>

          {/* AI 카드 (뒷면) */}
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-2">
              AI 카드 (남은 카드: {aiRemainingCardCount})
            </div>
            <div className="w-44 h-60 rounded-xl bg-bg-card border-2 border-white/20 flex items-center justify-center">
              <span className="text-4xl">🎴</span>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 선택 + 상세 정보 패널 */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 카드 선택 영역 */}
          <div className="flex-1">
            <CardSelector
              cards={playerAvailableCards}
              selectedCardId={selectedCardId}
              usedCardIds={session.player.usedCards}
              onSelect={selectCard}
              disabled={isAnimating}
            />
          </div>

          {/* 카드 상세 정보 패널 */}
          <div className="lg:w-80">
            {selectedCardData ? (
              <CardDetailPanel
                card={selectedCardData}
                arena={currentArena}
              />
            ) : (
              <div className="bg-bg-card/50 rounded-xl border border-dashed border-white/20 p-6 text-center h-full flex items-center justify-center">
                <div className="text-text-secondary">
                  <div className="text-3xl mb-2">👆</div>
                  <p className="text-sm">카드를 선택하면<br />상세 정보가 표시됩니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 대결 버튼 */}
      <div className="text-center">
        <Button
          onClick={() => executeRound()}
          disabled={!selectedCardId || isAnimating}
          size="lg"
          isLoading={isAnimating}
        >
          {isAnimating ? '대결 중...' : '대결!'}
        </Button>
      </div>
    </div>
  );
}

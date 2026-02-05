// ========================================
// 개인 리그 1:1 배틀 화면
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { Button } from '../UI/Button';
import type { BattleTurn } from '../../types/individualLeague';

interface IndividualBattleScreenProps {
  onBattleEnd?: () => void;
}

export function IndividualBattleScreen({ onBattleEnd }: IndividualBattleScreenProps) {
  const {
    currentBattleState,
    executeTurn,
    finishBattle,
    resetBattle,
    getBattleStats,
  } = useIndividualLeagueStore(useShallow(state => ({
    currentBattleState: state.currentBattleState,
    executeTurn: state.executeTurn,
    finishBattle: state.finishBattle,
    resetBattle: state.resetBattle,
    getBattleStats: state.getBattleStats,
  })));

  const [lastTurn, setLastTurn] = useState<BattleTurn | null>(null);
  const [showTurnResult, setShowTurnResult] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const battleStats = getBattleStats();

  // 턴 실행
  const handleExecuteTurn = useCallback(() => {
    const turn = executeTurn();
    if (turn) {
      setLastTurn(turn);
      setShowTurnResult(true);
      setTimeout(() => setShowTurnResult(false), 800);
    }
  }, [executeTurn]);

  // 자동 모드
  useEffect(() => {
    if (!isAutoMode || !currentBattleState.isActive) return;
    if (currentBattleState.phase === 'MATCH_END') {
      setIsAutoMode(false);
      return;
    }

    const timer = setTimeout(() => {
      handleExecuteTurn();
    }, 600);

    return () => clearTimeout(timer);
  }, [isAutoMode, currentBattleState, handleExecuteTurn]);

  // 경기 종료 처리
  const handleFinishBattle = useCallback(() => {
    finishBattle();
    if (onBattleEnd) {
      onBattleEnd();
    }
  }, [finishBattle, onBattleEnd]);

  // 취소
  const handleCancel = useCallback(() => {
    resetBattle();
    if (onBattleEnd) {
      onBattleEnd();
    }
  }, [resetBattle, onBattleEnd]);

  if (!currentBattleState.isActive || !battleStats.playerCard || !battleStats.opponentCard) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">배틀 정보를 불러오는 중...</div>
      </div>
    );
  }

  const { playerCard, opponentCard, arena } = battleStats;

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-2xl mx-auto">
        {/* 경기장 정보 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30 p-4 mb-4 text-center"
        >
          <div className="text-lg font-bold text-purple-300">{arena?.name}</div>
          <div className="text-sm text-text-secondary mt-1">{arena?.description}</div>
        </motion.div>

        {/* 세트 스코어 */}
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4 mb-4">
          <div className="text-center text-sm text-text-secondary mb-2">세트 스코어</div>
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{currentBattleState.playerSetWins}</div>
              <div className="text-xs text-text-secondary">내 카드</div>
            </div>
            <div className="text-2xl text-text-secondary">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{currentBattleState.opponentSetWins}</div>
              <div className="text-xs text-text-secondary">상대</div>
            </div>
          </div>
          <div className="text-center text-xs text-text-secondary mt-2">
            세트 {currentBattleState.currentSet} / 5판 3선승
          </div>
        </div>

        {/* 대전 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 플레이어 카드 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-bg-secondary rounded-xl border p-4 ${
              lastTurn?.winner === 'player' && showTurnResult
                ? 'border-green-500 bg-green-500/10'
                : 'border-accent/30'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">
                {playerCard.name.charAt(0)}
              </div>
              <div className="text-sm font-bold text-text-primary">{playerCard.name}</div>
              <div className="text-xs text-text-secondary">{playerCard.attribute}</div>
              <div className="mt-2 text-lg font-bold text-accent">
                {playerCard.basePower}
                {playerCard.arenaBonusPercent !== 0 && (
                  <span className={playerCard.arenaBonusPercent > 0 ? 'text-green-400' : 'text-red-400'}>
                    {' '}({playerCard.arenaBonusPercent > 0 ? '+' : ''}{playerCard.arenaBonusPercent}%)
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* 상대 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-bg-secondary rounded-xl border p-4 ${
              lastTurn?.winner === 'opponent' && showTurnResult
                ? 'border-red-500 bg-red-500/10'
                : 'border-red-500/30'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">
                {opponentCard.name.charAt(0)}
              </div>
              <div className="text-sm font-bold text-text-primary">{opponentCard.name}</div>
              <div className="text-xs text-text-secondary">{opponentCard.attribute}</div>
              <div className="mt-2 text-lg font-bold text-red-400">
                {opponentCard.basePower}
                {opponentCard.arenaBonusPercent !== 0 && (
                  <span className={opponentCard.arenaBonusPercent > 0 ? 'text-green-400' : 'text-red-400'}>
                    {' '}({opponentCard.arenaBonusPercent > 0 ? '+' : ''}{opponentCard.arenaBonusPercent}%)
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 현재 세트 턴 현황 */}
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4 mb-4">
          <div className="text-sm font-bold text-text-primary mb-2">
            세트 {currentBattleState.currentSet} 진행 상황 (3판 2선승)
          </div>
          <div className="flex justify-center gap-2">
            {currentBattleState.currentSetTurns.map((turn, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  turn.winner === 'player'
                    ? 'bg-accent text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {turn.winner === 'player' ? 'W' : 'L'}
              </div>
            ))}
            {Array.from({ length: 3 - currentBattleState.currentSetTurns.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-8 h-8 rounded-full bg-bg-primary border border-white/20"
              />
            ))}
          </div>

          {/* 마지막 턴 결과 */}
          <AnimatePresence>
            {lastTurn && showTurnResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-4 text-center"
              >
                <div className="text-sm text-text-secondary">
                  {lastTurn.playerPower} vs {lastTurn.opponentPower}
                </div>
                <div className={`text-lg font-bold ${
                  lastTurn.winner === 'player' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastTurn.winner === 'player' ? '승리!' : '패배'}
                  {lastTurn.criticalHit && ' (크리티컬!)'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 완료된 세트 기록 */}
        {currentBattleState.sets.length > 0 && (
          <div className="bg-bg-secondary rounded-xl border border-white/10 p-4 mb-4">
            <div className="text-sm font-bold text-text-primary mb-2">세트 기록</div>
            <div className="space-y-1">
              {currentBattleState.sets.map((set, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center text-sm px-2 py-1 rounded ${
                    set.winner === 'player' ? 'bg-accent/20' : 'bg-red-500/20'
                  }`}
                >
                  <span>세트 {set.setNumber}</span>
                  <span className={set.winner === 'player' ? 'text-accent' : 'text-red-400'}>
                    {set.playerWins} - {set.opponentWins} {set.winner === 'player' ? '(승)' : '(패)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-wrap justify-center gap-3">
          {currentBattleState.phase !== 'MATCH_END' ? (
            <>
              <Button
                variant="primary"
                onClick={handleExecuteTurn}
                disabled={isAutoMode}
              >
                ⚔️ 턴 진행
              </Button>
              <Button
                variant={isAutoMode ? 'danger' : 'secondary'}
                onClick={() => setIsAutoMode(!isAutoMode)}
              >
                {isAutoMode ? '⏹️ 중지' : '⏩ 자동 진행'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancel}
              >
                ❌ 취소
              </Button>
            </>
          ) : (
            <>
              <div className="w-full text-center mb-4">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {currentBattleState.playerSetWins >= 3 ? '🎉 승리!' : '😢 패배'}
                </div>
                <div className="text-text-secondary">
                  최종 스코어: {currentBattleState.playerSetWins} - {currentBattleState.opponentSetWins}
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleFinishBattle}
              >
                ✅ 결과 확인
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndividualBattleScreen;

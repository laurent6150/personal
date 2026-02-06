// ========================================
// 경기 결과 모달 컴포넌트 (Phase 3)
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import type { SimMatchResult } from '../../types/individualLeague';

interface BattleResultModalProps {
  matchResult: SimMatchResult;
  winnerFate?: string;  // "16강 진출 확정!"
  loserFate?: string;   // "최종전 대기"
  onConfirm: () => void;
}

export function BattleResultModal({
  matchResult,
  winnerFate,
  loserFate,
  onConfirm
}: BattleResultModalProps) {
  const p1 = matchResult.participant1;
  const p2 = matchResult.participant2;
  const winnerId = matchResult.winnerId;
  const loserId = matchResult.loserId;

  const winnerParticipant = winnerId === p1.odId ? p1 : p2;
  const loserParticipant = winnerId === p1.odId ? p2 : p1;

  const winnerCard = CHARACTERS_BY_ID[winnerParticipant.odId];
  // loserCard available for future use: CHARACTERS_BY_ID[loserParticipant.odId]

  // 통계 계산
  const totalTurns = matchResult.sets.reduce((sum, set) => sum + set.totalTurns, 0);
  const winnerDamage = matchResult.sets.reduce((sum, set) => {
    return sum + set.turns.reduce((turnSum, turn) => {
      return turnSum + (turn.attackerId === winnerId ? turn.damage : 0);
    }, 0);
  }, 0);
  const loserDamage = matchResult.sets.reduce((sum, set) => {
    return sum + set.turns.reduce((turnSum, turn) => {
      return turnSum + (turn.attackerId === loserId ? turn.damage : 0);
    }, 0);
  }, 0);
  const winnerCriticals = matchResult.sets.reduce((sum, set) => {
    return sum + set.turns.filter(turn => turn.attackerId === winnerId && turn.isCritical).length;
  }, 0);
  const loserCriticals = matchResult.sets.reduce((sum, set) => {
    return sum + set.turns.filter(turn => turn.attackerId === loserId && turn.isCritical).length;
  }, 0);

  // 승자가 플레이어 카드인지 확인
  const isWinnerPlayerCrew = winnerParticipant.isPlayerCrew;
  const isLoserPlayerCrew = loserParticipant.isPlayerCrew;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/20 max-w-lg w-full overflow-hidden"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-yellow-500/30 via-accent/30 to-yellow-500/30 p-4 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-yellow-400">경기 종료</div>
        </div>

        {/* 승자 표시 */}
        <div className="p-6 text-center">
          <div className="text-lg text-text-secondary mb-2">WINNER</div>

          {/* 승자 카드 */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative inline-block"
          >
            <div className={`
              w-32 h-32 mx-auto rounded-xl overflow-hidden mb-3
              border-4 ${isWinnerPlayerCrew ? 'border-yellow-400' : 'border-accent'}
              shadow-lg ${isWinnerPlayerCrew ? 'shadow-yellow-400/30' : 'shadow-accent/30'}
            `}>
              {winnerCard && (
                <img
                  src={getCharacterImage(winnerCard.id, winnerCard.name.ko, winnerCard.attribute)}
                  alt={winnerCard.name.ko}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* 왕관 아이콘 */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl">
              👑
            </div>
          </motion.div>

          <div className="text-xl font-bold text-white mb-1">
            {isWinnerPlayerCrew && <span className="text-yellow-400">⭐ </span>}
            {winnerParticipant.odName}
          </div>

          {/* 경기 통계 */}
          <div className="mt-6 bg-bg-secondary rounded-lg p-4 text-left">
            <div className="text-sm font-bold text-text-primary mb-3 text-center">
              ═══ 경기 통계 ═══
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">총 진행</span>
                <span className="text-text-primary">{matchResult.sets.length}세트 / {totalTurns}턴</span>
              </div>

              <div className="flex justify-between">
                <span className={isWinnerPlayerCrew ? 'text-yellow-400' : 'text-green-400'}>
                  {winnerParticipant.odName}
                </span>
                <span className="text-text-primary">
                  {winnerDamage} 데미지 (크리티컬 {winnerCriticals}회)
                </span>
              </div>

              <div className="flex justify-between">
                <span className={isLoserPlayerCrew ? 'text-yellow-400' : 'text-red-400'}>
                  {loserParticipant.odName}
                </span>
                <span className="text-text-primary">
                  {loserDamage} 데미지 (크리티컬 {loserCriticals}회)
                </span>
              </div>
            </div>
          </div>

          {/* 결과 (운명) */}
          {(winnerFate || loserFate) && (
            <div className="mt-4 space-y-1">
              {winnerFate && (
                <div className={`text-sm ${isWinnerPlayerCrew ? 'text-yellow-400' : 'text-green-400'}`}>
                  {winnerParticipant.odName} → {winnerFate}
                </div>
              )}
              {loserFate && (
                <div className={`text-sm ${isLoserPlayerCrew ? 'text-yellow-400' : 'text-red-400'}`}>
                  {loserParticipant.odName} → {loserFate}
                </div>
              )}
            </div>
          )}

          {/* 최종 스코어 */}
          <div className="mt-4 flex justify-center items-center gap-6">
            <div className="text-center">
              <div className={`text-sm ${p1.isPlayerCrew ? 'text-yellow-400' : 'text-text-secondary'}`}>
                {p1.odName}
              </div>
              <div className={`text-3xl font-bold ${
                matchResult.winnerId === p1.odId ? 'text-green-400' : 'text-red-400'
              }`}>
                {matchResult.score[0]}
              </div>
            </div>
            <div className="text-2xl text-text-secondary">:</div>
            <div className="text-center">
              <div className={`text-sm ${p2.isPlayerCrew ? 'text-yellow-400' : 'text-text-secondary'}`}>
                {p2.odName}
              </div>
              <div className={`text-3xl font-bold ${
                matchResult.winnerId === p2.odId ? 'text-green-400' : 'text-red-400'
              }`}>
                {matchResult.score[1]}
              </div>
            </div>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="primary"
            onClick={onConfirm}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default BattleResultModal;

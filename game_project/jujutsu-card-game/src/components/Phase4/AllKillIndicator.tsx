// ========================================
// 올킬 시즌 상태 표시 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import type { AllKillState } from '../../types';
import { calculateAllKillBonus } from '../../utils/allKillSystem';

interface AllKillIndicatorProps {
  state: AllKillState;
  compact?: boolean;
}

export function AllKillIndicator({ state, compact = false }: AllKillIndicatorProps) {
  if (!state.isAllKillSeason) return null;

  const streakCard = state.currentStreakCardId
    ? CHARACTERS_BY_ID[state.currentStreakCardId]
    : null;
  const bonus = calculateAllKillBonus(state.currentStreak);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm"
      >
        <span className="text-red-400">🔥</span>
        <span className="text-red-400 font-bold">올킬 시즌</span>
        {state.currentStreak > 0 && (
          <span className="text-yellow-400">{state.currentStreak}연승</span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 border border-red-500/30 rounded-xl p-4"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-lg font-bold text-red-400">올킬 시즌</div>
            <div className="text-xs text-text-secondary">
              승리한 카드가 연속 출전합니다
            </div>
          </div>
        </div>
        {bonus.bonusTitle && (
          <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-400 text-sm font-bold">
              🏆 {bonus.bonusTitle}
            </span>
          </div>
        )}
      </div>

      {/* 연승 현황 */}
      {streakCard ? (
        <div className="bg-bg-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-bg-secondary rounded-lg flex items-center justify-center text-xl">
              {streakCard.name.ko.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">
                  {streakCard.name.ko}
                </span>
                <span className="text-yellow-400 font-bold">
                  {state.currentStreak}연승 중!
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-red-400">HP</span>
                  <div className="w-20 h-2 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        state.remainingHpPercent > 50 ? 'bg-green-500' :
                        state.remainingHpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${state.remainingHpPercent}%` }}
                    />
                  </div>
                  <span className="text-text-secondary">{state.remainingHpPercent}%</span>
                </div>
                {state.conditionPenalty > 0 && (
                  <span className="text-orange-400">
                    컨디션 -{state.conditionPenalty}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 상태이상 */}
          {state.activeStatusEffects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {state.activeStatusEffects.map((effect, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded"
                >
                  {effect}
                </span>
              ))}
            </div>
          )}

          {/* 보너스 표시 */}
          {state.currentStreak >= 2 && (
            <div className="mt-2 text-xs text-green-400">
              경험치/골드 x{bonus.expMultiplier} 보너스!
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-text-secondary">
          연승자 없음 - 다음 경기 승자가 연속 출전합니다
        </div>
      )}

      {/* 올킬 규칙 안내 */}
      <div className="mt-3 text-xs text-text-secondary">
        <div>• 승리한 카드는 HP/컨디션 감소 상태로 다음 경기 출전</div>
        <div>• 3연승 이상 시 올킬 보너스 획득</div>
        <div>• 상대 연승을 끊으면 역올킬 보너스 획득</div>
      </div>
    </motion.div>
  );
}

interface AllKillChoiceModalProps {
  isOpen: boolean;
  streakCardId: string;
  currentStreak: number;
  remainingHp: number;
  conditionPenalty: number;
  onContinue: () => void;
  onNewCard: () => void;
}

export function AllKillChoiceModal({
  isOpen,
  streakCardId,
  currentStreak,
  remainingHp,
  conditionPenalty,
  onContinue,
  onNewCard
}: AllKillChoiceModalProps) {
  if (!isOpen) return null;

  const streakCard = CHARACTERS_BY_ID[streakCardId];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg-secondary rounded-xl border border-orange-500/30 max-w-md w-full"
      >
        <div className="p-4 border-b border-orange-500/20 text-center">
          <div className="text-2xl mb-2">🔥</div>
          <h3 className="text-lg font-bold text-orange-400">
            연승 계속하시겠습니까?
          </h3>
        </div>

        <div className="p-4">
          <div className="bg-bg-primary/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-bg-secondary rounded-lg flex items-center justify-center text-2xl">
                {streakCard?.name.ko.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-bold text-text-primary">
                  {streakCard?.name.ko || '???'}
                </div>
                <div className="text-sm text-yellow-400">
                  현재 {currentStreak}연승 중
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">남은 HP</span>
                <span className={`font-bold ${
                  remainingHp > 50 ? 'text-green-400' :
                  remainingHp > 25 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {remainingHp}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">컨디션 패널티</span>
                <span className="text-orange-400 font-bold">
                  -{conditionPenalty}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={onContinue}
              className="w-full py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg text-orange-400 font-bold transition-colors"
            >
              🔥 연승 계속 (현재 HP/상태로 출전)
            </button>
            <button
              onClick={onNewCard}
              className="w-full py-3 bg-bg-primary/50 hover:bg-bg-primary border border-white/10 rounded-lg text-text-primary transition-colors"
            >
              새로운 카드로 교체
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AllKillIndicator;

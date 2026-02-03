// ========================================
// 밴픽 결과 표시 모달
// ========================================

import { motion } from 'framer-motion';
import { ARENAS_BY_ID } from '../../data/arenas';
import { Button } from '../UI/Button';
import { getArenaEffectSummary } from '../../utils/banPickSystem';
import type { BanPickInfo } from '../../types';

interface BanResultModalProps {
  banPickInfo: BanPickInfo;
  onContinue: () => void;
}

export function BanResultModal({
  banPickInfo,
  onContinue
}: BanResultModalProps) {
  const playerBannedArena = banPickInfo.playerBannedArena
    ? ARENAS_BY_ID[banPickInfo.playerBannedArena]
    : null;
  const aiBannedArena = banPickInfo.aiBannedArena
    ? ARENAS_BY_ID[banPickInfo.aiBannedArena]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/10 max-w-2xl w-full overflow-hidden"
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-white/10 text-center">
          <div className="text-2xl font-bold text-text-primary">
            🚫 밴픽 결과 🚫
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {/* 밴된 경기장 표시 */}
          <div className="flex gap-4 mb-6">
            {/* 플레이어 밴 */}
            <div className="flex-1 bg-bg-secondary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-2">당신의 밴</div>
              <div className="text-lg font-bold text-red-400 mb-1">
                {playerBannedArena?.name.ko || '없음'}
              </div>
              {playerBannedArena && (
                <div className="text-xs text-text-secondary">
                  {getArenaEffectSummary(playerBannedArena)}
                </div>
              )}
            </div>

            {/* AI 밴 */}
            <div className="flex-1 bg-bg-secondary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-2">상대의 밴</div>
              <div className="text-lg font-bold text-red-400 mb-1">
                {aiBannedArena?.name.ko || '없음'}
              </div>
              {aiBannedArena && (
                <div className="text-xs text-text-secondary">
                  {getArenaEffectSummary(aiBannedArena)}
                </div>
              )}
            </div>
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/20" />
            <div className="text-sm text-text-secondary">이번 경기 경기장</div>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* 선택된 5개 경기장 */}
          <div className="space-y-3">
            {banPickInfo.selectedArenas.map((arena, index) => (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-bg-secondary rounded-lg p-3"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-full text-accent font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-text-primary">
                    {arena.name.ko}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {getArenaEffectSummary(arena)}
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  {arena.category === 'DOMAIN' ? '🌀' : arena.category === 'SPECIAL' ? '⚔️' : '🏛️'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-white/10 flex justify-center">
          <Button variant="primary" size="lg" onClick={onContinue}>
            카드 배치하기
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default BanResultModal;

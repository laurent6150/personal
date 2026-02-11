// ========================================
// 에이스 결정전 선택 모달
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import type { PlayerCard, AceCandidate } from '../../types';
import { recommendPlayerAce, getRandomAceMatchMessage } from '../../utils/aceMatchSystem';

interface AceMatchModalProps {
  isOpen: boolean;
  playerCards: PlayerCard[];
  aiAceId: string;
  aiAceName: string;
  onSelectAce: (aceId: string) => void;
  onClose: () => void;
}

export function AceMatchModal({
  isOpen,
  playerCards,
  aiAceId,
  aiAceName,
  onSelectAce,
  onClose
}: AceMatchModalProps) {
  const [selectedAce, setSelectedAce] = useState<string | null>(null);

  // 추천 순서대로 정렬된 카드 목록
  const sortedCandidates = useMemo(() => {
    const recommended = recommendPlayerAce(playerCards, aiAceId);
    return playerCards
      .map(card => {
        const charData = CHARACTERS_BY_ID[card.cardId];
        const recommendIndex = recommended.indexOf(card.cardId);
        return {
          cardId: card.cardId,
          name: charData?.name.ko || '???',
          currentSeriesWins: 0,
          currentSeriesLosses: 0,
          condition: card.condition.value,
          recommendation: recommendIndex === 0 ? '추천' : undefined,
          level: card.level,
          baseStats: charData?.baseStats
        } as AceCandidate & { level: number; baseStats: typeof charData.baseStats };
      })
      .sort((a, b) => {
        const aIndex = recommended.indexOf(a.cardId);
        const bIndex = recommended.indexOf(b.cardId);
        return aIndex - bIndex;
      });
  }, [playerCards, aiAceId]);

  const handleConfirm = () => {
    if (selectedAce) {
      onSelectAce(selectedAce);
    }
  };

  const aiAceData = CHARACTERS_BY_ID[aiAceId];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-bg-secondary rounded-xl border-2 border-yellow-500/50 max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-4 text-center">
            <div className="text-3xl mb-2">⚔️</div>
            <h2 className="text-xl font-bold text-yellow-400">
              에이스 결정전
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {getRandomAceMatchMessage('trigger')}
            </p>
          </div>

          {/* 상대 에이스 정보 */}
          <div className="p-4 bg-red-500/10 border-b border-red-500/20">
            <div className="text-sm text-red-400 mb-2">상대 에이스</div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-bg-primary rounded-lg flex items-center justify-center text-2xl">
                {aiAceData?.name.ko.charAt(0) || '?'}
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary">
                  {aiAceName}
                </div>
                {aiAceData && (
                  <div className="text-xs text-text-secondary">
                    ATK {aiAceData.baseStats.atk} / DEF {aiAceData.baseStats.def}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 내 에이스 선택 */}
          <div className="p-4">
            <div className="text-sm font-bold text-text-primary mb-3">
              내 에이스 선택
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedCandidates.map((candidate) => {
                const charData = CHARACTERS_BY_ID[candidate.cardId];
                return (
                  <motion.button
                    key={candidate.cardId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedAce === candidate.cardId
                        ? 'bg-accent/20 border-accent'
                        : 'bg-bg-primary/50 border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedAce(candidate.cardId)}
                  >
                    <div className="w-12 h-12 bg-bg-primary rounded-lg flex items-center justify-center text-xl">
                      {charData?.name.ko.charAt(0) || '?'}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">
                          {candidate.name}
                        </span>
                        <span className="text-xs text-text-secondary">
                          Lv.{candidate.level}
                        </span>
                        {candidate.recommendation && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            {candidate.recommendation}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        컨디션 {candidate.condition}% |
                        ATK {candidate.baseStats?.atk || 0} / DEF {candidate.baseStats?.def || 0}
                      </div>
                    </div>

                    {selectedAce === candidate.cardId && (
                      <div className="text-accent text-xl">✓</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="p-4 border-t border-white/10 flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!selectedAce}
              className="flex-1"
            >
              결정
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AceMatchModal;

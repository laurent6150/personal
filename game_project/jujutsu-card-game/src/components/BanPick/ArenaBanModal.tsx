// ========================================
// 경기장 밴 선택 모달
// ========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ALL_ARENAS, ARENAS_BY_ID } from '../../data/arenas';
import { Button } from '../UI/Button';
import {
  analyzeCrewAttributes,
  getRecommendedBans,
  getArenaEffectSummary
} from '../../utils/banPickSystem';
import type { Attribute } from '../../types';

interface ArenaBanModalProps {
  opponentCrewName: string;
  opponentCrew: string[];
  playerCrew: string[];
  onBanSelect: (arenaId: string) => void;
  onCancel?: () => void;
}

// 속성 한글명
const ATTR_NAMES: Record<Attribute, string> = {
  BARRIER: '결계',
  BODY: '신체',
  CURSE: '저주',
  SOUL: '혼백',
  CONVERT: '변환',
  RANGE: '원거리'
};

export function ArenaBanModal({
  opponentCrewName,
  opponentCrew,
  playerCrew: _playerCrew,
  onBanSelect,
  onCancel
}: ArenaBanModalProps) {
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null);

  // 상대 크루 분석
  const opponentAnalysis = useMemo(() =>
    analyzeCrewAttributes(opponentCrew),
    [opponentCrew]
  );

  // 밴 추천
  const recommendations = useMemo(() =>
    getRecommendedBans(opponentCrew, ALL_ARENAS),
    [opponentCrew]
  );

  // 속성별 카드 수 표시
  const getAttributeCount = (analysis: ReturnType<typeof analyzeCrewAttributes>) => {
    return Object.entries(analysis.distribution)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([attr, count]) => `${ATTR_NAMES[attr as Attribute]} ${count}장`)
      .join(', ');
  };

  const handleConfirm = () => {
    if (selectedArenaId) {
      onBanSelect(selectedArenaId);
    }
  };

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
        className="bg-bg-primary rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-white/10 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            🚫 경기장 밴 🚫
          </div>
          <div className="text-text-secondary">
            vs {opponentCrewName}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-text-primary mb-4">
            금지할 경기장 1개를 선택하세요
          </div>

          {/* 경기장 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {ALL_ARENAS.map((arena) => {
              const isSelected = selectedArenaId === arena.id;
              const isRecommended = recommendations.some(r => r.arenaId === arena.id);

              return (
                <motion.button
                  key={arena.id}
                  onClick={() => setSelectedArenaId(arena.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all text-left
                    ${isSelected
                      ? 'border-red-500 bg-red-500/20'
                      : isRecommended
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : 'border-white/10 bg-bg-secondary hover:border-white/30'
                    }
                  `}
                >
                  {isRecommended && !isSelected && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                      추천
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      밴
                    </span>
                  )}

                  <div className="text-sm font-bold text-text-primary mb-1 truncate">
                    {arena.name.ko}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {getArenaEffectSummary(arena)}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 상대 크루 분석 */}
          <div className="bg-bg-secondary rounded-lg p-4 mb-4">
            <div className="text-sm font-bold text-accent mb-2">
              💡 상대 크루 분석
            </div>
            <div className="text-sm text-text-secondary mb-2">
              • 보유 속성: {getAttributeCount(opponentAnalysis)}
            </div>
            <div className="text-sm text-text-secondary">
              • 주력 속성: <span className="text-text-primary font-bold">{ATTR_NAMES[opponentAnalysis.dominant]}</span>
            </div>
          </div>

          {/* 밴 추천 */}
          {recommendations.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-sm font-bold text-yellow-500 mb-2">
                ⚡ 밴 추천
              </div>
              <div className="space-y-1">
                {recommendations.map((rec, idx) => {
                  const arena = ARENAS_BY_ID[rec.arenaId];
                  return (
                    <div key={idx} className="text-sm text-text-secondary">
                      • <span className="text-text-primary">{arena?.name.ko}</span>: {rec.reason}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-white/10 flex justify-center gap-4">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedArenaId}
            className={!selectedArenaId ? 'opacity-50 cursor-not-allowed' : ''}
          >
            밴 확정
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ArenaBanModal;

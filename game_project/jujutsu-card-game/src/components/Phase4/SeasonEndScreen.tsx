// ========================================
// 시즌 종료 화면 - 경험치 합산 표시
// Phase 4: 팀 리그 + 개인 리그 완료 후
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import { useSeasonStore } from '../../stores/seasonStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { calculateLevelFromExp } from '../../data/growthSystem';

interface SeasonEndScreenProps {
  seasonNumber: number;
  onNextSeason: () => void;
}

interface CardExpSummary {
  cardId: string;
  cardName: string;
  teamLeagueExp: number;
  individualLeagueExp: number;
  totalExp: number;
  levelBefore: number;
  levelAfter: number;
  didLevelUp: boolean;
}

export function SeasonEndScreen({ seasonNumber, onNextSeason }: SeasonEndScreenProps) {
  const [isFinalized, setIsFinalized] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const { pendingExp, getPendingExpSummary, finalizeSeason, isSeasonComplete } = useSeasonStore(
    useShallow(state => ({
      pendingExp: state.pendingExp,
      getPendingExpSummary: state.getPendingExpSummary,
      finalizeSeason: state.finalizeSeason,
      isSeasonComplete: state.isSeasonComplete,
    }))
  );

  const ownedCards = usePlayerStore(state => state.player.ownedCards);

  // 경험치 요약 계산
  const cardSummaries: CardExpSummary[] = useMemo(() => {
    const expSummary = getPendingExpSummary();
    const summaries: CardExpSummary[] = [];

    Object.entries(expSummary).forEach(([cardId, data]) => {
      const charData = CHARACTERS_BY_ID[cardId];
      const playerCard = ownedCards[cardId];

      const currentTotalExp = playerCard?.totalExp || 0;
      const currentLevel = calculateLevelFromExp(currentTotalExp);

      // 레벨업 계산 (실제 EXP_TABLE 기반)
      const newTotalExp = currentTotalExp + data.totalExp;
      const newLevel = calculateLevelFromExp(newTotalExp);

      summaries.push({
        cardId,
        cardName: charData?.name.ko || cardId,
        teamLeagueExp: data.teamLeagueExp,
        individualLeagueExp: data.individualLeagueExp,
        totalExp: data.totalExp,
        levelBefore: currentLevel,
        levelAfter: newLevel,
        didLevelUp: newLevel > currentLevel,
      });
    });

    // 총 경험치 기준 내림차순 정렬
    return summaries.sort((a, b) => b.totalExp - a.totalExp);
  }, [getPendingExpSummary, ownedCards]);

  // 경험치 상세 정보
  const getExpDetails = (cardId: string) => {
    return pendingExp[cardId]?.details || [];
  };

  // 시즌 종료 처리
  const handleFinalize = () => {
    finalizeSeason();
    setIsFinalized(true);
  };

  // 다음 시즌 시작
  const handleNextSeason = () => {
    onNextSeason();
  };

  // 시즌 미완료 시
  if (!isSeasonComplete()) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-6 max-w-md text-center">
          <div className="text-4xl mb-4">...</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">시즌 진행 중</h2>
          <p className="text-text-secondary mb-4">
            팀 리그와 개인 리그를 모두 완료해야<br />
            시즌이 종료됩니다.
          </p>
          <Button variant="secondary" onClick={onNextSeason}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg-secondary rounded-xl border border-yellow-500/30 max-w-2xl w-full my-4"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-2xl font-bold text-yellow-400">
            시즌 {seasonNumber} 종료!
          </h1>
          <p className="text-text-secondary mt-2">
            모든 리그가 완료되었습니다
          </p>
        </div>

        {/* 경험치 획득 내역 */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span>📊</span> 경험치 획득 내역
          </h2>

          {cardSummaries.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              획득한 경험치가 없습니다
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cardSummaries.map((summary, idx) => {
                const charData = CHARACTERS_BY_ID[summary.cardId];
                const details = getExpDetails(summary.cardId);
                const isExpanded = showDetails === summary.cardId;

                return (
                  <motion.div
                    key={summary.cardId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-bg-primary/50 rounded-lg overflow-hidden"
                  >
                    {/* 카드 요약 */}
                    <button
                      onClick={() => setShowDetails(isExpanded ? null : summary.cardId)}
                      className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                    >
                      {/* 캐릭터 이미지 */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                        {charData && (
                          <img
                            src={getCharacterImage(charData.id, charData.name.ko, charData.attribute)}
                            alt={summary.cardName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* 이름 및 레벨 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text-primary truncate">
                          {summary.cardName}
                        </div>
                        <div className="text-sm text-text-secondary flex items-center gap-2">
                          <span>Lv.{summary.levelBefore}</span>
                          <span className="text-accent">→</span>
                          <span className={summary.didLevelUp ? 'text-yellow-400 font-bold' : ''}>
                            Lv.{summary.levelAfter}
                            {summary.didLevelUp && ' 🎉'}
                          </span>
                        </div>
                      </div>

                      {/* 경험치 요약 */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-green-400">
                          +{summary.totalExp.toLocaleString()} EXP
                        </div>
                        <div className="text-xs text-text-secondary">
                          {isExpanded ? '▲ 접기' : '▼ 상세'}
                        </div>
                      </div>
                    </button>

                    {/* 상세 내역 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10 overflow-hidden"
                        >
                          <div className="p-4 bg-bg-primary/30">
                            {/* 리그별 합계 */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <div className="text-xs text-blue-400 mb-1">팀 리그</div>
                                <div className="font-bold text-text-primary">
                                  +{summary.teamLeagueExp.toLocaleString()} EXP
                                </div>
                              </div>
                              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                <div className="text-xs text-purple-400 mb-1">개인 리그</div>
                                <div className="font-bold text-text-primary">
                                  +{summary.individualLeagueExp.toLocaleString()} EXP
                                </div>
                              </div>
                            </div>

                            {/* 상세 내역 */}
                            {details.length > 0 && (
                              <div className="space-y-1 text-sm">
                                {details.map((detail, i) => (
                                  <div key={i} className="flex justify-between text-text-secondary">
                                    <span>{detail.description}</span>
                                    <span className="text-green-400">+{detail.amount}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="p-6 border-t border-white/10">
          {!isFinalized ? (
            <Button
              variant="primary"
              onClick={handleFinalize}
              className="w-full py-3 text-lg"
            >
              🎁 경험치 수령 및 시즌 종료
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-green-400 py-2">
                <span>✅ 경험치가 지급되었습니다!</span>
              </div>
              <Button
                variant="primary"
                onClick={handleNextSeason}
                className="w-full py-3 text-lg"
              >
                ➡️ 시즌 {seasonNumber + 1} 시작하기
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SeasonEndScreen;

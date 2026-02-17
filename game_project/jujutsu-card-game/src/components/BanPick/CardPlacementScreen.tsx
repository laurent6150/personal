// ========================================
// 카드 배치 화면
// 4경기장에 미리 카드를 배치 + 에이스 결정전 (5경기)
// 경기장 효과 및 추천도 표시
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';
import {
  getArenaEffectSummary,
  autoAssignCards,
  getRecommendedCardsForArena
} from '../../utils/banPickSystem';
import { analyzeArenaEffects } from '../../utils/arenaEffectAnalyzer';
import { recommendOptimalPlacement } from '../../utils/strategyAdvisor';
import { SelectedCardPanel } from './SelectedCardPanel';
import type { Arena, CardAssignment, ArenaEffect, PlayerCard } from '../../types';

// 배치 필요 경기 수 (4경기, 5경기는 에이스 결정전)
const REQUIRED_ASSIGNMENTS = 4;

interface CardPlacementScreenProps {
  playerCrew: string[];
  arenas: Arena[];           // 5개 경기장
  opponentCrewName: string;
  onConfirm: (assignments: CardAssignment[]) => void;
  onBack?: () => void;
}

export function CardPlacementScreen({
  playerCrew,
  arenas,
  opponentCrewName,
  onConfirm,
  onBack
}: CardPlacementScreenProps) {
  // 각 경기장에 배치된 카드 ID (null이면 미배치)
  // 1~4경기만 배치, 5경기는 에이스 결정전
  const [assignments, setAssignments] = useState<(string | null)[]>(
    Array(REQUIRED_ASSIGNMENTS).fill(null)
  );
  // 현재 선택된 카드 (하단에서 클릭)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // 이미 배치된 카드 ID 목록
  const assignedCardIds = assignments.filter(Boolean) as string[];

  // 현재 선택된 카드의 캐릭터 정보
  const selectedCard = selectedCardId ? CHARACTERS_BY_ID[selectedCardId] : null;

  // 배치 완료 여부 (4개 모두 배치)
  const isComplete = assignments.slice(0, REQUIRED_ASSIGNMENTS).every(a => a !== null);

  // 전략 추천 (strategyAdvisor 사용)
  const [showStrategyTips, setShowStrategyTips] = useState(true);
  const strategyRecommendations = useMemo(() => {
    // PlayerCard 형태로 변환 (기본 레벨 1, 장비 없음)
    const playerCards: PlayerCard[] = playerCrew.map(cardId => ({
      cardId,
      level: 1,
      exp: 0,
      totalExp: 0,
      equipment: [null, null] as [string | null, string | null],
      stats: { totalWins: 0, totalLosses: 0, vsRecord: {}, arenaRecord: {} },
      unlockedAchievements: [],
      bonusStats: { atk: 0, def: 0, spd: 0, ce: 0, hp: 0, crt: 0, tec: 0, mnt: 0 },
      condition: { value: 80, consecutiveBattles: 0, lastRestRound: 0 },
      currentForm: 'STABLE' as const,
      recentResults: [],
      currentWinStreak: 0,
      maxWinStreak: 0
    }));
    return recommendOptimalPlacement(playerCards, arenas.slice(0, REQUIRED_ASSIGNMENTS));
  }, [playerCrew, arenas]);

  // 슬롯 클릭 핸들러
  const handleSlotClick = (index: number) => {
    if (selectedCardId) {
      // 카드가 선택되어 있으면 해당 슬롯에 배치
      const newAssignments = [...assignments];

      // 이미 다른 슬롯에 배치된 경우 제거
      const existingIndex = newAssignments.indexOf(selectedCardId);
      if (existingIndex !== -1) {
        newAssignments[existingIndex] = null;
      }

      newAssignments[index] = selectedCardId;
      setAssignments(newAssignments);
      setSelectedCardId(null);
    } else if (assignments[index]) {
      // 슬롯에 카드가 있으면 선택 상태로 변경
      setSelectedCardId(assignments[index]);
      const newAssignments = [...assignments];
      newAssignments[index] = null;
      setAssignments(newAssignments);
    }
  };

  // 카드 클릭 핸들러 (하단 크루 영역)
  const handleCardClick = (cardId: string) => {
    if (selectedCardId === cardId) {
      // 이미 선택된 카드면 선택 해제
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  // 자동 배치 (1~4경기만)
  const handleAutoAssign = () => {
    const autoAssignments = autoAssignCards(playerCrew, arenas.slice(0, REQUIRED_ASSIGNMENTS));
    const newAssignments = autoAssignments.map(a => a.cardId);
    setAssignments(newAssignments);
    setSelectedCardId(null);
  };

  // 초기화
  const handleReset = () => {
    setAssignments(Array(REQUIRED_ASSIGNMENTS).fill(null));
    setSelectedCardId(null);
  };

  // 확정 (1~4경기 배치 + 5경기는 에이스 결정전으로 null)
  const handleConfirm = () => {
    const cardAssignments: CardAssignment[] = arenas.map((arena, index) => ({
      arenaId: arena.id,
      arenaIndex: index,
      // 5경기(index 4)는 에이스 결정전이므로 null
      cardId: index < REQUIRED_ASSIGNMENTS ? assignments[index] : null
    }));
    onConfirm(cardAssignments);
  };

  // 경기장별 추천 카드
  const getRecommendation = (arena: Arena, index: number) => {
    const unassignedCards = playerCrew.filter(
      id => !assignments.some((a, i) => a === id && i !== index)
    );
    const recs = getRecommendedCardsForArena(arena, unassignedCards);
    if (recs.length > 0 && recs[0].score > 0) {
      const card = CHARACTERS_BY_ID[recs[0].cardId];
      return card?.name.ko || null;
    }
    return null;
  };

  // 카드-경기장 적합도 점수 계산 (1-5 별)
  const getCardArenaScore = (cardId: string, arena: Arena): number => {
    const card = CHARACTERS_BY_ID[cardId];
    if (!card) return 0;

    let score = 3; // 기본 점수

    // 경기장 효과 분석
    for (const effect of arena.effects) {
      const target = effect.target;
      const isTargetAll = target === 'ALL';
      const isTargetAttribute = target === card.attribute;

      if (isTargetAll || isTargetAttribute) {
        if (effect.value > 0) {
          score += effect.value >= 20 ? 2 : 1; // 강화 효과
        } else if (effect.value < 0) {
          score -= effect.value <= -20 ? 2 : 1; // 약화 효과
        }
      }
    }

    return Math.min(5, Math.max(1, score));
  };

  // 별 표시 생성
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">⭐</span>);
      } else {
        stars.push(<span key={i} className="text-gray-600">☆</span>);
      }
    }
    return stars;
  };

  // 선택된 카드에 대한 경기장별 효과 분석
  const getArenaEffectsForCard = (cardId: string, arena: Arena): {
    effects: { effect: ArenaEffect; isRelevant: boolean; icon: string }[];
    overallScore: 'GOOD' | 'BAD' | 'NEUTRAL';
  } => {
    const card = CHARACTERS_BY_ID[cardId];
    if (!card) return { effects: [], overallScore: 'NEUTRAL' };

    const analyzedEffects = arena.effects.map(effect => {
      const isTargetAll = effect.target === 'ALL';
      const isTargetAttribute = effect.target === card.attribute;
      const isRelevant = isTargetAll || isTargetAttribute;

      let icon = '➖';
      if (isRelevant) {
        if (effect.value > 0) icon = '⬆️';
        else if (effect.value < 0) icon = '⬇️';
      }

      return { effect, isRelevant, icon };
    });

    // 전체 점수 계산
    const relevantEffects = analyzedEffects.filter(e => e.isRelevant);
    const positiveCount = relevantEffects.filter(e => e.effect.value > 0).length;
    const negativeCount = relevantEffects.filter(e => e.effect.value < 0).length;

    let overallScore: 'GOOD' | 'BAD' | 'NEUTRAL' = 'NEUTRAL';
    if (positiveCount > negativeCount) overallScore = 'GOOD';
    else if (negativeCount > positiveCount) overallScore = 'BAD';

    return { effects: analyzedEffects, overallScore };
  };

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-text-primary">
            📋 엔트리 편성
          </div>
          <div className="text-text-secondary">
            vs {opponentCrewName}
          </div>
        </div>
      </div>

      {/* 경기장 슬롯 (1~4경기 + 에이스 결정전) */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-5 gap-3">
          {/* 1~4경기 슬롯 */}
          {arenas.slice(0, REQUIRED_ASSIGNMENTS).map((arena, index) => {
            const assignedCard = assignments[index]
              ? CHARACTERS_BY_ID[assignments[index]!]
              : null;
            const recommendation = getRecommendation(arena, index);
            // 선택된 카드의 이 경기장 효과 분석
            const selectedCardAnalysis = selectedCard
              ? analyzeArenaEffects(selectedCard, arena)
              : null;

            return (
              <div key={arena.id} className="flex flex-col gap-2">
                {/* 경기장 정보 */}
                <div className={`bg-bg-secondary rounded-lg p-2 text-center transition-all min-h-[80px] ${
                  selectedCardAnalysis?.recommendation === 'good' ? 'ring-2 ring-green-500/50' :
                  selectedCardAnalysis?.recommendation === 'bad' ? 'ring-2 ring-red-500/50' : ''
                }`}>
                  <div className="text-xs text-text-secondary mb-1">
                    {index + 1}경기
                  </div>
                  <div className="text-sm font-bold text-text-primary mb-1 break-keep leading-tight" title={arena.name.ko}>
                    {arena.name.ko}
                  </div>
                  <div className="text-[10px] text-text-secondary leading-tight break-words overflow-hidden">
                    {getArenaEffectSummary(arena).split(', ').map((effect, i) => (
                      <div key={i}>{effect}</div>
                    ))}
                  </div>
                  {/* 선택된 카드의 경기장 효과 미리보기 */}
                  {selectedCardAnalysis && !assignedCard && (
                    <div className={`mt-1 text-[10px] font-bold ${
                      selectedCardAnalysis.recommendation === 'good' ? 'text-green-400' :
                      selectedCardAnalysis.recommendation === 'bad' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {selectedCardAnalysis.recommendation === 'good' && '⭐ 추천!'}
                      {selectedCardAnalysis.recommendation === 'bad' && '⚠️ 불리'}
                      {selectedCardAnalysis.recommendation === 'neutral' && '➖ 보통'}
                    </div>
                  )}
                </div>

                {/* 화살표 */}
                <div className="text-center text-text-secondary text-xl">↓</div>

                {/* 카드 슬롯 */}
                {(() => {
                  const cardScore = assignedCard
                    ? getCardArenaScore(assignments[index]!, arena)
                    : 0;
                  const analysis = assignedCard
                    ? getArenaEffectsForCard(assignments[index]!, arena)
                    : null;

                  return (
                    <motion.button
                      onClick={() => handleSlotClick(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        aspect-[3/4] rounded-lg border-2 transition-all overflow-hidden
                        ${assignedCard
                          ? analysis?.overallScore === 'GOOD'
                            ? 'border-green-500 bg-green-500/10'
                            : analysis?.overallScore === 'BAD'
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-accent bg-accent/10'
                          : selectedCardId
                            ? selectedCardAnalysis?.recommendation === 'good'
                              ? 'border-green-500 border-dashed bg-green-500/10 animate-pulse'
                              : selectedCardAnalysis?.recommendation === 'bad'
                                ? 'border-red-500 border-dashed bg-red-500/10 animate-pulse'
                                : 'border-yellow-500 border-dashed bg-yellow-500/10 animate-pulse'
                            : 'border-white/20 border-dashed bg-bg-secondary'
                        }
                      `}
                    >
                      {assignedCard ? (
                        <div className="w-full h-full relative">
                          <img
                            src={getCharacterImage(assignedCard.id, assignedCard.name.ko, assignedCard.attribute)}
                            alt={assignedCard.name.ko}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getPlaceholderImage(assignedCard.name.ko, assignedCard.attribute);
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                            <div className="text-xs font-bold text-white truncate">
                              {assignedCard.name.ko}
                            </div>
                            {/* 적합도 별 표시 */}
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <span className="text-[8px]">{renderStars(cardScore)}</span>
                            </div>
                          </div>
                          <div className="absolute top-1 left-1">
                            <GradeBadge grade={assignedCard.grade} size="sm" />
                          </div>
                          {/* 적합도 배지 */}
                          <div className="absolute top-1 right-1">
                            {analysis?.overallScore === 'GOOD' && (
                              <span className="bg-green-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                유리
                              </span>
                            )}
                            {analysis?.overallScore === 'BAD' && (
                              <span className="bg-red-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                불리
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          <div className="text-2xl text-white/30 mb-1">+</div>
                          <div className="text-[10px] text-text-secondary text-center">
                            {selectedCardId ? '클릭하여 배치' : '빈 슬롯'}
                          </div>
                          {recommendation && !selectedCardId && (
                            <div className="text-[10px] text-accent mt-1 truncate w-full text-center">
                              추천: {recommendation}
                            </div>
                          )}
                          {/* 선택된 카드의 효과 미리보기 */}
                          {selectedCardAnalysis && (
                            <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                              {selectedCardAnalysis.positive.slice(0, 1).map((_, i) => (
                                <span key={`p${i}`} className="text-[8px] text-green-400">✅</span>
                              ))}
                              {selectedCardAnalysis.negative.slice(0, 1).map((_, i) => (
                                <span key={`n${i}`} className="text-[8px] text-red-400">❌</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })()}
              </div>
            );
          })}

          {/* 5경기 에이스 결정전 슬롯 */}
          {arenas[4] && (
            <div className="flex flex-col gap-2">
              {/* 경기장 정보 */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-2 text-center border border-yellow-500/30 min-h-[80px]">
                <div className="text-xs text-yellow-400 mb-1 font-bold">
                  5경기
                </div>
                <div className="text-sm font-bold text-text-primary mb-1 break-keep leading-tight" title={arenas[4].name.ko}>
                  {arenas[4].name.ko}
                </div>
                <div className="text-[10px] text-text-secondary leading-tight break-words overflow-hidden">
                  {getArenaEffectSummary(arenas[4]).split(', ').map((effect, i) => (
                    <div key={i}>{effect}</div>
                  ))}
                </div>
              </div>

              {/* 화살표 */}
              <div className="text-center text-yellow-400 text-xl">⚔️</div>

              {/* 에이스 결정전 슬롯 */}
              <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-orange-500/10 flex flex-col items-center justify-center p-2">
                <div className="text-3xl mb-2">⚔️</div>
                <div className="text-sm font-bold text-yellow-400 text-center">
                  에이스 결정전
                </div>
                <div className="text-[10px] text-text-secondary text-center mt-1">
                  2:2 동점 시 진행
                </div>
                <div className="text-[8px] text-yellow-400/70 text-center mt-2">
                  모든 카드 선택 가능
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 전략 추천 패널 */}
      {showStrategyTips && strategyRecommendations.length > 0 && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <span>💡</span> AI 전략 추천
              </div>
              <button
                onClick={() => setShowStrategyTips(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                닫기 ×
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {strategyRecommendations.map((rec, index) => (
                <div key={rec.arenaId} className="bg-black/30 rounded-lg p-2">
                  <div className="text-xs text-gray-400 truncate">
                    <span className="text-purple-400 font-bold">{index + 1}경기</span> {rec.arenaName}
                  </div>
                  <div className="text-sm text-white font-bold truncate">
                    → {rec.recommendedCardName}
                  </div>
                  <div className="text-xs text-purple-400">
                    적합도: {rec.score.toFixed(0)}점
                  </div>
                  {rec.reasons.length > 0 && (
                    <div className="text-[10px] text-gray-500 mt-1 truncate" title={rec.reasons.join(', ')}>
                      {rec.reasons[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              추천을 참고하여 자신만의 전략을 세워보세요!
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-sm text-yellow-400">
            ※ 5경기는 2:2 동점 시 <span className="font-bold">에이스 결정전</span>으로 진행됩니다
          </div>
          <div className="text-xs text-text-secondary mt-1">
            에이스 결정전에서는 1~4경기 출전 카드도 다시 선택 가능합니다
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/20" />
          <div className="text-sm text-text-secondary">내 크루 카드</div>
          <div className="flex-1 h-px bg-white/20" />
        </div>
      </div>

      {/* 크루 카드 목록 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-6 gap-3">
          {playerCrew.map((cardId) => {
            const card = CHARACTERS_BY_ID[cardId];
            if (!card) return null;

            const isAssigned = assignedCardIds.includes(cardId);
            const isSelected = selectedCardId === cardId;

            return (
              <motion.button
                key={cardId}
                onClick={() => handleCardClick(cardId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isAssigned && !isSelected}
                className={`
                  aspect-[3/4] rounded-lg border-2 transition-all overflow-hidden relative
                  ${isSelected
                    ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                    : isAssigned
                      ? 'border-white/10 opacity-40'
                      : 'border-white/20 hover:border-white/40'
                  }
                `}
              >
                <img
                  src={getCharacterImage(card.id, card.name.ko, card.attribute)}
                  alt={card.name.ko}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getPlaceholderImage(card.name.ko, card.attribute);
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                  <div className="text-xs font-bold text-white truncate">
                    {card.name.ko}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <AttributeBadge attribute={card.attribute} size="sm" />
                  </div>
                </div>
                <div className="absolute top-1 left-1">
                  <GradeBadge grade={card.grade} size="sm" />
                </div>

                {isAssigned && !isSelected && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white/70 text-xs">배치됨</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 선택된 카드 정보 패널 (RadarChart + 필살기 + 경기장 적합도) */}
      <AnimatePresence>
        {selectedCard && (
          <div className="max-w-6xl mx-auto mb-6">
            <SelectedCardPanel
              character={selectedCard}
              arenas={arenas}
              onClose={() => setSelectedCardId(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* 버튼 영역 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              뒤로
            </Button>
          )}
          <Button variant="secondary" onClick={handleAutoAssign}>
            자동 배치
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            초기화
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!isComplete}
            className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}
          >
            배치 완료 {isComplete && '✓'}
          </Button>
        </div>
        {!isComplete && (
          <div className="text-center text-sm text-text-secondary mt-2">
            1~4경기 슬롯에 카드를 배치해주세요 ({assignedCardIds.length}/{REQUIRED_ASSIGNMENTS})
          </div>
        )}
      </div>
    </div>
  );
}

export default CardPlacementScreen;

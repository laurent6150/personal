// ========================================
// 카드 배치 화면
// 5경기장에 미리 카드를 배치
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';
import {
  getArenaEffectSummary,
  autoAssignCards,
  getRecommendedCardsForArena
} from '../../utils/banPickSystem';
import type { Arena, CardAssignment } from '../../types';

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
  const [assignments, setAssignments] = useState<(string | null)[]>(
    Array(5).fill(null)
  );
  // 현재 선택된 카드 (하단에서 클릭)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // 이미 배치된 카드 ID 목록
  const assignedCardIds = assignments.filter(Boolean) as string[];

  // 현재 선택된 카드의 캐릭터 정보
  const selectedCard = selectedCardId ? CHARACTERS_BY_ID[selectedCardId] : null;

  // 배치 완료 여부 (5개 모두 배치)
  const isComplete = assignments.every(a => a !== null);

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

  // 자동 배치
  const handleAutoAssign = () => {
    const autoAssignments = autoAssignCards(playerCrew, arenas);
    const newAssignments = autoAssignments.map(a => a.cardId);
    setAssignments(newAssignments);
    setSelectedCardId(null);
  };

  // 초기화
  const handleReset = () => {
    setAssignments(Array(5).fill(null));
    setSelectedCardId(null);
  };

  // 확정
  const handleConfirm = () => {
    const cardAssignments: CardAssignment[] = arenas.map((arena, index) => ({
      arenaId: arena.id,
      arenaIndex: index,
      cardId: assignments[index]
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

      {/* 경기장 슬롯 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-5 gap-3">
          {arenas.map((arena, index) => {
            const assignedCard = assignments[index]
              ? CHARACTERS_BY_ID[assignments[index]!]
              : null;
            const recommendation = getRecommendation(arena, index);

            return (
              <div key={arena.id} className="flex flex-col gap-2">
                {/* 경기장 정보 */}
                <div className="bg-bg-secondary rounded-lg p-2 text-center">
                  <div className="text-xs text-text-secondary mb-1">
                    {index + 1}경기
                  </div>
                  <div className="text-sm font-bold text-text-primary truncate mb-1">
                    {arena.name.ko}
                  </div>
                  <div className="text-[10px] text-text-secondary">
                    {getArenaEffectSummary(arena)}
                  </div>
                </div>

                {/* 화살표 */}
                <div className="text-center text-text-secondary text-xl">↓</div>

                {/* 카드 슬롯 */}
                <motion.button
                  onClick={() => handleSlotClick(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    aspect-[3/4] rounded-lg border-2 transition-all overflow-hidden
                    ${assignedCard
                      ? 'border-accent bg-accent/10'
                      : selectedCardId
                        ? 'border-yellow-500 border-dashed bg-yellow-500/10 animate-pulse'
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
                      </div>
                      <div className="absolute top-1 left-1">
                        <GradeBadge grade={assignedCard.grade} size="sm" />
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
                    </div>
                  )}
                </motion.button>
              </div>
            );
          })}
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

      {/* 선택된 카드 정보 & 추천 */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-6"
        >
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="text-lg">👆</div>
              <div>
                <div className="text-sm font-bold text-yellow-500">
                  {selectedCard.name.ko} 선택됨
                </div>
                <div className="text-xs text-text-secondary">
                  위 경기장 슬롯을 클릭하여 배치하세요
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
            5개 경기장 모두에 카드를 배치해주세요 ({assignedCardIds.length}/5)
          </div>
        )}
      </div>
    </div>
  );
}

export default CardPlacementScreen;

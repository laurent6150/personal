// ========================================
// 코칭 패널 컴포넌트 (Phase 5)
// 카드별 전투 전략 설정 UI
// ========================================

import React, { useState } from 'react';
import type { CoachingStrategy, PlayerCard } from '../../types';
import { COACHING_EFFECTS } from '../../types';
import { useCoachingStore, getAllStrategies, getStrategyDescription } from '../../stores/coachingStore';
import { CHARACTERS_BY_ID } from '../../data/characters';

interface CoachingPanelProps {
  cards: PlayerCard[];           // 설정 대상 카드 목록
  season: number;
  onStrategyChange?: (cardId: string, strategy: CoachingStrategy) => void;
  compact?: boolean;             // 컴팩트 모드 (개인 리그용)
  className?: string;
}

export const CoachingPanel: React.FC<CoachingPanelProps> = ({
  cards,
  season,
  onStrategyChange,
  compact = false,
  className = '',
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { setCardStrategy, getCardStrategy } = useCoachingStore();

  const strategies = getAllStrategies();

  // 전략 변경 핸들러
  const handleStrategyChange = (cardId: string, strategy: CoachingStrategy) => {
    setCardStrategy(cardId, strategy, season);
    onStrategyChange?.(cardId, strategy);

    const effect = COACHING_EFFECTS[strategy];
    setMessage({
      text: `${CHARACTERS_BY_ID[cardId]?.name.ko || cardId}의 전략을 ${effect.label}(으)로 설정했습니다.`,
      type: 'success'
    });

    setTimeout(() => setMessage(null), 2000);
  };

  if (compact) {
    // 컴팩트 모드: 카드 선택 + 전략 선택을 한 줄에
    return (
      <div className={`bg-gray-800 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-white">전략 설정</span>
          <span className="text-xs text-gray-400">카드별 전투 전략</span>
        </div>

        <div className="space-y-2">
          {cards.map(card => {
            const character = CHARACTERS_BY_ID[card.cardId];
            const currentStrategy = getCardStrategy(card.cardId);
            const effect = COACHING_EFFECTS[currentStrategy];

            return (
              <div key={card.cardId} className="flex items-center gap-2 bg-gray-700/50 rounded p-2">
                <div className="flex-shrink-0 w-24">
                  <div className="text-sm font-medium text-white truncate">
                    {character?.name.ko || card.cardId}
                  </div>
                  <div className="text-xs text-gray-400">Lv.{card.level}</div>
                </div>

                <select
                  value={currentStrategy}
                  onChange={(e) => handleStrategyChange(card.cardId, e.target.value as CoachingStrategy)}
                  className="flex-1 bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-blue-500"
                >
                  {strategies.map(s => (
                    <option key={s.strategy} value={s.strategy}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>

                <div className="flex-shrink-0 text-xs text-gray-400 w-20 text-right">
                  {effect.icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 전체 모드: 카드 선택 → 전략 상세 선택
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Coaching</span>
          <span className="text-sm font-normal text-gray-400">전략 설정</span>
        </h3>
      </div>

      {/* 카드 선택 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">카드 선택</h4>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {cards.map(card => {
            const character = CHARACTERS_BY_ID[card.cardId];
            const currentStrategy = getCardStrategy(card.cardId);
            const effect = COACHING_EFFECTS[currentStrategy];
            const isSelected = selectedCard === card.cardId;

            return (
              <button
                key={card.cardId}
                onClick={() => setSelectedCard(isSelected ? null : card.cardId)}
                className={`p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {character?.name.ko?.slice(0, 1) || '?'}
                  </div>
                  <div className="text-xs text-gray-300 truncate">
                    {character?.name.ko || card.cardId}
                  </div>
                  <div className="text-xs text-gray-500">
                    Lv.{card.level}
                  </div>
                  <div className="mt-1 text-xs" title={effect.label}>
                    {effect.icon}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 전략 선택 */}
      {selectedCard && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {CHARACTERS_BY_ID[selectedCard]?.name.ko || selectedCard} 전략 선택
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {strategies.map(s => {
              const isActive = getCardStrategy(selectedCard) === s.strategy;

              return (
                <button
                  key={s.strategy}
                  onClick={() => handleStrategyChange(selectedCard, s.strategy)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    isActive
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-medium text-white">{s.label}</span>
                    {isActive && <span className="text-green-400 text-xs ml-auto">적용 중</span>}
                  </div>
                  <div className="text-xs text-gray-400">
                    {s.description || '변화 없음'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 메시지 */}
      {message && (
        <div
          className={`mt-3 p-3 rounded-lg text-center text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

// ========================================
// 전략 인디케이터 (카드에 표시용)
// ========================================

interface StrategyIndicatorProps {
  cardId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StrategyIndicator: React.FC<StrategyIndicatorProps> = ({
  cardId,
  size = 'sm',
  className = '',
}) => {
  const { getCardStrategy } = useCoachingStore();
  const strategy = getCardStrategy(cardId);
  const effect = COACHING_EFFECTS[strategy];

  // BALANCED는 표시하지 않음
  if (strategy === 'BALANCED') return null;

  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-sm px-2 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-gray-700/80 ${sizeClasses[size]} ${className}`}
      title={`${effect.label}: ${getStrategyDescription(strategy)}`}
    >
      <span>{effect.icon}</span>
      {size === 'md' && <span className="text-gray-300">{effect.label}</span>}
    </span>
  );
};

export default CoachingPanel;

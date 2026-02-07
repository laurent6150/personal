// ========================================
// 활동 패널 컴포넌트 (Phase 5)
// 경기 사이 활동 선택 UI
// ========================================

import React, { useState } from 'react';
import type { ActivityType, PlayerCard } from '../../types';
import { ACTIVITY_OPTIONS } from '../../types';
import { useActivityStore, canPerformActivity } from '../../stores/activityStore';
import { useEconomyStore } from '../../stores/economyStore';
import { CHARACTERS_BY_ID } from '../../data/characters';

interface ActivityPanelProps {
  cards: PlayerCard[];           // 활동 대상 카드 목록
  season: number;
  currentMatch: number;
  onActivityComplete?: (type: ActivityType, cardId: string | null) => void;
  className?: string;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({
  cards,
  season,
  currentMatch,
  onActivityComplete,
  className = '',
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { currentAP, maxAP, performActivity } = useActivityStore();
  const { cp, spendCP, earnCP } = useEconomyStore();

  // 선택된 활동 정보
  const selectedOption = selectedActivity
    ? ACTIVITY_OPTIONS.find(opt => opt.type === selectedActivity)
    : null;

  // 활동 수행 가능 여부
  const canPerform = selectedActivity
    ? canPerformActivity(selectedActivity, currentAP, cp).canDo
    : false;

  // 카드 선택이 필요한 활동인지
  const needsCardSelection = selectedActivity && ['TRAIN', 'REST', 'PRACTICE'].includes(selectedActivity);

  // 활동 실행
  const handleExecute = () => {
    if (!selectedActivity) return;

    // 카드 선택이 필요한 활동인데 선택 안 됨
    if (needsCardSelection && !selectedCard) {
      setMessage({ text: '카드를 선택해주세요.', type: 'error' });
      return;
    }

    const result = performActivity(
      selectedActivity,
      needsCardSelection ? selectedCard : null,
      season,
      currentMatch,
      (amount, reason, description, season) => spendCP(amount, reason as any, description, season)
    );

    if (result.success) {
      // 팬미팅인 경우 CP 획득
      if (selectedActivity === 'FAN_MEETING' && result.cpEarned) {
        earnCP(result.cpEarned, 'SPECTATE', '팬미팅 CP 획득', season);
      }

      setMessage({ text: result.message, type: 'success' });
      onActivityComplete?.(selectedActivity, needsCardSelection ? selectedCard : null);

      // 선택 초기화
      setSelectedActivity(null);
      setSelectedCard(null);
    } else {
      setMessage({ text: result.message, type: 'error' });
    }

    // 3초 후 메시지 제거
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Activity</span>
          <span className="text-sm font-normal text-gray-400">활동</span>
        </h3>

        {/* AP 표시 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">AP</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: maxAP }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-4 rounded-sm ${i < currentAP ? 'bg-blue-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-sm text-white font-medium">
            {currentAP}/{maxAP}
          </span>
        </div>
      </div>

      {/* 활동 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {ACTIVITY_OPTIONS.map(option => {
          const check = canPerformActivity(option.type, currentAP, cp);
          const isSelected = selectedActivity === option.type;

          return (
            <button
              key={option.type}
              onClick={() => {
                setSelectedActivity(isSelected ? null : option.type);
                setSelectedCard(null);
              }}
              disabled={!check.canDo}
              className={`p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/20'
                  : check.canDo
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                    : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium text-white">{option.label}</span>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {option.description}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400">AP {option.apCost}</span>
                {option.cpCost > 0 && (
                  <span className="text-yellow-400">CP {option.cpCost}</span>
                )}
              </div>
              {!check.canDo && check.reason && (
                <div className="mt-1 text-xs text-red-400">{check.reason}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* 카드 선택 (필요한 경우) */}
      {needsCardSelection && selectedActivity && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            대상 카드 선택
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {cards.map(card => {
              const character = CHARACTERS_BY_ID[card.cardId];
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
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 실행 버튼 */}
      {selectedActivity && (
        <button
          onClick={handleExecute}
          disabled={!canPerform || (!!needsCardSelection && !selectedCard)}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            canPerform && (!needsCardSelection || !!selectedCard)
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedOption?.icon} {selectedOption?.label} 실행
        </button>
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
// AP 인디케이터 (헤더용)
// ========================================

export const APIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentAP, maxAP } = useActivityStore();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-gray-400">AP</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxAP }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-3 rounded-sm ${i < currentAP ? 'bg-blue-500' : 'bg-gray-600'}`}
          />
        ))}
      </div>
      <span className="text-xs text-white">{currentAP}</span>
    </div>
  );
};

export default ActivityPanel;

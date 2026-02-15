// ========================================
// 코칭 패널 컴포넌트 (Phase 5)
// 카드별 전투 전략 설정 UI
// ========================================

import React, { useState, useMemo } from 'react';
import type { CoachingStrategy, PlayerCard, Stats } from '../../types';
import { COACHING_EFFECTS } from '../../types';
import { useCoachingStore, getAllStrategies, getStrategyDescription } from '../../stores/coachingStore';
import { CHARACTERS_BY_ID } from '../../data/characters';

// ========================================
// 스탯 미리보기 유틸리티
// ========================================

/**
 * 카드의 현재 스탯 계산 (기본 + 보너스)
 */
function getCardCurrentStats(card: PlayerCard): Stats {
  const character = CHARACTERS_BY_ID[card.cardId];
  if (!character) {
    return { atk: 100, def: 100, spd: 100, ce: 100, hp: 1000, crt: 10, tec: 10, mnt: 10 };
  }

  const baseStats = character.baseStats;
  const bonusStats = card.bonusStats || { atk: 0, def: 0, spd: 0, ce: 0, hp: 0, crt: 0, tec: 0, mnt: 0 };

  return {
    atk: baseStats.atk + (bonusStats.atk || 0),
    def: baseStats.def + (bonusStats.def || 0),
    spd: baseStats.spd + (bonusStats.spd || 0),
    ce: baseStats.ce + (bonusStats.ce || 0),
    hp: baseStats.hp + (bonusStats.hp || 0),
    crt: (baseStats as Stats).crt || 10 + (bonusStats.crt || 0),
    tec: (baseStats as Stats).tec || 10 + (bonusStats.tec || 0),
    mnt: (baseStats as Stats).mnt || 10 + (bonusStats.mnt || 0),
  };
}

/**
 * 전략 적용 후 스탯 계산
 */
function applyStrategyToStats(
  stats: Stats,
  strategy: CoachingStrategy
): { stats: Stats; hpMod: number; gaugeStart: number } {
  const effect = COACHING_EFFECTS[strategy];
  const { statMods } = effect;

  const newStats = { ...stats };
  let hpMod = 1;
  let gaugeStart = 0;

  if (statMods.atk !== undefined) {
    newStats.atk = Math.floor(stats.atk * statMods.atk);
  }
  if (statMods.def !== undefined) {
    newStats.def = Math.floor(stats.def * statMods.def);
  }
  if (statMods.spd !== undefined) {
    newStats.spd = Math.floor(stats.spd * statMods.spd);
  }
  if (statMods.ce !== undefined) {
    newStats.ce = Math.floor(stats.ce * statMods.ce);
  }
  if (statMods.hpMod !== undefined) {
    hpMod = statMods.hpMod;
    newStats.hp = Math.floor(stats.hp * statMods.hpMod);
  }
  if (statMods.gaugeStart !== undefined) {
    gaugeStart = statMods.gaugeStart;
  }

  return { stats: newStats, hpMod, gaugeStart };
}

/**
 * 스탯 변화량 포맷팅
 */
function formatStatChange(before: number, after: number): { text: string; color: string } {
  const diff = after - before;
  if (diff > 0) {
    return { text: `+${diff}`, color: 'text-green-400' };
  } else if (diff < 0) {
    return { text: `${diff}`, color: 'text-red-400' };
  }
  return { text: '±0', color: 'text-gray-500' };
}

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
    // 컴팩트 모드: 카드 선택 + 전략 선택을 한 줄에 + 스탯 미리보기
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

            // 스탯 미리보기 계산
            const currentStats = getCardCurrentStats(card);
            const preview = applyStrategyToStats(currentStats, currentStrategy);

            // 변화하는 스탯만 표시
            const statChanges: string[] = [];
            if (preview.stats.atk !== currentStats.atk) {
              const diff = preview.stats.atk - currentStats.atk;
              statChanges.push(`ATK${diff > 0 ? '+' : ''}${diff}`);
            }
            if (preview.stats.def !== currentStats.def) {
              const diff = preview.stats.def - currentStats.def;
              statChanges.push(`DEF${diff > 0 ? '+' : ''}${diff}`);
            }
            if (preview.stats.spd !== currentStats.spd) {
              const diff = preview.stats.spd - currentStats.spd;
              statChanges.push(`SPD${diff > 0 ? '+' : ''}${diff}`);
            }
            if (preview.stats.ce !== currentStats.ce) {
              const diff = preview.stats.ce - currentStats.ce;
              statChanges.push(`CE${diff > 0 ? '+' : ''}${diff}`);
            }
            if (preview.stats.hp !== currentStats.hp) {
              const diff = preview.stats.hp - currentStats.hp;
              statChanges.push(`HP${diff > 0 ? '+' : ''}${diff}`);
            }
            if (preview.gaugeStart > 0) {
              statChanges.push(`게이지+${preview.gaugeStart}%`);
            }

            return (
              <div key={card.cardId} className="bg-gray-700/50 rounded p-2">
                <div className="flex items-center gap-2">
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

                  <div className="flex-shrink-0 text-lg">
                    {effect.icon}
                  </div>
                </div>

                {/* 스탯 변화 미리보기 (컴팩트) */}
                {statChanges.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {statChanges.map((change, idx) => {
                      const isPositive = change.includes('+');
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] px-1 py-0.5 rounded ${
                            isPositive
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {change}
                        </span>
                      );
                    })}
                  </div>
                )}
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
        <StrategySelectionWithPreview
          cardId={selectedCard}
          card={cards.find(c => c.cardId === selectedCard)!}
          strategies={strategies}
          getCardStrategy={getCardStrategy}
          onStrategyChange={(strategy) => handleStrategyChange(selectedCard, strategy)}
        />
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
// 전략 선택 + 스탯 미리보기 컴포넌트
// ========================================

interface StrategySelectionWithPreviewProps {
  cardId: string;
  card: PlayerCard;
  strategies: Array<{
    strategy: CoachingStrategy;
    label: string;
    icon: string;
    description: string;
  }>;
  getCardStrategy: (cardId: string) => CoachingStrategy;
  onStrategyChange: (strategy: CoachingStrategy) => void;
}

const StrategySelectionWithPreview: React.FC<StrategySelectionWithPreviewProps> = ({
  cardId,
  card,
  strategies,
  getCardStrategy,
  onStrategyChange,
}) => {
  const character = CHARACTERS_BY_ID[cardId];
  const currentStrategy = getCardStrategy(cardId);

  // 현재 카드의 기본 스탯 계산
  const currentStats = useMemo(() => getCardCurrentStats(card), [card]);

  return (
    <div className="border-t border-gray-700 pt-4">
      <h4 className="text-sm font-medium text-gray-300 mb-2">
        {character?.name.ko || cardId} 전략 선택
      </h4>

      {/* 현재 스탯 표시 */}
      <div className="mb-3 p-2 bg-gray-700/30 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">현재 스탯</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-orange-400">ATK {currentStats.atk}</span>
          <span className="text-blue-400">DEF {currentStats.def}</span>
          <span className="text-yellow-400">SPD {currentStats.spd}</span>
          <span className="text-purple-400">CE {currentStats.ce}</span>
          <span className="text-green-400">HP {currentStats.hp}</span>
        </div>
      </div>

      {/* 전략 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {strategies.map(s => {
          const isActive = currentStrategy === s.strategy;
          const preview = applyStrategyToStats(currentStats, s.strategy);

          // 변화하는 스탯만 계산
          const changes: Array<{ stat: string; before: number; after: number; color: string }> = [];

          if (preview.stats.atk !== currentStats.atk) {
            changes.push({ stat: 'ATK', before: currentStats.atk, after: preview.stats.atk, color: 'text-orange-400' });
          }
          if (preview.stats.def !== currentStats.def) {
            changes.push({ stat: 'DEF', before: currentStats.def, after: preview.stats.def, color: 'text-blue-400' });
          }
          if (preview.stats.spd !== currentStats.spd) {
            changes.push({ stat: 'SPD', before: currentStats.spd, after: preview.stats.spd, color: 'text-yellow-400' });
          }
          if (preview.stats.ce !== currentStats.ce) {
            changes.push({ stat: 'CE', before: currentStats.ce, after: preview.stats.ce, color: 'text-purple-400' });
          }
          if (preview.stats.hp !== currentStats.hp) {
            changes.push({ stat: 'HP', before: currentStats.hp, after: preview.stats.hp, color: 'text-green-400' });
          }

          return (
            <button
              key={s.strategy}
              onClick={() => onStrategyChange(s.strategy)}
              className={`p-3 rounded-lg border transition-all text-left ${
                isActive
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              {/* 전략 헤더 */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{s.icon}</span>
                <span className="font-medium text-white">{s.label}</span>
                {isActive && <span className="text-green-400 text-xs ml-auto">적용 중</span>}
              </div>

              {/* 스탯 변화 미리보기 */}
              {changes.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {changes.map(change => {
                    const diff = formatStatChange(change.before, change.after);
                    return (
                      <div key={change.stat} className="flex items-center justify-between text-xs">
                        <span className={change.color}>{change.stat}</span>
                        <span className="text-gray-400">
                          {change.before} → <span className={diff.color}>{change.after}</span>
                          <span className={`ml-1 ${diff.color}`}>({diff.text})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-1">변화 없음</div>
              )}

              {/* 궁극기 게이지 시작 표시 */}
              {preview.gaugeStart > 0 && (
                <div className="mt-2 text-xs text-cyan-400">
                  궁극기 시작 게이지 +{preview.gaugeStart}%
                </div>
              )}
            </button>
          );
        })}
      </div>
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

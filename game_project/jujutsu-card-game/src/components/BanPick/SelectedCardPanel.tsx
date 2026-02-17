// ========================================
// 선택된 카드 정보 패널
// 카드 선택 시 8스탯 레이더 차트, 필살기 정보 표시
// 마이스타크래프트 스타일: 경기장별 스탯 변화 수치 표시
// ========================================

import { motion } from 'framer-motion';
import type { CharacterCard, PlayerCard, Arena } from '../../types';
import { ATTRIBUTES, ATTRIBUTE_ADVANTAGE } from '../../data/constants';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import type { Attribute } from '../../types';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';
import { FORM_CONFIG, getConditionIcon } from '../../data/growthSystem';
import { analyzeArenaEffects, getRecommendationBadge } from '../../utils/arenaEffectAnalyzer';
import { useState } from 'react';

// 8스탯 정의
const STAT_CONFIG = [
  { key: 'atk', label: '공격', shortLabel: 'ATK', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '⚔️' },
  { key: 'def', label: '방어', shortLabel: 'DEF', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: '🛡️' },
  { key: 'spd', label: '속도', shortLabel: 'SPD', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: '⚡' },
  { key: 'hp', label: 'HP', shortLabel: 'HP', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: '❤️' },
  { key: 'ce', label: '주술', shortLabel: 'CE', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: '🔮' },
  { key: 'crt', label: '치명타', shortLabel: 'CRT', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: '💥' },
  { key: 'tec', label: '테크닉', shortLabel: 'TEC', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', icon: '🎯' },
  { key: 'mnt', label: '정신력', shortLabel: 'MNT', color: 'text-pink-400', bgColor: 'bg-pink-500/20', icon: '🧠' },
] as const;

// 경기장 효과로 인한 스탯 변화 계산
function calculateArenaStatModifiers(
  character: CharacterCard,
  arena: Arena
): Record<string, number> {
  const modifiers: Record<string, number> = {};

  for (const effect of arena.effects) {
    const isTargetAll = effect.target === 'ALL';
    const isTargetAttribute = effect.target === character.attribute;

    if (isTargetAll || isTargetAttribute) {
      if (effect.stat) {
        // 특정 스탯에만 영향
        modifiers[effect.stat] = (modifiers[effect.stat] || 0) + effect.value;
      } else {
        // 전체 스탯에 영향
        for (const stat of STAT_CONFIG) {
          modifiers[stat.key] = (modifiers[stat.key] || 0) + effect.value;
        }
      }
    }
  }

  return modifiers;
}

interface SelectedCardPanelProps {
  character: CharacterCard;
  playerCard?: PlayerCard;
  arenas: Arena[];
  onClose?: () => void;
}

export function SelectedCardPanel({
  character,
  playerCard,
  arenas,
  onClose
}: SelectedCardPanelProps) {
  const [imageError, setImageError] = useState(false);
  const [selectedArenaIndex, setSelectedArenaIndex] = useState<number | null>(null);
  const attrInfo = ATTRIBUTES[character.attribute];

  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(character.id, character.name.ko, character.attribute);

  const level = playerCard?.level ?? 1;
  const conditionValue = playerCard?.condition
    ? (typeof playerCard.condition === 'object' ? playerCard.condition.value : playerCard.condition)
    : 100;
  const currentForm = playerCard?.currentForm ?? 'STABLE';
  const formConfig = FORM_CONFIG[currentForm];

  // 스탯 값 가져오기
  const stats = character.baseStats as unknown as Record<string, number>;

  // 선택된 경기장의 스탯 모디파이어 계산
  const selectedArena = selectedArenaIndex !== null ? arenas[selectedArenaIndex] : null;
  const arenaModifiers = selectedArena ? calculateArenaStatModifiers(character, selectedArena) : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/30 rounded-xl p-4"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">👆</span>
          <div>
            <div className="font-bold text-accent text-lg">{character.name.ko} 선택됨</div>
            <div className="text-xs text-text-secondary">위 경기장 슬롯을 클릭하여 배치하세요</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 좌측: 카드 이미지 + 기본 정보 */}
        <div className="flex gap-4">
          {/* 미니 이미지 */}
          <div
            className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 relative"
            style={{ backgroundColor: `${attrInfo.color}30` }}
          >
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">{attrInfo.icon}</span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={character.name.ko}
                className="w-full h-full object-cover object-top"
                onError={() => setImageError(true)}
              />
            )}
            <div className="absolute bottom-1 left-1">
              <GradeBadge grade={character.grade} size="sm" />
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <AttributeBadge attribute={character.attribute} size="md" />
              <span className="text-accent font-bold">Lv.{level}</span>
            </div>

            {/* 폼 & 컨디션 */}
            <div className="flex items-center gap-2">
              <span
                className="text-sm px-2 py-0.5 rounded"
                style={{ backgroundColor: `${formConfig.color}20`, color: formConfig.color }}
              >
                {formConfig.icon} {formConfig.name}
              </span>
              <span className="text-sm text-text-secondary">
                {getConditionIcon(conditionValue)} {conditionValue}%
              </span>
            </div>

            {/* 필살기 요약 */}
            <div className="text-xs text-text-secondary">
              <span className="text-purple-400">⚡ {character.ultimateSkill?.name || character.skill.name}</span>
            </div>

            {/* 속성 상성 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-green-400 w-8 flex-shrink-0">강함</span>
                <div className="flex gap-1">
                  {ATTRIBUTE_ADVANTAGE[character.attribute as Attribute]?.map(attr => {
                    const info = ATTRIBUTES[attr];
                    return (
                      <span
                        key={attr}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${info.color}25`, color: info.color }}
                      >
                        {info.icon}{info.ko}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-red-400 w-8 flex-shrink-0">약함</span>
                <div className="flex gap-1">
                  {(Object.keys(ATTRIBUTE_ADVANTAGE) as Attribute[])
                    .filter(attr => ATTRIBUTE_ADVANTAGE[attr].includes(character.attribute as Attribute))
                    .map(attr => {
                      const info = ATTRIBUTES[attr];
                      return (
                        <span
                          key={attr}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${info.color}25`, color: info.color }}
                        >
                          {info.icon}{info.ko}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙: 8개 능력치 전체 표시 (마이스타크래프트 스타일) */}
        <div className="lg:col-span-2 bg-black/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-text-primary">📊 능력치</div>
            {selectedArena && (
              <div className="text-xs text-accent">
                {selectedArenaIndex !== null && `${selectedArenaIndex + 1}경기장 효과 적용 중`}
              </div>
            )}
          </div>

          {/* 8스탯 그리드 */}
          <div className="grid grid-cols-4 gap-2">
            {STAT_CONFIG.map(({ key, label, color, bgColor, icon }) => {
              const baseStat = stats[key] ?? 0;
              const modifier = arenaModifiers[key] || 0;
              const modifiedValue = Math.round(baseStat * (1 + modifier / 100));
              const diff = modifiedValue - baseStat;

              return (
                <div
                  key={key}
                  className={`${bgColor} rounded-lg p-2 text-center transition-all ${
                    modifier !== 0 ? 'ring-1 ring-white/20' : ''
                  }`}
                >
                  <div className="text-[10px] text-text-secondary mb-0.5">
                    {icon} {label}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-sm font-bold ${color}`}>
                      {selectedArena ? modifiedValue : baseStat}
                    </span>
                    {selectedArena && modifier !== 0 && (
                      <span className={`text-[10px] font-bold ${
                        diff > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>
                  {/* 기본값 표시 (경기장 선택 시) */}
                  {selectedArena && modifier !== 0 && (
                    <div className="text-[8px] text-text-secondary">
                      기본: {baseStat}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 총합 표시 */}
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-text-secondary">총합</span>
            <div className="flex items-center gap-2">
              {selectedArena ? (
                <>
                  <span className="text-sm font-bold text-accent">
                    {STAT_CONFIG.reduce((sum, { key }) => {
                      const baseStat = stats[key] ?? 0;
                      const modifier = arenaModifiers[key] || 0;
                      return sum + Math.round(baseStat * (1 + modifier / 100));
                    }, 0)}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    (기본: {STAT_CONFIG.reduce((sum, { key }) => sum + (stats[key] ?? 0), 0)})
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-accent">
                  {STAT_CONFIG.reduce((sum, { key }) => sum + (stats[key] ?? 0), 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 경기장별 적합도 - 클릭하여 스탯 변화 확인 */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-text-secondary">🏟️ 경기장 선택 (클릭하여 스탯 변화 확인)</div>
          {selectedArenaIndex !== null && (
            <button
              onClick={() => setSelectedArenaIndex(null)}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              선택 해제
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {arenas.slice(0, 5).map((arena, idx) => {
            const analysis = analyzeArenaEffects(character, arena);
            const badge = getRecommendationBadge(analysis.recommendation);
            const isSelected = selectedArenaIndex === idx;
            const modifiers = calculateArenaStatModifiers(character, arena);

            // 스탯 변화 요약 계산
            const statChanges = STAT_CONFIG.map(({ key }) => modifiers[key] || 0).filter(v => v !== 0);
            const hasPositive = statChanges.some(v => v > 0);
            const hasNegative = statChanges.some(v => v < 0);

            return (
              <button
                key={arena.id}
                onClick={() => setSelectedArenaIndex(isSelected ? null : idx)}
                className={`
                  p-2 rounded-lg text-center transition-all group relative cursor-pointer
                  ${isSelected
                    ? 'ring-2 ring-accent bg-accent/20 border-accent'
                    : analysis.recommendation === 'good'
                      ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20'
                      : analysis.recommendation === 'bad'
                        ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="text-[10px] text-text-secondary mb-1 truncate">
                  {idx + 1}경기 {isSelected && '✓'}
                </div>
                <div className="text-xs font-bold truncate" title={arena.name.ko}>{arena.name.ko}</div>
                <div className={`text-xs mt-1 ${badge.color}`}>
                  {badge.icon} {badge.text}
                </div>

                {/* 스탯 변화 미리보기 */}
                <div className="flex justify-center gap-1 mt-1 text-[10px]">
                  {hasPositive && <span className="text-green-400">▲</span>}
                  {hasNegative && <span className="text-red-400">▼</span>}
                  {!hasPositive && !hasNegative && <span className="text-gray-400">-</span>}
                </div>

                {/* 호버 시 상세 이유 툴팁 */}
                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-bg-primary border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-left pointer-events-none">
                  <div className="text-xs font-bold mb-2">{arena.name.ko}</div>

                  {/* 스탯 변화 상세 */}
                  {Object.keys(modifiers).length > 0 && (
                    <div className="mb-2 pb-2 border-b border-white/10">
                      <div className="text-[9px] text-text-secondary mb-1">스탯 변화</div>
                      <div className="grid grid-cols-2 gap-1">
                        {STAT_CONFIG.filter(({ key }) => modifiers[key]).map(({ key, label, icon }) => {
                          const mod = modifiers[key];
                          const baseStat = stats[key] ?? 0;
                          const finalStat = Math.round(baseStat * (1 + mod / 100));
                          const diff = finalStat - baseStat;
                          return (
                            <div key={key} className="text-[9px]">
                              <span className="text-text-secondary">{icon}{label}: </span>
                              <span className={diff > 0 ? 'text-green-400' : 'text-red-400'}>
                                {baseStat}→{finalStat} ({diff > 0 ? '+' : ''}{diff})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {analysis.positive.length > 0 && (
                    <div className="mb-1">
                      {analysis.positive.map((msg, i) => (
                        <div key={`p${i}`} className="text-[10px] text-green-400">✅ {msg}</div>
                      ))}
                    </div>
                  )}
                  {analysis.negative.length > 0 && (
                    <div className="mb-1">
                      {analysis.negative.map((msg, i) => (
                        <div key={`n${i}`} className="text-[10px] text-red-400">❌ {msg}</div>
                      ))}
                    </div>
                  )}
                  <div className="text-[9px] text-text-secondary mt-1 pt-1 border-t border-white/10">
                    💡 {analysis.tipMessage}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default SelectedCardPanel;

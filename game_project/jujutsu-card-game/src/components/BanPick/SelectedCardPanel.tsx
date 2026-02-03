// ========================================
// 선택된 카드 정보 패널
// 카드 선택 시 8스탯 레이더 차트, 필살기 정보 표시
// ========================================

import { motion } from 'framer-motion';
import type { CharacterCard, PlayerCard, Arena } from '../../types';
import { ATTRIBUTES } from '../../data/constants';
import { RadarChart } from '../UI/RadarChart';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';
import { FORM_CONFIG, getConditionIcon } from '../../data/growthSystem';
import { analyzeArenaEffects, getRecommendationBadge } from '../../utils/arenaEffectAnalyzer';
import { useState } from 'react';

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

            {/* 미니 스탯 (한글) */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="text-red-400">⚔️ 공격 {stats.atk ?? 0}</div>
              <div className="text-blue-400">🛡️ 방어 {stats.def ?? 0}</div>
              <div className="text-yellow-400">⚡ 속도 {stats.spd ?? 0}</div>
              <div className="text-purple-400">🔮 주력 {stats.ce ?? 0}</div>
            </div>
          </div>
        </div>

        {/* 중앙: 레이더 차트 (한글 + 총합) */}
        <div className="flex flex-col items-center justify-center">
          <RadarChart
            stats={character.baseStats}
            size="sm"
            showLabels={true}
            showTotal={true}
            fillColor={`${attrInfo.color}40`}
            strokeColor={attrInfo.color}
          />
          <div className="text-xs text-text-secondary mt-1">8스탯 분포</div>
        </div>

        {/* 우측: 필살기 정보 */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-bold text-purple-400">필살기</span>
          </div>
          <div className="font-bold text-text-primary mb-1 truncate">
            {character.ultimateSkill?.name || character.skill.name}
          </div>
          <div className="text-xs text-text-secondary mb-2 line-clamp-2">
            {character.ultimateSkill?.description || character.skill.description}
          </div>

          {character.ultimateSkill && (
            <div className="flex gap-2 text-xs">
              {character.ultimateSkill.damage !== undefined && (
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                  💥 {character.ultimateSkill.damage}
                </span>
              )}
              {character.ultimateSkill.ceCost !== undefined && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                  🔮 -{character.ultimateSkill.ceCost}
                </span>
              )}
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                ⚡ {character.ultimateSkill.gaugeRequired}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 경기장별 적합도 */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-sm text-text-secondary mb-2">📊 경기장별 적합도</div>
        <div className="grid grid-cols-5 gap-2">
          {arenas.slice(0, 5).map((arena, idx) => {
            const analysis = analyzeArenaEffects(character, arena);
            const badge = getRecommendationBadge(analysis.recommendation);

            return (
              <div
                key={arena.id}
                className={`
                  p-2 rounded-lg text-center transition-all group relative
                  ${analysis.recommendation === 'good'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : analysis.recommendation === 'bad'
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                <div className="text-[10px] text-text-secondary mb-1 truncate">
                  {idx + 1}경기
                </div>
                <div className="text-xs font-bold truncate" title={arena.name.ko}>{arena.name.ko}</div>
                <div className={`text-xs mt-1 ${badge.color}`}>
                  {badge.icon} {badge.text}
                </div>
                {/* 유/불리 효과 미리보기 */}
                <div className="flex justify-center gap-0.5 mt-1">
                  {analysis.positive.slice(0, 2).map((_, i) => (
                    <span key={`p${i}`} className="text-[8px] text-green-400">✅</span>
                  ))}
                  {analysis.negative.slice(0, 2).map((_, i) => (
                    <span key={`n${i}`} className="text-[8px] text-red-400">❌</span>
                  ))}
                </div>

                {/* 호버 시 상세 이유 툴팁 */}
                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-bg-primary border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-left">
                  <div className="text-xs font-bold mb-1">{arena.name.ko}</div>
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
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default SelectedCardPanel;

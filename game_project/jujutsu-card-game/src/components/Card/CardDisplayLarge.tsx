// ========================================
// 크루 선택용 확대 카드 디스플레이
// 250x350px, 8스탯 레이더 차트, 컨디션, 폼, 스킬 표시
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CharacterCard, PlayerCard } from '../../types';
import { ATTRIBUTES, GRADES } from '../../data';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { RadarChart } from '../UI/RadarChart';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';
import { FORM_CONFIG, getConditionIcon } from '../../data/growthSystem';

interface CardDisplayLargeProps {
  character: CharacterCard;
  playerCard?: PlayerCard;
  isSelected?: boolean;
  onClick?: () => void;
  showRadarChart?: boolean;
}

export function CardDisplayLarge({
  character,
  playerCard,
  isSelected = false,
  onClick,
  showRadarChart = true,
}: CardDisplayLargeProps) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[character.attribute];
  const gradeInfo = GRADES[character.grade];

  // 이미지 URL
  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(character.id, character.name.ko, character.attribute);

  const handleImageError = () => {
    setImageError(true);
  };

  const level = playerCard?.level ?? 1;

  // 컨디션 및 폼 정보
  const conditionValue = playerCard?.condition
    ? (typeof playerCard.condition === 'object' ? playerCard.condition.value : playerCard.condition)
    : 100;
  const currentForm = playerCard?.currentForm ?? 'STABLE';
  const formConfig = FORM_CONFIG[currentForm];

  return (
    <motion.div
      className={`
        w-[250px] h-[350px]
        rounded-xl overflow-hidden cursor-pointer
        border-3 transition-all duration-200
        flex flex-col
        ${isSelected ? 'border-accent ring-3 ring-accent/50 scale-105' : 'border-white/20'}
        ${onClick ? 'hover:border-accent/50' : ''}
      `}
      style={{
        background: `linear-gradient(135deg, ${gradeInfo.bg}30 0%, ${attrInfo.color}30 100%)`,
        boxShadow: isSelected ? `0 0 30px ${gradeInfo.bg}60` : `0 4px 20px rgba(0,0,0,0.4)`,
      }}
      onClick={onClick}
      whileHover={onClick ? { y: -6 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* 상단: 이미지 + 기본 정보 */}
      <div className="relative h-[140px] overflow-hidden flex-shrink-0">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${attrInfo.color}40` }}
        >
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">{attrInfo.icon}</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={character.name.ko}
              className="w-full h-full object-cover object-top"
              onError={handleImageError}
            />
          )}
        </div>

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* 상단 배지 */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <GradeBadge grade={character.grade} size="md" />
          <AttributeBadge attribute={character.attribute} size="md" />
        </div>

        {/* 하단 이름/레벨 */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-bold text-lg text-white text-shadow">
                {character.name.ko}
              </h3>
              <p className="text-xs text-white/70">{character.name.ja}</p>
            </div>
            <div className="bg-black/50 px-2 py-1 rounded-lg">
              <span className="text-accent font-mono font-bold text-sm">
                Lv.{level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 중단: 레이더 차트 + 컨디션/폼 */}
      <div className="flex-1 p-2 flex gap-2 bg-black/30">
        {/* 레이더 차트 (한글 라벨 + 총합) */}
        {showRadarChart && (
          <div className="flex-shrink-0">
            <RadarChart
              stats={character.baseStats}
              size="sm"
              showLabels={true}
              showTotal={true}
              fillColor={`${attrInfo.color}40`}
              strokeColor={attrInfo.color}
            />
          </div>
        )}

        {/* 컨디션/폼/스탯 정보 */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {/* 폼 상태 */}
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-md"
            style={{ backgroundColor: `${formConfig.color}20` }}
          >
            <span className="text-lg">{formConfig.icon}</span>
            <span
              className="text-xs font-bold"
              style={{ color: formConfig.color }}
            >
              {formConfig.name}
            </span>
          </div>

          {/* 컨디션 */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5">
            <span className="text-lg">{getConditionIcon(conditionValue)}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-text-secondary">컨디션</span>
                <span className="text-xs font-bold text-text-primary">
                  {conditionValue}%
                </span>
              </div>
              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${conditionValue}%`,
                    backgroundColor:
                      conditionValue >= 90
                        ? '#22C55E'
                        : conditionValue >= 70
                        ? '#EAB308'
                        : '#F97316',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 주요 스탯 미니 (한글) */}
          <div className="grid grid-cols-4 gap-0.5 text-[9px] px-1">
            <div className="text-red-400">⚔️ {(character.baseStats as unknown as Record<string, number>).atk ?? 0}</div>
            <div className="text-blue-400">🛡️ {(character.baseStats as unknown as Record<string, number>).def ?? 0}</div>
            <div className="text-yellow-400">⚡ {(character.baseStats as unknown as Record<string, number>).spd ?? 0}</div>
            <div className="text-purple-400">🔮 {(character.baseStats as unknown as Record<string, number>).ce ?? 0}</div>
          </div>
        </div>
      </div>

      {/* 하단: 스킬 정보 */}
      <div className="flex-shrink-0 border-t border-white/10 p-2 bg-black/40">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <div className="flex-1 min-w-0">
            <div className="text-accent font-bold text-xs truncate">
              【{character.skill.name}】
            </div>
            <div className="text-[10px] text-text-secondary truncate">
              {character.skill.description.slice(0, 40)}...
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CardDisplayLarge;

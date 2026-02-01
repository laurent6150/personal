import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CharacterCard, PlayerCard } from '../../types';
import { ATTRIBUTES, GRADES } from '../../data';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { StatsDisplay } from '../UI/StatBar';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';

interface CardDisplayProps {
  character: CharacterCard;
  playerCard?: PlayerCard;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  isUsed?: boolean;
  isFlipped?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  showSkill?: boolean;
}

export function CardDisplay({
  character,
  playerCard,
  size = 'md',
  isSelected = false,
  isUsed = false,
  isFlipped = false,
  onClick,
  showStats = true,
  showSkill = true
}: CardDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[character.attribute];
  const gradeInfo = GRADES[character.grade];

  // 이미지 URL (실제 이미지 또는 폴백)
  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(character.id, character.name.ko, character.attribute);

  const handleImageError = () => {
    setImageError(true);
  };

  // 카드 크기 설정 (스탯+스킬 포함)
  const sizes = {
    xs: { width: 'w-28', height: 'h-auto', text: 'text-[10px]', imgHeight: 'h-20' }, // 112px width, auto height (컴팩트)
    sm: { width: 'w-36', height: 'h-auto', text: 'text-xs', imgHeight: 'h-24' },     // 144px width, auto height
    md: { width: 'w-48', height: 'h-auto', text: 'text-sm', imgHeight: 'h-32' },     // 192px width, auto height
    lg: { width: 'w-60', height: 'h-auto', text: 'text-base', imgHeight: 'h-40' }    // 240px width, auto height
  };

  const level = playerCard?.level ?? 1;

  // 카드 뒷면
  if (isFlipped) {
    return (
      <motion.div
        className={`${sizes[size].width} ${sizes[size].height} rounded-xl bg-bg-card border-2 border-white/20 flex items-center justify-center`}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 180 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-4xl">🎴</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        ${sizes[size].width} ${sizes[size].height}
        rounded-xl overflow-hidden cursor-pointer
        border-2 transition-all duration-200
        ${isSelected ? 'border-accent ring-2 ring-accent/50 scale-105' : 'border-white/20'}
        ${isUsed ? 'opacity-40 grayscale' : ''}
        ${!isUsed && onClick ? 'hover:border-accent/50' : ''}
      `}
      style={{
        background: `linear-gradient(135deg, ${gradeInfo.bg}20 0%, ${attrInfo.color}20 100%)`,
        boxShadow: isSelected ? `0 0 20px ${gradeInfo.bg}50` : undefined
      }}
      onClick={!isUsed ? onClick : undefined}
      whileHover={!isUsed && onClick ? { y: -4 } : undefined}
      whileTap={!isUsed && onClick ? { scale: 0.98 } : undefined}
    >
      {/* 헤더: 등급 + 속성 */}
      <div className={`flex justify-between items-center bg-black/30 ${
        size === 'xs' ? 'p-1' : size === 'sm' ? 'p-1.5' : 'p-2'
      }`}>
        <GradeBadge grade={character.grade} size={size === 'lg' ? 'md' : 'sm'} />
        <AttributeBadge attribute={character.attribute} size={size === 'lg' ? 'md' : 'sm'} />
      </div>

      {/* 이미지 영역 - 크기별 높이 적용 */}
      <div
        className={`${sizes[size].imgHeight} flex items-center justify-center overflow-hidden relative`}
        style={{ backgroundColor: `${attrInfo.color}30` }}
      >
        {imageError ? (
          // 폴백: 속성 아이콘
          <span className={size === 'xs' ? 'text-3xl' : size === 'sm' ? 'text-4xl' : size === 'md' ? 'text-5xl' : 'text-6xl'}>
            {attrInfo.icon}
          </span>
        ) : (
          <img
            src={imageUrl}
            alt={character.name.ko}
            className="w-full h-full object-cover object-top"
            onError={handleImageError}
          />
        )}
        {/* 속성 아이콘 오버레이 (이미지가 있을 때, xs는 생략) */}
        {!imageError && size !== 'xs' && (
          <div className={`absolute bottom-1 right-1 opacity-80 bg-black/30 rounded-full p-0.5 ${
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
          }`}>
            {attrInfo.icon}
          </div>
        )}
      </div>

      {/* 이름 + 레벨 */}
      <div className={`bg-black/40 ${size === 'xs' ? 'px-1 py-0.5' : size === 'sm' ? 'px-1.5 py-1' : 'px-2 py-1.5'}`}>
        <div className="flex justify-between items-center gap-1">
          <span className={`font-bold text-text-primary truncate ${
            size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            {character.name.ko}
          </span>
          <span className={`text-accent font-mono flex-shrink-0 ${
            size === 'xs' ? 'text-[9px]' : size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'
          }`}>
            Lv.{level}
          </span>
        </div>
      </div>

      {/* 스탯 - 모든 사이즈에서 표시 */}
      {showStats && (
        <div className={size === 'xs' ? 'px-1 py-0.5' : size === 'sm' ? 'px-1 py-0.5' : size === 'md' ? 'px-1.5 py-1' : 'px-2 py-1.5'}>
          <StatsDisplay stats={character.baseStats} compact={size === 'xs' || size === 'sm' || size === 'md'} tiny={size === 'xs'} />
        </div>
      )}

      {/* 스킬 - 모든 사이즈에서 표시 */}
      {showSkill && (
        <div className={`border-t border-white/10 ${
          size === 'xs' ? 'px-1 py-0.5' : size === 'sm' ? 'px-1 py-0.5' : size === 'md' ? 'px-1.5 py-1' : 'px-2 py-1.5'
        }`}>
          <div className={`text-accent font-bold truncate ${
            size === 'xs' ? 'text-[9px]' : size === 'sm' ? 'text-[10px]' : 'text-xs'
          }`}>
            【{character.skill.name}】
          </div>
        </div>
      )}
    </motion.div>
  );
}

// 카드 미니 버전 (리스트용)
interface CardMiniProps {
  character: CharacterCard;
  playerCard?: PlayerCard;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CardMini({ character, playerCard, isSelected, onClick }: CardMiniProps) {
  const attrInfo = ATTRIBUTES[character.attribute];
  const level = playerCard?.level ?? 1;

  return (
    <motion.div
      className={`
        flex items-center gap-2 p-2 rounded-lg cursor-pointer
        bg-bg-card border transition-all
        ${isSelected ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/30'}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-xl">{attrInfo.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text-primary truncate">
          {character.name.ko}
        </div>
        <div className="text-xs text-text-secondary">
          {character.grade}등급 · Lv.{level}
        </div>
      </div>
      <GradeBadge grade={character.grade} size="sm" />
    </motion.div>
  );
}

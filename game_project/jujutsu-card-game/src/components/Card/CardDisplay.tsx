import { motion } from 'framer-motion';
import type { CharacterCard, PlayerCard } from '../../types';
import { ATTRIBUTES, GRADES } from '../../data';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { StatsDisplay } from '../UI/StatBar';

interface CardDisplayProps {
  character: CharacterCard;
  playerCard?: PlayerCard;
  size?: 'sm' | 'md' | 'lg';
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
  const attrInfo = ATTRIBUTES[character.attribute];
  const gradeInfo = GRADES[character.grade];

  const sizes = {
    sm: { width: 'w-32', height: 'h-44', text: 'text-xs' },
    md: { width: 'w-44', height: 'h-60', text: 'text-sm' },
    lg: { width: 'w-56', height: 'h-76', text: 'text-base' }
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
      <div className="flex justify-between items-center p-2 bg-black/30">
        <GradeBadge grade={character.grade} size={size === 'sm' ? 'sm' : 'md'} />
        <AttributeBadge attribute={character.attribute} size={size === 'sm' ? 'sm' : 'md'} />
      </div>

      {/* 이미지 영역 */}
      <div
        className="h-20 flex items-center justify-center text-4xl"
        style={{ backgroundColor: `${attrInfo.color}30` }}
      >
        {attrInfo.icon}
      </div>

      {/* 이름 + 레벨 */}
      <div className="px-2 py-1 bg-black/40">
        <div className="flex justify-between items-center">
          <span className={`${sizes[size].text} font-bold text-text-primary truncate`}>
            {character.name.ko}
          </span>
          <span className={`${sizes[size].text} text-accent font-mono`}>
            Lv.{level}
          </span>
        </div>
      </div>

      {/* 스탯 */}
      {showStats && size !== 'sm' && (
        <div className="px-2 py-1">
          <StatsDisplay stats={character.baseStats} compact={size === 'md'} />
        </div>
      )}

      {/* 스킬 */}
      {showSkill && size === 'lg' && (
        <div className="px-2 py-1 border-t border-white/10">
          <div className="text-xs text-accent font-bold">
            【{character.skill.name}】
          </div>
          <div className="text-xs text-text-secondary line-clamp-2">
            {character.skill.description}
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

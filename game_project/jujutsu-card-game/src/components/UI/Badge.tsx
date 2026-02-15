import type { LegacyGrade, Attribute, Rarity } from '../../types';
import { GRADES, ATTRIBUTES } from '../../data';

interface GradeBadgeProps {
  grade: LegacyGrade;
  size?: 'sm' | 'md' | 'lg';
}

export function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const gradeInfo = GRADES[grade];

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 min-w-5',
    md: 'text-xs px-2 py-1 min-w-7',
    lg: 'text-sm px-2.5 py-1 min-w-9'
  };

  return (
    <span
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shadow-md whitespace-nowrap`}
      style={{
        backgroundColor: gradeInfo.bg,
        color: gradeInfo.text
      }}
    >
      {grade}
    </span>
  );
}

interface AttributeBadgeProps {
  attribute: Attribute;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AttributeBadge({ attribute, showLabel = true, size = 'md' }: AttributeBadgeProps) {
  const attrInfo = ATTRIBUTES[attribute];

  const sizes = {
    sm: showLabel ? 'text-[10px] px-1.5 py-0.5 gap-0.5' : 'text-sm px-1.5 py-0.5 gap-0.5',
    md: showLabel ? 'text-xs px-2 py-0.5 gap-1' : 'text-base px-2 py-0.5 gap-1',
    lg: showLabel ? 'text-sm px-3 py-1 gap-1' : 'text-lg px-3 py-1 gap-1'
  };

  return (
    <span
      className={`${sizes[size]} rounded-full flex items-center font-bold shadow-md whitespace-nowrap`}
      style={{
        backgroundColor: `${attrInfo.color}40`,
        color: attrInfo.color,
        border: `1px solid ${attrInfo.color}80`,
        textShadow: `0 0 6px ${attrInfo.color}60`
      }}
    >
      <span>{attrInfo.icon}</span>
      {showLabel && <span>{attrInfo.ko}</span>}
    </span>
  );
}

interface WinnerBadgeProps {
  winner: 'PLAYER' | 'AI' | 'DRAW';
}

export function WinnerBadge({ winner }: WinnerBadgeProps) {
  const config = {
    PLAYER: { text: '승리!', color: 'var(--color-win)', bg: 'rgba(76, 175, 80, 0.2)' },
    AI: { text: '패배', color: 'var(--color-lose)', bg: 'rgba(244, 67, 54, 0.2)' },
    DRAW: { text: '무승부', color: 'var(--color-draw)', bg: 'rgba(255, 193, 7, 0.2)' }
  };

  const { text, color, bg } = config[winner];

  return (
    <span
      className="px-4 py-2 rounded-lg text-xl font-bold"
      style={{ backgroundColor: bg, color }}
    >
      {text}
    </span>
  );
}

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY_CONFIG: Record<Rarity, { text: string; color: string; bg: string }> = {
  LEGENDARY: { text: '전설', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.2)' },
  EPIC: { text: '영웅', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.2)' },
  RARE: { text: '희귀', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)' },
  COMMON: { text: '일반', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.2)' }
};

export function RarityBadge({ rarity, size = 'md' }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity];

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  return (
    <span
      className={`${sizes[size]} rounded font-bold`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}`
      }}
    >
      {config.text}
    </span>
  );
}

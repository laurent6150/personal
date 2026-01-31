import type { Grade, Attribute } from '../../types';
import { GRADES, ATTRIBUTES } from '../../data';

interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
}

export function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const gradeInfo = GRADES[grade];

  const sizes = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base'
  };

  return (
    <span
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shadow-md`}
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

export function AttributeBadge({ attribute, showLabel = false, size = 'md' }: AttributeBadgeProps) {
  const attrInfo = ATTRIBUTES[attribute];

  const sizes = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-lg px-4 py-1.5'
  };

  return (
    <span
      className={`${sizes[size]} rounded-full flex items-center gap-1 font-medium`}
      style={{
        backgroundColor: `${attrInfo.color}30`,
        color: attrInfo.color,
        border: `1px solid ${attrInfo.color}`
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

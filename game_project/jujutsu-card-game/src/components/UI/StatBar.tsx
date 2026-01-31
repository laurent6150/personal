import { STAT_ICONS, STAT_NAMES } from '../../data';
import type { Stats } from '../../types';

interface StatBarProps {
  stat: keyof Stats;
  value: number;
  maxValue?: number;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function StatBar({
  stat,
  value,
  maxValue = 30,
  showLabel = true,
  showIcon = true,
  size = 'md'
}: StatBarProps) {
  const percentage = Math.min(100, (value / maxValue) * 100);

  const colors: Record<keyof Stats, string> = {
    atk: '#E74C3C',
    def: '#3498DB',
    spd: '#F1C40F',
    ce: '#9B59B6',
    hp: '#E91E63'
  };

  const sizes = {
    sm: { bar: 'h-1.5', text: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm' }
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <span className={sizes[size].text}>{STAT_ICONS[stat]}</span>
      )}
      {showLabel && (
        <span className={`${sizes[size].text} text-text-secondary w-8`}>
          {STAT_NAMES[stat].slice(0, 2)}
        </span>
      )}
      <div className={`flex-1 bg-white/10 rounded-full ${sizes[size].bar}`}>
        <div
          className={`${sizes[size].bar} rounded-full transition-all duration-300`}
          style={{
            width: `${percentage}%`,
            backgroundColor: colors[stat]
          }}
        />
      </div>
      <span className={`${sizes[size].text} text-text-primary w-6 text-right font-mono`}>
        {value}
      </span>
    </div>
  );
}

interface StatsDisplayProps {
  stats: Stats;
  compact?: boolean;
}

export function StatsDisplay({ stats, compact = false }: StatsDisplayProps) {
  const statKeys: (keyof Stats)[] = ['atk', 'def', 'spd', 'ce', 'hp'];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 text-sm">
        {statKeys.map(stat => (
          <span key={stat} className="flex items-center gap-1">
            <span>{STAT_ICONS[stat]}</span>
            <span className="font-mono">{stats[stat]}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {statKeys.map(stat => (
        <StatBar key={stat} stat={stat} value={stats[stat]} size="sm" />
      ))}
    </div>
  );
}

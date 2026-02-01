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
  tiny?: boolean;
}

export function StatsDisplay({ stats, compact = false, tiny = false }: StatsDisplayProps) {
  const statKeys: (keyof Stats)[] = ['atk', 'def', 'spd', 'ce', 'hp'];

  // tiny: xs 카드용 초소형 스탯 (2줄 표시)
  if (tiny) {
    return (
      <div className="text-[8px] leading-tight">
        <div className="flex justify-between gap-0.5">
          <span>⚔{stats.atk}</span>
          <span>🛡{stats.def}</span>
          <span>⚡{stats.spd}</span>
        </div>
        <div className="flex justify-between gap-0.5">
          <span>💜{stats.ce}</span>
          <span>❤{stats.hp}</span>
        </div>
      </div>
    );
  }

  // compact: sm/md 카드용 한 줄 스탯
  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
        {statKeys.map(stat => (
          <span key={stat} className="flex items-center gap-0.5">
            <span>{STAT_ICONS[stat]}</span>
            <span className="font-mono">{stats[stat]}</span>
          </span>
        ))}
      </div>
    );
  }

  // full: lg 카드용 바 형태
  return (
    <div className="space-y-1.5">
      {statKeys.map(stat => (
        <StatBar key={stat} stat={stat} value={stats[stat]} size="sm" />
      ))}
    </div>
  );
}

import { STAT_ICONS, STAT_NAMES } from '../../data';
import type { Stats, BaseStats, LegacyStatKey } from '../../types';

// 8스탯 색상 정의
const STAT_BAR_COLORS: Record<string, string> = {
  atk: '#E74C3C',  // 빨강
  def: '#3498DB',  // 파랑
  spd: '#F1C40F',  // 노랑
  ce: '#9B59B6',   // 보라
  hp: '#E91E63',   // 핑크
  crt: '#EC4899',  // 분홍
  tec: '#14B8A6',  // 청록
  mnt: '#6366F1'   // 인디고
};

interface StatBarProps {
  stat: string;  // keyof Stats 또는 문자열
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

  const sizes = {
    sm: { bar: 'h-1.5', text: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm' }
  };

  const icon = (STAT_ICONS as Record<string, string>)[stat] || '📊';
  const name = (STAT_NAMES as Record<string, string>)[stat] || stat;
  const color = STAT_BAR_COLORS[stat] || '#888888';

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <span className={sizes[size].text}>{icon}</span>
      )}
      {showLabel && (
        <span className={`${sizes[size].text} text-text-secondary w-8`}>
          {name.slice(0, 2)}
        </span>
      )}
      <div className={`flex-1 bg-white/10 rounded-full ${sizes[size].bar}`}>
        <div
          className={`${sizes[size].bar} rounded-full transition-all duration-300`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color
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
  stats: BaseStats;  // LegacyStats (5스탯) 또는 Stats (8스탯) 모두 지원
  compact?: boolean;
  tiny?: boolean;
  showAllStats?: boolean;  // 8스탯 모두 표시
}

export function StatsDisplay({ stats, compact = false, tiny = false, showAllStats = false }: StatsDisplayProps) {
  // 기본 5스탯
  const coreStatKeys: LegacyStatKey[] = ['atk', 'def', 'spd', 'ce', 'hp'];
  // 신규 3스탯
  const newStatKeys: (keyof Stats)[] = ['crt', 'tec', 'mnt'];
  // 표시할 스탯 키
  const displayKeys = showAllStats ? [...coreStatKeys, ...newStatKeys] : coreStatKeys;

  // 스탯값 안전하게 가져오기 (신규 스탯이 없을 수 있음)
  const getStatValue = (key: string): number => {
    return (stats as unknown as Record<string, number>)[key] ?? 0;
  };

  // tiny: xs 카드용 초소형 스탯 (2줄 표시)
  if (tiny) {
    return (
      <div className="text-[8px] leading-tight">
        <div className="flex justify-between gap-0.5">
          <span>⚔{getStatValue('atk')}</span>
          <span>🛡{getStatValue('def')}</span>
          <span>⚡{getStatValue('spd')}</span>
        </div>
        <div className="flex justify-between gap-0.5">
          <span>🔮{getStatValue('ce')}</span>
          <span>❤{getStatValue('hp')}</span>
        </div>
      </div>
    );
  }

  // compact: sm/md 카드용 한 줄 스탯
  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
        {displayKeys.map(stat => (
          <span key={stat} className="flex items-center gap-0.5">
            <span>{STAT_ICONS[stat]}</span>
            <span className="font-mono">{getStatValue(stat)}</span>
          </span>
        ))}
      </div>
    );
  }

  // full: lg 카드용 바 형태
  return (
    <div className="space-y-1.5">
      {displayKeys.map(stat => (
        <StatBar key={stat} stat={stat} value={getStatValue(stat)} size="sm" />
      ))}
    </div>
  );
}

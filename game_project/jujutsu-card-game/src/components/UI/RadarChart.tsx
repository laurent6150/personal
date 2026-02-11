// ========================================
// 8각형 레이더 차트 컴포넌트
// 8스탯을 시각적으로 표시
// ========================================

import type { BaseStats } from '../../types';

interface RadarChartProps {
  stats: BaseStats;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showValues?: boolean;
  showTotal?: boolean;  // 중앙에 능력치 총합 표시
  maxValue?: number;
  fillColor?: string;
  strokeColor?: string;
}

// 8스탯 레이블 (한글)
const STAT_LABELS = [
  { key: 'atk', label: '공격', color: '#E74C3C' },
  { key: 'def', label: '방어', color: '#3498DB' },
  { key: 'spd', label: '속도', color: '#F1C40F' },
  { key: 'ce', label: '주력', color: '#9B59B6' },
  { key: 'hp', label: '체력', color: '#E91E63' },
  { key: 'crt', label: '치명', color: '#EC4899' },
  { key: 'tec', label: '기술', color: '#14B8A6' },
  { key: 'mnt', label: '정신', color: '#6366F1' },
];

// 사이즈별 설정
const SIZE_CONFIG = {
  sm: { width: 100, height: 100, radius: 35, fontSize: 8, valueFontSize: 7 },
  md: { width: 160, height: 160, radius: 55, fontSize: 10, valueFontSize: 9 },
  lg: { width: 220, height: 220, radius: 80, fontSize: 12, valueFontSize: 10 },
};

export function RadarChart({
  stats,
  size = 'md',
  showLabels = true,
  showValues = false,
  showTotal = false,
  maxValue = 30,
  fillColor = 'rgba(139, 92, 246, 0.3)',
  strokeColor = '#8B5CF6',
}: RadarChartProps) {
  const config = SIZE_CONFIG[size];
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const numPoints = STAT_LABELS.length;
  const angleStep = (2 * Math.PI) / numPoints;

  // 스탯값 안전하게 가져오기
  const getStatValue = (key: string): number => {
    return (stats as unknown as Record<string, number>)[key] ?? 0;
  };

  // 총합 계산
  const total = STAT_LABELS.reduce((sum, stat) => {
    return sum + getStatValue(stat.key);
  }, 0);

  // 각도에 따른 좌표 계산 (위쪽에서 시작, 시계방향)
  const getPoint = (index: number, value: number, radius: number) => {
    const angle = (index * angleStep) - (Math.PI / 2); // 위쪽에서 시작
    const normalizedValue = Math.min(value / maxValue, 1);
    const x = centerX + Math.cos(angle) * radius * normalizedValue;
    const y = centerY + Math.sin(angle) * radius * normalizedValue;
    return { x, y };
  };

  // 배경 그리드 생성 (동심원)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // 데이터 포인트 생성
  const dataPoints = STAT_LABELS.map((stat, index) => {
    const value = getStatValue(stat.key);
    return getPoint(index, value, config.radius);
  });

  // 폴리곤 경로 생성
  const polygonPath = dataPoints.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${config.width} ${config.height}`}
      className="drop-shadow-lg"
    >
      {/* 배경 */}
      <rect
        x="0"
        y="0"
        width={config.width}
        height={config.height}
        fill="transparent"
      />

      {/* 그리드 동심원 */}
      {gridLevels.map((level, idx) => {
        const gridPoints = STAT_LABELS.map((_, index) =>
          getPoint(index, maxValue * level, config.radius)
        );
        const gridPath = gridPoints.map((point, index) =>
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ') + ' Z';
        return (
          <path
            key={idx}
            d={gridPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={idx === gridLevels.length - 1 ? 1.5 : 0.5}
          />
        );
      })}

      {/* 축 선 */}
      {STAT_LABELS.map((_, index) => {
        const endPoint = getPoint(index, maxValue, config.radius);
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* 데이터 영역 */}
      <path
        d={polygonPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* 데이터 포인트 */}
      {dataPoints.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={size === 'sm' ? 2 : size === 'md' ? 3 : 4}
          fill={STAT_LABELS[index].color}
          stroke="#fff"
          strokeWidth={1}
        />
      ))}

      {/* 레이블 */}
      {showLabels && STAT_LABELS.map((stat, index) => {
        const labelPoint = getPoint(index, maxValue * 1.35, config.radius);
        return (
          <text
            key={stat.key}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={stat.color}
            fontSize={config.fontSize}
            fontWeight="bold"
            className="drop-shadow-sm"
          >
            {stat.label}
          </text>
        );
      })}

      {/* 수치 표시 */}
      {showValues && STAT_LABELS.map((stat, index) => {
        const value = getStatValue(stat.key);
        const valuePoint = getPoint(index, maxValue * 1.15, config.radius);
        return (
          <text
            key={`value-${stat.key}`}
            x={valuePoint.x}
            y={valuePoint.y + (config.fontSize * 1.2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={config.valueFontSize}
            className="opacity-80"
          >
            {value}
          </text>
        );
      })}

      {/* 중앙 총합 표시 */}
      {showTotal && (
        <>
          <text
            x={centerX}
            y={centerY - (size === 'sm' ? 3 : size === 'md' ? 5 : 7)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={size === 'sm' ? 14 : size === 'md' ? 20 : 26}
            fontWeight="bold"
            className="drop-shadow-lg"
          >
            {total}
          </text>
          <text
            x={centerX}
            y={centerY + (size === 'sm' ? 8 : size === 'md' ? 12 : 16)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#aaa"
            fontSize={size === 'sm' ? 6 : size === 'md' ? 8 : 10}
          >
            총합
          </text>
        </>
      )}
    </svg>
  );
}

export default RadarChart;

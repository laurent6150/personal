// ========================================
// 생애주기 인디케이터 컴포넌트 (Phase 5)
// 카드의 현재 커리어 페이즈를 표시
// ========================================

import React from 'react';
import type { CareerPhase, LegacyGrade } from '../../types';
import { CAREER_PHASE_INFO, getSeasonsUntilNextPhase } from '../../utils/salarySystem';

interface CareerPhaseIndicatorProps {
  phase: CareerPhase;
  grade?: LegacyGrade;
  seasonsInCrew?: number;
  compact?: boolean;       // 컴팩트 모드 (아이콘만)
  showRemaining?: boolean; // 다음 단계까지 남은 시즌 표시
  className?: string;
}

export const CareerPhaseIndicator: React.FC<CareerPhaseIndicatorProps> = ({
  phase,
  grade,
  seasonsInCrew,
  compact = false,
  showRemaining = false,
  className = '',
}) => {
  const info = CAREER_PHASE_INFO[phase];

  // 다음 단계까지 남은 시즌 계산
  let remainingSeasons: number | null = null;
  if (showRemaining && grade && seasonsInCrew !== undefined) {
    remainingSeasons = getSeasonsUntilNextPhase(grade, seasonsInCrew, phase);
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${className}`}
        style={{ backgroundColor: `${info.color}20`, color: info.color }}
        title={`${info.label}${remainingSeasons !== null ? ` (${remainingSeasons}시즌 후 변화)` : ''}`}
      >
        {info.icon}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium"
        style={{
          backgroundColor: `${info.color}20`,
          color: info.color,
          border: `1px solid ${info.color}40`,
        }}
      >
        <span>{info.icon}</span>
        <span>{info.label}</span>
      </span>

      {showRemaining && remainingSeasons !== null && remainingSeasons > 0 && (
        <span className="text-xs text-gray-400">
          ({remainingSeasons}시즌 후 변화)
        </span>
      )}
    </div>
  );
};

// ========================================
// 생애주기 프로그레스 바
// ========================================

interface CareerPhaseProgressProps {
  phase: CareerPhase;
  grade: LegacyGrade;
  seasonsInCrew: number;
  className?: string;
}

export const CareerPhaseProgress: React.FC<CareerPhaseProgressProps> = ({
  phase,
  grade,
  seasonsInCrew,
  className = '',
}) => {
  const info = CAREER_PHASE_INFO[phase];

  // 전체 커리어 단계
  const phases: CareerPhase[] = ['ROOKIE', 'GROWTH', 'PEAK', 'DECLINE', 'RETIREMENT_ELIGIBLE'];
  const currentIndex = phases.indexOf(phase);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 단계 표시 */}
      <div className="flex items-center justify-between">
        {phases.map((p, index) => {
          const pInfo = CAREER_PHASE_INFO[p];
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <div
              key={p}
              className="flex flex-col items-center"
              style={{ width: '20%' }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  isActive ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''
                }`}
                style={{
                  backgroundColor: isPast || isActive ? pInfo.color : '#374151',
                  color: isPast || isActive ? '#fff' : '#9CA3AF',
                  ...(isActive && { '--tw-ring-color': pInfo.color } as React.CSSProperties),
                }}
              >
                {pInfo.icon}
              </div>
              <span
                className={`mt-1 text-xs ${isActive ? 'font-bold' : ''}`}
                style={{ color: isActive ? pInfo.color : '#9CA3AF' }}
              >
                {pInfo.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 진행 바 */}
      <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute h-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 0.5) / phases.length) * 100}%`,
            backgroundColor: info.color,
          }}
        />
      </div>

      {/* 현재 상태 설명 */}
      <div className="text-center text-sm text-gray-400">
        소속 {seasonsInCrew}시즌 째
        {phase !== 'RETIREMENT_ELIGIBLE' && (
          <span className="ml-2">
            (다음 단계까지 {getSeasonsUntilNextPhase(grade, seasonsInCrew, phase)}시즌)
          </span>
        )}
      </div>
    </div>
  );
};

// ========================================
// 생애주기 배지 (간단 표시용)
// ========================================

interface CareerPhaseBadgeProps {
  phase: CareerPhase;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CareerPhaseBadge: React.FC<CareerPhaseBadgeProps> = ({
  phase,
  size = 'md',
  className = '',
}) => {
  const info = CAREER_PHASE_INFO[phase];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${info.color}20`,
        color: info.color,
      }}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
};

export default CareerPhaseIndicator;

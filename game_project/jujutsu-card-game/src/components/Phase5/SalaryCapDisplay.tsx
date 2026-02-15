// ========================================
// 샐러리캡 표시 컴포넌트 (Phase 5)
// 크루 총 연봉 및 캡 상태 표시
// Phase 5.3: 소프트캡 페널티 정보 추가
// ========================================

import React from 'react';
import { SALARY_CAP, SOFT_SALARY_CAP, SOFT_CAP_REWARD_PENALTY } from '../../data/constants';
import { calculateLuxuryTax } from '../../stores/economyStore';

interface SalaryCapDisplayProps {
  currentTotal: number;      // 현재 총 연봉
  showDetails?: boolean;     // 상세 정보 표시
  className?: string;
}

export const SalaryCapDisplay: React.FC<SalaryCapDisplayProps> = ({
  currentTotal,
  showDetails = true,
  className = '',
}) => {
  const remaining = SALARY_CAP - currentTotal;
  const percentage = Math.min((currentTotal / SALARY_CAP) * 100, 100);
  const isOverCap = currentTotal > SALARY_CAP;
  const isNearCap = currentTotal > SOFT_SALARY_CAP;

  // 상태에 따른 색상
  let statusColor = '#10B981'; // 초록 (안전)
  let statusText = '여유';
  let statusIcon = 'o';

  if (isOverCap) {
    statusColor = '#EF4444'; // 빨강 (초과)
    statusText = '초과!';
    statusIcon = '!';
  } else if (isNearCap) {
    statusColor = '#F59E0B'; // 노랑 (주의)
    statusText = '주의';
    statusIcon = '!';
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">$</span>
          <span className="font-bold text-white">샐러리캡</span>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
          }}
        >
          <span>{statusIcon}</span>
          <span>{statusText}</span>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
        {/* 소프트 캡 표시 */}
        <div
          className="absolute h-full w-0.5 bg-yellow-500/50"
          style={{ left: `${(SOFT_SALARY_CAP / SALARY_CAP) * 100}%` }}
        />

        {/* 현재 사용량 */}
        <div
          className="absolute h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>

      {/* 수치 표시 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          <span style={{ color: statusColor }} className="font-bold">
            {currentTotal.toLocaleString()}
          </span>
          <span className="mx-1">/</span>
          <span>{SALARY_CAP.toLocaleString()}</span>
          <span className="ml-1">CP</span>
        </span>
        <span
          className="font-medium"
          style={{ color: isOverCap ? '#EF4444' : '#10B981' }}
        >
          {isOverCap
            ? `${Math.abs(remaining).toLocaleString()} CP 초과`
            : `${remaining.toLocaleString()} CP 여유`}
        </span>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>소프트 캡</span>
            <span>{SOFT_SALARY_CAP.toLocaleString()} CP</span>
          </div>
          <div className="flex justify-between">
            <span>하드 캡 (한도)</span>
            <span>{SALARY_CAP.toLocaleString()} CP</span>
          </div>
          <div className="flex justify-between">
            <span>사용률</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>

          {/* Phase 5.3: 소프트캡 페널티 정보 */}
          {isNearCap && !isOverCap && (
            <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400">
              <div className="font-medium mb-1">⚠️ 소프트캡 초과 페널티</div>
              <div className="text-xs space-y-0.5">
                <div>• 경기 보상 -{Math.round(SOFT_CAP_REWARD_PENALTY * 100)}% 감소</div>
                <div>• 럭셔리 택스: {calculateLuxuryTax(currentTotal).toLocaleString()} CP/시즌</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ========================================
// 미니 샐러리캡 표시 (헤더용)
// ========================================

interface SalaryCapMiniProps {
  currentTotal: number;
  className?: string;
}

export const SalaryCapMini: React.FC<SalaryCapMiniProps> = ({
  currentTotal,
  className = '',
}) => {
  const isOverCap = currentTotal > SALARY_CAP;
  const isNearCap = currentTotal > SOFT_SALARY_CAP;

  let statusColor = '#10B981';
  if (isOverCap) statusColor = '#EF4444';
  else if (isNearCap) statusColor = '#F59E0B';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${className}`}
      style={{ backgroundColor: `${statusColor}15` }}
    >
      <span className="text-sm text-gray-400">$</span>
      <span className="text-sm font-medium" style={{ color: statusColor }}>
        {currentTotal.toLocaleString()}
      </span>
      <span className="text-xs text-gray-500">/</span>
      <span className="text-xs text-gray-400">{SALARY_CAP.toLocaleString()}</span>
      {isOverCap && (
        <span className="text-xs font-bold text-red-400">!</span>
      )}
    </div>
  );
};

// ========================================
// 트레이드 샐러리 프리뷰
// ========================================

interface TradeSalaryPreviewProps {
  currentTotal: number;
  outgoingSalary: number;   // 내보내는 카드 연봉
  incomingSalary: number;   // 받는 카드 연봉
  className?: string;
}

export const TradeSalaryPreview: React.FC<TradeSalaryPreviewProps> = ({
  currentTotal,
  outgoingSalary,
  incomingSalary,
  className = '',
}) => {
  const afterTrade = currentTotal - outgoingSalary + incomingSalary;
  const diff = incomingSalary - outgoingSalary;
  const isValid = afterTrade <= SALARY_CAP;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
        <span>$</span>
        <span>샐러리 변동 미리보기</span>
      </h4>

      <div className="space-y-2 text-sm">
        {/* 현재 */}
        <div className="flex justify-between">
          <span className="text-gray-400">현재 총 연봉</span>
          <span className="text-white">{currentTotal.toLocaleString()} CP</span>
        </div>

        {/* 내보내는 */}
        <div className="flex justify-between text-green-400">
          <span>- 내보내는 카드</span>
          <span>-{outgoingSalary.toLocaleString()} CP</span>
        </div>

        {/* 받는 */}
        <div className="flex justify-between text-red-400">
          <span>+ 받는 카드</span>
          <span>+{incomingSalary.toLocaleString()} CP</span>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-700 pt-2">
          <div className="flex justify-between font-bold">
            <span className="text-gray-300">트레이드 후</span>
            <span style={{ color: isValid ? '#10B981' : '#EF4444' }}>
              {afterTrade.toLocaleString()} CP
            </span>
          </div>

          {/* 변동량 */}
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">변동</span>
            <span style={{ color: diff > 0 ? '#EF4444' : diff < 0 ? '#10B981' : '#9CA3AF' }}>
              {diff > 0 ? '+' : ''}{diff.toLocaleString()} CP
            </span>
          </div>
        </div>

        {/* 유효성 표시 */}
        {!isValid && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-center">
            ! 샐러리캡 초과 - 트레이드 불가
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCapDisplay;

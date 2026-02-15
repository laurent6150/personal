// ========================================
// CP 표시 컴포넌트 (Phase 5)
// 크루 포인트 잔액 및 변동 표시
// ========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../stores/economyStore';

// ========================================
// 미니 CP 표시 (헤더용)
// ========================================

interface CPMiniProps {
  className?: string;
}

export const CPMini: React.FC<CPMiniProps> = ({ className = '' }) => {
  const cp = useEconomyStore(state => state.cp);
  const [prevCP, setPrevCP] = useState(cp);
  const [diff, setDiff] = useState<number | null>(null);

  // CP 변동 감지
  useEffect(() => {
    if (cp !== prevCP) {
      const change = cp - prevCP;
      setDiff(change);
      setPrevCP(cp);

      // 2초 후 변동 표시 제거
      const timer = setTimeout(() => setDiff(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [cp, prevCP]);

  return (
    <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/15 ${className}`}>
      <span className="text-sm text-yellow-500">💰</span>
      <span className="text-sm font-medium text-yellow-400">
        {cp.toLocaleString()} CP
      </span>

      {/* 변동 표시 애니메이션 */}
      <AnimatePresence>
        {diff !== null && (
          <motion.span
            initial={{ opacity: 0, y: diff > 0 ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: diff > 0 ? -10 : 10 }}
            className={`absolute -top-4 right-0 text-xs font-bold ${
              diff > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {diff > 0 ? '+' : ''}{diff.toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

// ========================================
// 상세 CP 표시
// ========================================

interface CPDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export const CPDisplay: React.FC<CPDisplayProps> = ({
  showDetails = true,
  className = '',
}) => {
  const { cp, totalEarned, totalSpent, transactionLog } = useEconomyStore();

  // 최근 거래 (5개)
  const recentTransactions = transactionLog.slice(0, 5);

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <span className="font-bold text-white">크루 포인트</span>
        </div>
        <div className="text-2xl font-bold text-yellow-400">
          {cp.toLocaleString()} CP
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <>
          {/* 총계 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-green-500/10 rounded-lg p-2 text-center">
              <div className="text-xs text-green-400 mb-1">총 획득</div>
              <div className="text-sm font-medium text-green-400">
                +{totalEarned.toLocaleString()} CP
              </div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <div className="text-xs text-red-400 mb-1">총 지출</div>
              <div className="text-sm font-medium text-red-400">
                -{totalSpent.toLocaleString()} CP
              </div>
            </div>
          </div>

          {/* 최근 거래 */}
          {recentTransactions.length > 0 && (
            <div className="border-t border-gray-700 pt-3">
              <div className="text-xs text-gray-400 mb-2">최근 거래</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {recentTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-300 truncate max-w-[60%]">
                      {tx.description}
                    </span>
                    <span className={tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ========================================
// CP 획득 알림 토스트
// ========================================

interface CPEarnedToastProps {
  amount: number;
  reason: string;
  onClose: () => void;
}

export const CPEarnedToast: React.FC<CPEarnedToastProps> = ({
  amount,
  reason,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isPositive = amount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg ${
        isPositive
          ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90'
          : 'bg-gradient-to-r from-red-500/90 to-red-600/90'
      } backdrop-blur-sm z-50`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{isPositive ? '💰' : '💸'}</span>
        <div>
          <div className="text-white font-bold">
            {isPositive ? '+' : ''}{amount.toLocaleString()} CP
          </div>
          <div className="text-white/80 text-sm">{reason}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CPDisplay;

// ========================================
// 트레이드 데드라인 표시 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import {
  getTradeDeadlineStatus,
  getDeadlineMessage,
  getDeadlineBarColor
} from '../../utils/tradeDeadlineSystem';

interface TradeDeadlineIndicatorProps {
  currentMatch: number;
  totalMatches: number;
  compact?: boolean;
  showTooltip?: boolean;
}

export function TradeDeadlineIndicator({
  currentMatch,
  totalMatches,
  compact = false,
  showTooltip = true
}: TradeDeadlineIndicatorProps) {
  const status = getTradeDeadlineStatus(currentMatch, totalMatches);
  const message = getDeadlineMessage(status);
  const barColor = getDeadlineBarColor(status);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {status.canTrade ? (
          <span className="text-green-400 text-xs">
            🔓 트레이드 가능
          </span>
        ) : (
          <span className="text-red-400 text-xs">
            🔒 트레이드 마감
          </span>
        )}
        {status.isNearDeadline && status.canTrade && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-yellow-400 text-xs"
          >
            ({status.matchesUntilDeadline}경기 남음)
          </motion.span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-lg border border-white/10 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{status.canTrade ? '🔓' : '🔒'}</span>
          <span className="text-sm font-bold text-text-primary">
            트레이드
          </span>
        </div>
        <span className={`text-xs ${
          status.canTrade ? 'text-green-400' : 'text-red-400'
        }`}>
          {status.canTrade ? '가능' : '마감'}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="relative h-2 bg-bg-primary rounded-full overflow-hidden mb-2">
        {/* 데드라인 마커 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
          style={{ left: '70%' }}
        />

        {/* 진행 바 */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${status.progress}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${barColor}`}
        />
      </div>

      {/* 정보 */}
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{currentMatch}/{totalMatches} 경기</span>
        <span>{status.progress}%</span>
      </div>

      {/* 메시지 */}
      {showTooltip && (
        <div className={`mt-2 text-xs ${
          !status.canTrade ? 'text-red-400' :
          status.isNearDeadline ? 'text-yellow-400' : 'text-text-secondary'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

// 트레이드 데드라인 경고 토스트
interface TradeDeadlineWarningProps {
  matchesUntilDeadline: number;
  onDismiss: () => void;
}

export function TradeDeadlineWarning({
  matchesUntilDeadline,
  onDismiss
}: TradeDeadlineWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 max-w-sm bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 z-40"
    >
      <div className="flex items-start gap-3">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-2xl"
        >
          ⚠️
        </motion.span>
        <div className="flex-1">
          <div className="font-bold text-yellow-400 mb-1">
            트레이드 데드라인 임박!
          </div>
          <div className="text-sm text-text-secondary">
            {matchesUntilDeadline}경기 후 트레이드가 마감됩니다.
            필요한 트레이드를 서둘러 주세요!
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-text-secondary hover:text-text-primary"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// 트레이드 마감 알림 모달
interface TradeDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TradeDeadlineModal({ isOpen, onClose }: TradeDeadlineModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg-secondary rounded-xl border-2 border-red-500/50 max-w-md w-full p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-red-400 mb-2">
          트레이드 데드라인
        </h2>
        <p className="text-text-secondary mb-6">
          시즌 70%가 진행되어 더 이상 트레이드가 불가능합니다.
          다음 시즌까지 현재 로스터로 경기를 진행해야 합니다.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
        >
          확인
        </button>
      </motion.div>
    </motion.div>
  );
}

export default TradeDeadlineIndicator;

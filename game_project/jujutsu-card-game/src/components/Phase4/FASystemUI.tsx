// ========================================
// FA (Free Agent) 시스템 UI 컴포넌트
// ========================================

import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import type { PlayerCard } from '../../types';
import {
  getFAStatus,
  getFAProgress
} from '../../utils/faSystem';

// FA 카드 배지
interface FABadgeProps {
  card: PlayerCard;
  size?: 'sm' | 'md';
}

export function FABadge({ card, size = 'sm' }: FABadgeProps) {
  const faStatus = getFAStatus(card);

  if (!faStatus.isFA && faStatus.seasonsUntilFA > 0) {
    return null;
  }

  if (faStatus.isFA) {
    return (
      <span className={`px-2 py-0.5 bg-green-500/20 text-green-400 rounded font-bold ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}>
        FA
      </span>
    );
  }

  if (faStatus.canDeclareFA) {
    return (
      <span className={`px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}>
        FA 자격
      </span>
    );
  }

  return null;
}

// FA 진행 바
interface FAProgressBarProps {
  card: PlayerCard;
  showLabel?: boolean;
}

export function FAProgressBar({ card, showLabel = true }: FAProgressBarProps) {
  const faStatus = getFAStatus(card);
  const progress = getFAProgress(card);

  if (faStatus.isFA) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-xs">
        <span>FA 자격 보유</span>
      </div>
    );
  }

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>FA까지</span>
          <span>{faStatus.seasonsUntilFA}시즌 남음</span>
        </div>
      )}
      <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// FA 카드 리스트 아이템
interface FACardItemProps {
  card: PlayerCard;
  onDeclareFA?: (cardId: string) => void;
  onRenew?: (cardId: string) => void;
  showActions?: boolean;
}

export function FACardItem({
  card,
  onDeclareFA,
  onRenew,
  showActions = true
}: FACardItemProps) {
  const charData = CHARACTERS_BY_ID[card.cardId];
  const faStatus = getFAStatus(card);

  return (
    <div className="bg-bg-secondary rounded-lg border border-white/10 p-4">
      <div className="flex items-center gap-4">
        {/* 캐릭터 아이콘 */}
        <div className="w-14 h-14 bg-bg-primary rounded-lg flex items-center justify-center text-2xl">
          {charData?.name.ko.charAt(0) || '?'}
        </div>

        {/* 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">
              {charData?.name.ko || '???'}
            </span>
            <FABadge card={card} />
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Lv.{card.level} | 연속 {card.consecutiveSeasons || 0}시즌
          </div>
          {!faStatus.isFA && (
            <div className="mt-2">
              <FAProgressBar card={card} />
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {showActions && faStatus.canDeclareFA && (
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDeclareFA?.(card.cardId)}
            >
              FA 선언
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRenew?.(card.cardId)}
            >
              재계약
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// FA 알림 모달
interface FANotificationModalProps {
  isOpen: boolean;
  card: PlayerCard;
  onDeclareFA: () => void;
  onRenew: () => void;
  onClose: () => void;
}

export function FANotificationModal({
  isOpen,
  card,
  onDeclareFA,
  onRenew,
  onClose
}: FANotificationModalProps) {
  const charData = CHARACTERS_BY_ID[card.cardId];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-bg-secondary rounded-xl border border-green-500/30 max-w-md w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="bg-green-500/10 border-b border-green-500/20 p-4 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h2 className="text-xl font-bold text-green-400">
              FA 자격 획득!
            </h2>
          </div>

          {/* 내용 */}
          <div className="p-4">
            <div className="flex items-center gap-4 bg-bg-primary/50 rounded-lg p-4 mb-4">
              <div className="w-16 h-16 bg-bg-secondary rounded-lg flex items-center justify-center text-3xl">
                {charData?.name.ko.charAt(0) || '?'}
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary">
                  {charData?.name.ko || '???'}
                </div>
                <div className="text-sm text-text-secondary">
                  3시즌 연속 활동
                </div>
              </div>
            </div>

            <p className="text-sm text-text-secondary text-center mb-4">
              이 카드가 FA 자격을 획득했습니다.<br />
              FA를 선언하거나 재계약을 진행하세요.
            </p>

            <div className="space-y-2">
              <button
                onClick={onDeclareFA}
                className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-bold transition-colors"
              >
                ⚡ FA 선언 (이적 가능)
              </button>
              <button
                onClick={onRenew}
                className="w-full py-3 bg-bg-primary/50 hover:bg-bg-primary border border-white/10 rounded-lg text-text-primary transition-colors"
              >
                📝 재계약 (팀 잔류)
              </button>
            </div>
          </div>

          {/* 정보 */}
          <div className="p-4 border-t border-white/10 text-center text-xs text-text-secondary">
            FA 선언 시 다른 크루로 이적할 수 있습니다
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// FA 시장 화면
interface FAMarketScreenProps {
  availableFAs: PlayerCard[];
  myCards: PlayerCard[];
  onAcquireFA?: (cardId: string) => void;
  onBack?: () => void;
}

export function FAMarketScreen({
  availableFAs,
  myCards,
  onAcquireFA,
  onBack
}: FAMarketScreenProps) {
  // 내 FA 자격 카드
  const myFACandidates = myCards.filter(card => {
    const status = getFAStatus(card);
    return status.canDeclareFA;
  });

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                FA 시장
              </h1>
              <p className="text-sm text-text-secondary">
                자유 계약 선수 영입
              </p>
            </div>
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              뒤로
            </Button>
          )}
        </div>

        {/* FA 시장 */}
        <div className="mb-6">
          <div className="text-lg font-bold text-text-primary mb-3">
            🛒 FA 시장 ({availableFAs.length}명)
          </div>
          {availableFAs.length === 0 ? (
            <div className="text-center py-8 text-text-secondary bg-bg-secondary rounded-xl">
              현재 FA 시장에 선수가 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFAs.map(card => {
                const charData = CHARACTERS_BY_ID[card.cardId];
                return (
                  <motion.div
                    key={card.cardId}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 bg-bg-secondary rounded-lg border border-white/10 p-4 hover:border-green-500/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-bg-primary rounded-lg flex items-center justify-center text-xl">
                      {charData?.name.ko.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">
                          {charData?.name.ko || '???'}
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                          FA
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Lv.{card.level}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAcquireFA?.(card.cardId)}
                    >
                      영입
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 내 FA 자격 카드 */}
        {myFACandidates.length > 0 && (
          <div>
            <div className="text-lg font-bold text-text-primary mb-3">
              📋 내 FA 자격 카드 ({myFACandidates.length}장)
            </div>
            <div className="space-y-2">
              {myFACandidates.map(card => (
                <FACardItem key={card.cardId} card={card} showActions={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAMarketScreen;

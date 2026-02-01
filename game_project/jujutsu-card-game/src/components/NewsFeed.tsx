// ========================================
// 뉴스 피드 컴포넌트
// ========================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNewsFeedStore } from '../stores/newsFeedStore';
import type { NewsItem, NewsType } from '../types';

interface NewsFeedProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

// 뉴스 타입별 아이콘
const NEWS_ICONS: Record<NewsType, string> = {
  MATCH_RESULT: '⚔️',
  STREAK: '🔥',
  RECORD: '📊',
  AWARD: '🏆',
  TRADE: '🔄',
  SEASON_START: '🎉',
  SEASON_END: '🏁',
  PLAYOFF: '🎯',
  MILESTONE: '⭐'
};

// 상대적 시간 표시
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(timestamp).toLocaleDateString('ko-KR');
}

export function NewsFeed({ maxItems = 15, showHeader = true, compact = false }: NewsFeedProps) {
  const { news, lastReadTimestamp, markAsRead } = useNewsFeedStore();

  const displayNews = useMemo(() => {
    return news.slice(0, maxItems);
  }, [news, maxItems]);

  const unreadCount = useMemo(() => {
    return news.filter(n => n.timestamp > lastReadTimestamp).length;
  }, [news, lastReadTimestamp]);

  if (displayNews.length === 0) {
    return (
      <div className="bg-bg-card rounded-xl p-4 border border-white/10">
        {showHeader && (
          <h3 className="text-lg font-bold text-text-primary mb-3">📰 뉴스</h3>
        )}
        <div className="text-center text-text-secondary py-4">
          아직 뉴스가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            📰 뉴스
            {unreadCount > 0 && (
              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAsRead}
              className="text-xs text-accent hover:underline"
            >
              모두 읽음
            </button>
          )}
        </div>
      )}

      <div className={`divide-y divide-white/5 ${compact ? '' : 'max-h-[300px] overflow-y-auto'}`}>
        {displayNews.map((item, index) => (
          <NewsItemCard
            key={item.id}
            item={item}
            isUnread={item.timestamp > lastReadTimestamp}
            compact={compact}
            delay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
}

// 개별 뉴스 아이템 카드
interface NewsItemCardProps {
  item: NewsItem;
  isUnread: boolean;
  compact: boolean;
  delay: number;
}

function NewsItemCard({ item, isUnread, compact, delay }: NewsItemCardProps) {
  const icon = NEWS_ICONS[item.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`p-3 ${isUnread ? 'bg-accent/5' : ''} ${item.highlight ? 'border-l-2 border-accent' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="text-lg flex-shrink-0">{icon}</div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${compact ? 'text-sm' : ''} ${item.highlight ? 'text-accent' : 'text-text-primary'}`}>
              {item.title}
            </h4>
            {isUnread && (
              <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>

          {!compact && item.content && (
            <p className="text-sm text-text-secondary mt-1 whitespace-pre-line">
              {item.content}
            </p>
          )}

          <div className="text-xs text-text-secondary/70 mt-1">
            시즌 {item.seasonNumber} • {getRelativeTime(item.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 뉴스 피드 미리보기 (홈 화면용)
interface NewsFeedPreviewProps {
  onViewAll?: () => void;
}

export function NewsFeedPreview({ onViewAll }: NewsFeedPreviewProps) {
  const { news } = useNewsFeedStore();
  const latestNews = news.slice(0, 3);

  if (latestNews.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-text-primary">📰 최신 뉴스</h3>
        {onViewAll && news.length > 3 && (
          <button
            onClick={onViewAll}
            className="text-xs text-accent hover:underline"
          >
            더보기
          </button>
        )}
      </div>

      <div className="space-y-2">
        {latestNews.map(item => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <span>{NEWS_ICONS[item.type]}</span>
            <span className={`truncate ${item.highlight ? 'text-accent font-medium' : 'text-text-secondary'}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

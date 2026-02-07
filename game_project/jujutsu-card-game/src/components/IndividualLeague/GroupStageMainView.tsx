// ========================================
// 32강 조별리그 메인 뷰 컴포넌트 (Phase 3)
// ========================================

import { motion } from 'framer-motion';
import type { Round32Group, IndividualMatch } from '../../types';
import { Button } from '../UI/Button';
import { GroupCard } from './GroupCard';

interface GroupStageMainViewProps {
  groups: Round32Group[];
  matches: IndividualMatch[];
  playerCardIds: string[];
  onStartMatch: (matchId: string) => void;
  onSkipAll: () => void;
  onNextRound: () => void;
  isRoundComplete: boolean;
}

export function GroupStageMainView({
  groups,
  matches,
  playerCardIds,
  onStartMatch,
  onSkipAll,
  onNextRound,
  isRoundComplete
}: GroupStageMainViewProps) {
  // 조별 매치 가져오기
  const getGroupMatches = (groupId: string) => {
    return matches.filter(m => m.groupId === groupId);
  };

  // 전체 진행 상황 계산
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.played).length;
  const progressPercent = Math.round((completedMatches / totalMatches) * 100);

  // 내 카드가 있는 조 먼저 표시
  const sortedGroups = [...groups].sort((a, b) => {
    const aHasPlayer = a.participants.some(id => playerCardIds.includes(id));
    const bHasPlayer = b.participants.some(id => playerCardIds.includes(id));
    if (aHasPlayer && !bHasPlayer) return -1;
    if (!aHasPlayer && bHasPlayer) return 1;
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* 진행 상황 바 */}
      <div className="bg-bg-secondary rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">전체 진행률</span>
          <span className="text-sm text-accent font-bold">{completedMatches}/{totalMatches} 경기 ({progressPercent}%)</span>
        </div>
        <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-accent to-purple-500"
          />
        </div>
      </div>

      {/* 8개 조 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            matches={getGroupMatches(group.id)}
            playerCardIds={playerCardIds}
            onStartMatch={onStartMatch}
          />
        ))}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="bg-bg-secondary rounded-lg p-4 border border-white/10">
        <div className="flex flex-wrap justify-center gap-3">
          {!isRoundComplete && (
            <>
              <Button
                variant="secondary"
                onClick={onSkipAll}
              >
                ⏭️ 모든 경기 스킵
              </Button>
            </>
          )}

          {isRoundComplete && (
            <Button
              variant="primary"
              onClick={onNextRound}
              className="px-8"
            >
              ➡️ 다음 라운드 (16강 토너먼트)
            </Button>
          )}
        </div>

        {/* 범례 */}
        <div className="mt-4 text-center text-xs text-text-secondary space-x-4">
          <span>⭐ = 내 카드</span>
          <span className="text-yellow-400">★ = 내 카드 있는 조</span>
          <span className="text-green-400">✓ = 완료</span>
          <span className="text-yellow-400">⚔️ = 다음 경기</span>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupStageMainView;

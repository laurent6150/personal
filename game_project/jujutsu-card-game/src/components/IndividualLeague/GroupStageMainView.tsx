// ========================================
// 듀얼 토너먼트 메인 뷰 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import type { DualTournamentGroup, IndividualMatch } from '../../types';
import { Button } from '../UI/Button';
import { GroupCard } from './GroupCard';

interface GroupStageMainViewProps {
  groups: DualTournamentGroup[];
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
  // 전체 진행 상황 계산 (각 조 5경기)
  const totalMatches = groups.length * 5;
  const completedMatches = groups.reduce((sum, group) => {
    const m = group.matches;
    return sum + [m.match1, m.match2, m.winnersMatch, m.losersMatch, m.finalMatch]
      .filter(match => match.played).length;
  }, 0);
  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  // 내 카드가 있는 조 먼저 표시
  const sortedGroups = [...groups].sort((a, b) => {
    const aHasPlayer = a.participants.some(id => playerCardIds.includes(id));
    const bHasPlayer = b.participants.some(id => playerCardIds.includes(id));
    if (aHasPlayer && !bHasPlayer) return -1;
    if (!aHasPlayer && bHasPlayer) return 1;
    return 0;
  });

  // 다음 라운드 이름
  const nextRoundName = groups.length > 8 ? '32강 듀얼 토너먼트' : '16강 토너먼트';

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

      {/* 조 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            matches={matches}
            playerCardIds={playerCardIds}
            onStartMatch={onStartMatch}
          />
        ))}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="bg-bg-secondary rounded-lg p-4 border border-white/10">
        <div className="flex flex-wrap justify-center gap-3">
          {!isRoundComplete && (
            <Button
              variant="secondary"
              onClick={onSkipAll}
            >
              모든 경기 스킵
            </Button>
          )}

          {isRoundComplete && (
            <Button
              variant="primary"
              onClick={onNextRound}
              className="px-8"
            >
              다음 라운드 ({nextRoundName})
            </Button>
          )}
        </div>

        {/* 범례 */}
        <div className="mt-4 text-center text-xs text-text-secondary space-x-4">
          <span>내 카드</span>
          <span className="text-yellow-400">내 카드 있는 조</span>
          <span className="text-green-400">완료</span>
          <span className="text-blue-400">승자전</span>
          <span className="text-red-400">패자전</span>
          <span className="text-purple-400">최종전</span>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupStageMainView;

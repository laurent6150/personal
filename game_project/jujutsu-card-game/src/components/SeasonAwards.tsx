// ========================================
// 시즌 시상식 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { CHARACTERS_BY_ID } from '../data/characters';
import { useCardRecordStore } from '../stores/cardRecordStore';
import { GradeBadge } from './UI/Badge';
import { Button } from './UI/Button';
import type { Award } from '../types';
import { AWARD_CONFIG } from '../types';

interface SeasonAwardsProps {
  seasonNumber: number;
  onContinue: () => void;
  playoffQualified?: boolean;
  playerRank?: number;
}

export function SeasonAwards({ seasonNumber, onContinue, playoffQualified, playerRank }: SeasonAwardsProps) {
  const { getSeasonAwards, getSeasonStats } = useCardRecordStore(useShallow(state => ({
    getSeasonAwards: state.getSeasonAwards,
    getSeasonStats: state.getSeasonStats
  })));

  const awards = getSeasonAwards(seasonNumber);

  // 수상자별 그룹화
  const mvpAward = awards.find(a => a.type === 'MVP');
  const mostWinsAward = awards.find(a => a.type === 'MOST_WINS');

  // 배경 이미지 스타일
  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/victory_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-card rounded-2xl p-8 max-w-lg w-full border border-white/10"
      >
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-3xl font-bold text-accent mb-2">시즌 {seasonNumber} 시상식</h1>
          <p className="text-text-secondary">정규시즌 우수 선수</p>
        </motion.div>

        {/* 수상자 목록 */}
        <div className="space-y-6 mb-8">
          {/* MVP */}
          {mvpAward && (
            <AwardCard
              award={mvpAward}
              delay={0.2}
              getSeasonStats={getSeasonStats}
              seasonNumber={seasonNumber}
            />
          )}

          {/* 다승왕 */}
          {mostWinsAward && (
            <AwardCard
              award={mostWinsAward}
              delay={0.4}
              getSeasonStats={getSeasonStats}
              seasonNumber={seasonNumber}
            />
          )}
        </div>

        {/* 플레이오프 정보 */}
        {playerRank !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6 text-center"
          >
            <div className="text-sm text-text-secondary mb-2">내 순위: {playerRank}위</div>
            {playoffQualified ? (
              <div className="text-win font-bold">플레이오프 진출!</div>
            ) : (
              <div className="text-lose">플레이오프 진출 실패</div>
            )}
          </motion.div>
        )}

        {/* 계속 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button onClick={onContinue} variant="primary" size="lg" className="w-full">
            {playoffQualified ? '플레이오프 진행' : '다음 시즌 준비'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 개별 수상 카드
interface AwardCardProps {
  award: Award;
  delay: number;
  getSeasonStats: (cardId: string, seasonNumber: number) => { wins: number; losses: number; totalGames: number; winRate: number };
  seasonNumber: number;
}

function AwardCard({ award, delay, getSeasonStats, seasonNumber }: AwardCardProps) {
  const character = CHARACTERS_BY_ID[award.cardId];
  const stats = getSeasonStats(award.cardId, seasonNumber);
  const config = AWARD_CONFIG[award.type];

  if (!character) return null;

  // MVP 점수 계산
  const mvpScore = award.type === 'MVP'
    ? (stats.wins * 2) + (stats.winRate / 100 * 20)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/30"
    >
      <div className="flex items-center gap-4">
        {/* 수상 아이콘 */}
        <div className="text-4xl">{config.icon}</div>

        {/* 수상 정보 */}
        <div className="flex-1">
          <div className="font-bold text-yellow-400 mb-1">{config.name}</div>
          <div className="flex items-center gap-2">
            <GradeBadge grade={character.grade} size="sm" />
            <span className="font-bold text-lg">{character.name.ko}</span>
          </div>
          <div className="text-sm text-text-secondary mt-1">
            {stats.wins}승 {stats.losses}패
            {mvpScore !== null && (
              <span className="ml-2 text-yellow-400">
                (기여도 {mvpScore.toFixed(1)}점)
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 시상식 트리거 함수 (seasonStore에서 호출)
export function triggerSeasonAwards(seasonNumber: number): boolean {
  const { selectSeasonAwards, getSeasonAwards } = useCardRecordStore.getState();

  // 이미 수상자가 있으면 스킵
  const existingAwards = getSeasonAwards(seasonNumber);
  if (existingAwards.length > 0) return false;

  // 수상자 선정
  selectSeasonAwards(seasonNumber);
  return true;
}

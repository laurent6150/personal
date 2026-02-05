// ========================================
// 시리즈 스코어보드 컴포넌트
// 경기 중 현재 시리즈 스코어 표시
// ========================================

import { motion } from 'framer-motion';
import type { Arena, RoundResult } from '../../types';

interface SeriesScoreboardProps {
  playerCrewName: string;
  aiCrewName: string;
  playerScore: number;
  aiScore: number;
  currentRound: number;
  totalRounds: number;
  rounds: RoundResult[];
  selectedArenas: Arena[];
  compact?: boolean;
}

export function SeriesScoreboard({
  playerCrewName,
  aiCrewName,
  playerScore,
  aiScore,
  currentRound,
  totalRounds,
  rounds,
  selectedArenas,
  compact = false
}: SeriesScoreboardProps) {
  // 라운드 결과 아이콘
  const getRoundResult = (roundIndex: number) => {
    if (roundIndex < rounds.length) {
      const round = rounds[roundIndex];
      if (round.winner === 'PLAYER') return { icon: '⭕', color: 'text-green-400', label: '승' };
      if (round.winner === 'AI') return { icon: '❌', color: 'text-red-400', label: '패' };
      return { icon: '➖', color: 'text-yellow-400', label: '무' };
    }
    if (roundIndex === currentRound - 1) {
      return { icon: '▶️', color: 'text-accent', label: '현재' };
    }
    return { icon: '⚪', color: 'text-text-secondary', label: '예정' };
  };

  if (compact) {
    // 컴팩트 모드: 한 줄 표시
    return (
      <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-4">
        <div className="text-sm font-bold text-text-primary">
          {playerCrewName}
        </div>
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="text-green-400">{playerScore}</span>
          <span className="text-text-secondary">:</span>
          <span className="text-red-400">{aiScore}</span>
        </div>
        <div className="text-sm font-bold text-text-primary">
          {aiCrewName}
        </div>
        <div className="text-sm text-text-secondary ml-auto">
          [{currentRound}경기 / {totalRounds}경기]
        </div>
      </div>
    );
  }

  // 풀 모드: 상세 표시
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary/90 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
    >
      {/* 스코어 헤더 */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-text-primary">{playerCrewName}</span>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-green-400">{playerScore}</span>
            <span className="text-text-secondary">:</span>
            <span className="text-red-400">{aiScore}</span>
          </div>
          <span className="text-lg font-bold text-text-primary">{aiCrewName}</span>
        </div>
        <div className="text-sm text-text-secondary">
          [{currentRound}경기 / {totalRounds}경기]
        </div>
      </div>

      {/* 라운드별 결과 */}
      <div className="p-4 space-y-2">
        {selectedArenas.map((arena, index) => {
          const result = getRoundResult(index);
          const isCurrent = index === currentRound - 1;
          const isPlayed = index < rounds.length;

          return (
            <div
              key={arena.id}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${isCurrent
                  ? 'bg-accent/20 border border-accent/50'
                  : isPlayed
                    ? 'bg-white/5'
                    : 'opacity-50'
                }
              `}
            >
              <span className={`text-lg ${result.color}`}>{result.icon}</span>
              <span className="text-sm font-medium text-text-primary flex-1">
                {index + 1}경기: {arena.name.ko}
              </span>
              <span className={`text-xs ${result.color}`}>
                {isPlayed ? result.label : isCurrent ? '⬅ 현재' : '예정'}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 미니 스코어 (전투 화면 상단용)
export function MiniSeriesScore({
  playerScore,
  aiScore,
  currentRound,
  totalRounds
}: {
  playerScore: number;
  aiScore: number;
  currentRound: number;
  totalRounds: number;
}) {
  return (
    <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
      <span className="text-sm font-bold text-green-400">{playerScore}</span>
      <span className="text-sm text-text-secondary">-</span>
      <span className="text-sm font-bold text-red-400">{aiScore}</span>
      <span className="text-xs text-text-secondary ml-2">
        R{currentRound}/{totalRounds}
      </span>
    </div>
  );
}

export default SeriesScoreboard;

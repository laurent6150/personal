// ========================================
// 세트 진행 현황 컴포넌트 (Phase 3)
// 3판 2선승제 / 5판 3선승제 세트별 결과 표시
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { SimSetResult } from '../../types/individualLeague';
import type { Arena } from '../../types';

interface SetProgressViewProps {
  fighter1Id: string;
  fighter1Name: string;
  fighter2Id: string;
  fighter2Name: string;
  arenas: Arena[];
  completedSets: SimSetResult[];
  currentSetIndex: number;
  bestOf: number;
  score: [number, number];
  isPlayerMatch: boolean;
}

export function SetProgressView({
  fighter1Id,
  fighter1Name,
  fighter2Id,
  fighter2Name,
  arenas,
  completedSets,
  currentSetIndex,
  bestOf,
  score,
  isPlayerMatch
}: SetProgressViewProps) {
  const card1 = CHARACTERS_BY_ID[fighter1Id];
  const card2 = CHARACTERS_BY_ID[fighter2Id];
  const winsNeeded = Math.ceil(bestOf / 2);

  // 세트별 상태 결정
  const getSetStatus = (setIndex: number) => {
    const completedSet = completedSets[setIndex];
    if (completedSet) {
      return {
        status: 'completed',
        winner: completedSet.winnerId === fighter1Id ? 1 : 2,
        winnerName: completedSet.winnerName,
        hpPercent: completedSet.winnerHpPercent
      };
    }
    if (setIndex === currentSetIndex) {
      return { status: 'current', winner: null, winnerName: null, hpPercent: null };
    }
    return { status: 'pending', winner: null, winnerName: null, hpPercent: null };
  };

  return (
    <div className={`
      bg-bg-secondary rounded-xl border p-4
      ${isPlayerMatch ? 'border-yellow-500/30' : 'border-white/10'}
    `}>
      {/* 헤더: 스코어 */}
      <div className="flex items-center justify-center gap-6 mb-4">
        {/* P1 */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
            {card1 && (
              <img
                src={getCharacterImage(card1.id, card1.name.ko, card1.attribute)}
                alt={card1.name.ko}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{fighter1Name}</div>
            <div className="text-2xl font-bold text-accent">{score[0]}</div>
          </div>
        </div>

        {/* VS */}
        <div className="text-lg text-text-secondary">:</div>

        {/* P2 */}
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-sm font-bold text-white">{fighter2Name}</div>
            <div className="text-2xl font-bold text-red-400">{score[1]}</div>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
            {card2 && (
              <img
                src={getCharacterImage(card2.id, card2.name.ko, card2.attribute)}
                alt={card2.name.ko}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* 승리 조건 */}
      <div className="text-center text-xs text-text-secondary mb-4">
        {bestOf}판 {winsNeeded}선승 | 먼저 {winsNeeded}승 달성 시 승리
      </div>

      {/* 세트별 현황 */}
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: bestOf }).map((_, i) => {
          const setStatus = getSetStatus(i);
          const arena = arenas[i];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`
                flex flex-col items-center p-2 rounded-lg min-w-[80px]
                ${setStatus.status === 'completed'
                  ? setStatus.winner === 1
                    ? 'bg-accent/20 border border-accent/50'
                    : 'bg-red-500/20 border border-red-500/50'
                  : setStatus.status === 'current'
                  ? 'bg-yellow-500/20 border-2 border-yellow-500 animate-pulse'
                  : 'bg-bg-primary/30 border border-white/10'}
              `}
            >
              {/* 세트 번호 */}
              <div className="text-xs text-text-secondary mb-1">
                세트 {i + 1}
              </div>

              {/* 경기장 이름 */}
              <div className="text-[10px] text-text-secondary truncate max-w-[70px]">
                {arena?.name?.ko || '???'}
              </div>

              {/* 상태 표시 */}
              <div className="text-lg mt-1">
                {setStatus.status === 'completed' ? (
                  setStatus.winner === 1 ? (
                    <span className="text-accent">W</span>
                  ) : (
                    <span className="text-red-400">L</span>
                  )
                ) : setStatus.status === 'current' ? (
                  <span className="text-yellow-400">*</span>
                ) : (
                  <span className="text-text-secondary">?</span>
                )}
              </div>

              {/* HP 정보 (완료된 세트만) */}
              {setStatus.status === 'completed' && setStatus.hpPercent !== null && (
                <div className="text-[10px] text-text-secondary">
                  HP {setStatus.hpPercent}%
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 진행 상태 메시지 */}
      <div className="text-center text-sm">
        {score[0] >= winsNeeded ? (
          <span className="text-green-400 font-bold">
            {fighter1Name} 승리!
          </span>
        ) : score[1] >= winsNeeded ? (
          <span className="text-red-400 font-bold">
            {fighter2Name} 승리!
          </span>
        ) : currentSetIndex < bestOf ? (
          <span className="text-yellow-400">
            세트 {currentSetIndex + 1} 진행 중
            {arenas[currentSetIndex] && ` - ${arenas[currentSetIndex].name.ko}`}
          </span>
        ) : (
          <span className="text-text-secondary">대기 중</span>
        )}
      </div>
    </div>
  );
}

// 간소화된 세트 표시 (인라인용)
export function SetProgressInline({
  score,
  bestOf,
  currentSetIndex,
  completedSets,
  fighter1Id
}: {
  score: [number, number];
  bestOf: number;
  currentSetIndex: number;
  completedSets: SimSetResult[];
  fighter1Id: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: bestOf }).map((_, i) => {
        const completedSet = completedSets[i];
        let bgColor = 'bg-gray-600';

        if (completedSet) {
          bgColor = completedSet.winnerId === fighter1Id
            ? 'bg-accent'
            : 'bg-red-500';
        } else if (i === currentSetIndex) {
          bgColor = 'bg-yellow-400 animate-pulse';
        }

        return (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${bgColor}`}
          />
        );
      })}
      <span className="text-xs text-text-secondary ml-2">
        {score[0]} : {score[1]}
      </span>
    </div>
  );
}

export default SetProgressView;

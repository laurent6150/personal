// ========================================
// 토너먼트 대진표 (8강/4강/결승)
// ========================================

import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { CHARACTERS_BY_ID } from '../../data/characters';
import type { IndividualMatch } from '../../types';

interface KnockoutBracketProps {
  onClose?: () => void;
}

export function KnockoutBracket({ onClose }: KnockoutBracketProps) {
  const { currentLeague, getPlayerCrewIds } = useIndividualLeagueStore(
    useShallow(state => ({
      currentLeague: state.currentLeague,
      getPlayerCrewIds: state.getPlayerCrewIds,
    }))
  );

  const playerCardIds = getPlayerCrewIds();

  if (!currentLeague) return null;

  const { quarter, semi, final } = currentLeague.brackets;

  // 캐릭터 이름 가져오기
  const getCharName = (odId: string | null | undefined): string => {
    if (!odId) return '???';
    const char = CHARACTERS_BY_ID[odId];
    return char?.name.ko || '???';
  };

  // 내 카드인지 확인
  const isMyCard = (odId: string | null | undefined): boolean => {
    if (!odId) return false;
    return playerCardIds.includes(odId);
  };

  // 스코어 계산
  const getScore = (match: IndividualMatch | null | undefined): { p1: number; p2: number } | null => {
    if (!match || !match.played) return null;
    return match.score;
  };

  // 매치 박스 렌더링
  const renderMatchBox = (match: IndividualMatch | null | undefined, label: string) => {
    if (!match) {
      return (
        <div className="bg-bg-primary/30 border border-dashed border-white/20 rounded-lg p-3 min-w-[160px]">
          <div className="text-xs text-text-secondary mb-2">{label}</div>
          <div className="text-center text-text-secondary text-sm py-4">
            대기 중
          </div>
        </div>
      );
    }

    const score = getScore(match);

    return (
      <div className={`bg-bg-primary/50 border rounded-lg p-3 min-w-[160px] ${match.played ? 'border-green-500/30' : 'border-white/10'}`}>
        <div className="text-xs text-text-secondary mb-2">{label}</div>

        {/* 참가자 1 */}
        <div className={`
          flex items-center justify-between p-2 rounded mb-1
          ${match.winner === match.participant1 ? 'bg-green-500/20' : 'bg-white/5'}
          ${isMyCard(match.participant1) ? 'border-l-2 border-yellow-500' : ''}
        `}>
          <span className={`text-sm ${match.winner === match.participant1 ? 'text-green-400 font-bold' : 'text-text-primary'}`}>
            {isMyCard(match.participant1) && '⭐ '}
            {getCharName(match.participant1)}
          </span>
          {score && (
            <span className={`text-sm font-bold ${match.winner === match.participant1 ? 'text-green-400' : 'text-text-secondary'}`}>
              {score.p1}
            </span>
          )}
        </div>

        {/* VS */}
        <div className="text-center text-xs text-text-secondary my-1">
          {match.played ? '─' : 'vs'}
        </div>

        {/* 참가자 2 */}
        <div className={`
          flex items-center justify-between p-2 rounded
          ${match.winner === match.participant2 ? 'bg-green-500/20' : 'bg-white/5'}
          ${isMyCard(match.participant2) ? 'border-l-2 border-yellow-500' : ''}
        `}>
          <span className={`text-sm ${match.winner === match.participant2 ? 'text-green-400 font-bold' : 'text-text-primary'}`}>
            {isMyCard(match.participant2) && '⭐ '}
            {getCharName(match.participant2)}
          </span>
          {score && (
            <span className={`text-sm font-bold ${match.winner === match.participant2 ? 'text-green-400' : 'text-text-secondary'}`}>
              {score.p2}
            </span>
          )}
        </div>

        {/* 승자 표시 */}
        {match.winner && (
          <div className="text-center text-xs text-green-400 mt-2">
            ✓ {getCharName(match.winner)}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-bg-secondary rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-auto border border-white/10"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-primary">
              📋 토너먼트 대진표
            </h3>
            <p className="text-sm text-text-secondary">5판 3선승제</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* 대진표 */}
        <div className="flex items-center justify-center gap-6 overflow-x-auto py-4">
          {/* 8강 */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="inline-block bg-accent/20 text-accent font-bold px-3 py-1 rounded-lg text-sm">
                8강
              </span>
            </div>
            <div className="flex flex-col gap-8">
              {renderMatchBox(quarter[0], 'QF-1')}
              {renderMatchBox(quarter[1], 'QF-2')}
            </div>
            <div className="flex flex-col gap-8 mt-4">
              {renderMatchBox(quarter[2], 'QF-3')}
              {renderMatchBox(quarter[3], 'QF-4')}
            </div>
          </div>

          {/* 연결선 */}
          <div className="flex flex-col items-center justify-center h-full gap-32">
            <div className="w-8 border-t border-white/20" />
            <div className="w-8 border-t border-white/20" />
          </div>

          {/* 4강 */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="inline-block bg-accent/20 text-accent font-bold px-3 py-1 rounded-lg text-sm">
                4강
              </span>
            </div>
            <div className="flex flex-col gap-24 py-8">
              {renderMatchBox(semi[0], 'SF-1')}
              {renderMatchBox(semi[1], 'SF-2')}
            </div>
          </div>

          {/* 연결선 */}
          <div className="flex items-center justify-center">
            <div className="w-8 border-t border-white/20" />
          </div>

          {/* 결승 */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="inline-block bg-yellow-500/20 text-yellow-400 font-bold px-3 py-1 rounded-lg text-sm">
                결승
              </span>
            </div>
            <div className="py-16">
              {renderMatchBox(final, 'FINAL')}
            </div>
          </div>

          {/* 우승자 */}
          {currentLeague.champion && (
            <>
              <div className="flex items-center justify-center">
                <div className="w-8 border-t border-yellow-500/50" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <span className="inline-block bg-yellow-500/30 text-yellow-400 font-bold px-3 py-1 rounded-lg text-sm">
                    🏆 우승
                  </span>
                </div>
                <div className="py-16">
                  <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 border-2 border-yellow-500/50 rounded-xl p-4 text-center min-w-[160px]">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className={`text-lg font-bold ${isMyCard(currentLeague.champion) ? 'text-yellow-400' : 'text-text-primary'}`}>
                      {isMyCard(currentLeague.champion) && '⭐ '}
                      {getCharName(currentLeague.champion)}
                    </div>
                    {isMyCard(currentLeague.champion) && (
                      <div className="text-xs text-yellow-400 mt-2">내 카드!</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 범례 */}
        <div className="text-center text-xs text-text-secondary mt-4 pt-4 border-t border-white/10">
          ⭐ = 내 카드 | <span className="text-green-400">초록색</span> = 승자
        </div>
      </motion.div>
    </motion.div>
  );
}

export default KnockoutBracket;

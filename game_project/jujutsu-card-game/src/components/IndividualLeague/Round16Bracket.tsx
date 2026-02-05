// ========================================
// 16강 조별 대진표 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { CHARACTERS_BY_ID } from '../../data/characters';

interface Round16BracketProps {
  onClose?: () => void;
}

export function Round16Bracket({ onClose }: Round16BracketProps) {
  const { currentLeague, getPlayerCrewIds } = useIndividualLeagueStore(
    useShallow(state => ({
      currentLeague: state.currentLeague,
      getPlayerCrewIds: state.getPlayerCrewIds,
    }))
  );

  const playerCardIds = getPlayerCrewIds();

  if (!currentLeague) return null;

  const groups = currentLeague.brackets.round16;

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
        className="bg-bg-secondary rounded-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text-primary">
            📋 16강 대진표
          </h3>
          <div className="text-sm text-text-secondary">
            2선승제
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

        {/* 조별 대진표 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map(group => {
            const [p1, p2, p3, p4] = group.participants;
            const match1 = group.matches[0]; // 시드 vs 4번
            const match2 = group.matches[1]; // 2번 vs 3번
            const match3 = group.matches[2]; // 결승

            return (
              <div
                key={group.id}
                className="bg-bg-primary/50 rounded-xl p-3 border border-white/5"
              >
                {/* 조 헤더 */}
                <div className="text-center mb-3">
                  <span className="inline-block bg-accent/20 text-accent font-bold px-3 py-1 rounded-lg">
                    {group.id}조
                  </span>
                </div>

                {/* 준결승 */}
                <div className="space-y-2 mb-3">
                  {/* 1경기: 시드 vs 4번 */}
                  <div
                    className={`
                      bg-bg-secondary/50 rounded-lg p-2 text-sm
                      ${match1?.played ? 'opacity-80' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          ${isMyCard(p1) ? 'text-yellow-400' : 'text-text-primary'}
                          ${match1?.winner === p1 ? 'font-bold' : ''}
                        `}
                      >
                        {isMyCard(p1) && '⭐'}
                        {getCharName(p1)}
                        <span className="text-xs text-yellow-500/60 ml-1">(S)</span>
                      </span>
                      {match1?.played && (
                        <span className="text-xs text-text-secondary">
                          {match1.score.p1}
                        </span>
                      )}
                    </div>
                    <div className="text-center text-xs text-text-secondary my-0.5">
                      {match1?.played ? 'vs' : '⚔️'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                          ${isMyCard(p4) ? 'text-yellow-400' : 'text-text-primary'}
                          ${match1?.winner === p4 ? 'font-bold' : ''}
                        `}
                      >
                        {isMyCard(p4) && '⭐'}
                        {getCharName(p4)}
                      </span>
                      {match1?.played && (
                        <span className="text-xs text-text-secondary">
                          {match1.score.p2}
                        </span>
                      )}
                    </div>
                    {match1?.winner && (
                      <div className="text-xs text-green-400 text-center mt-1">
                        ✓ {getCharName(match1.winner)}
                      </div>
                    )}
                  </div>

                  {/* 2경기: 2번 vs 3번 */}
                  <div
                    className={`
                      bg-bg-secondary/50 rounded-lg p-2 text-sm
                      ${match2?.played ? 'opacity-80' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          ${isMyCard(p2) ? 'text-yellow-400' : 'text-text-primary'}
                          ${match2?.winner === p2 ? 'font-bold' : ''}
                        `}
                      >
                        {isMyCard(p2) && '⭐'}
                        {getCharName(p2)}
                      </span>
                      {match2?.played && (
                        <span className="text-xs text-text-secondary">
                          {match2.score.p1}
                        </span>
                      )}
                    </div>
                    <div className="text-center text-xs text-text-secondary my-0.5">
                      {match2?.played ? 'vs' : '⚔️'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                          ${isMyCard(p3) ? 'text-yellow-400' : 'text-text-primary'}
                          ${match2?.winner === p3 ? 'font-bold' : ''}
                        `}
                      >
                        {isMyCard(p3) && '⭐'}
                        {getCharName(p3)}
                      </span>
                      {match2?.played && (
                        <span className="text-xs text-text-secondary">
                          {match2.score.p2}
                        </span>
                      )}
                    </div>
                    {match2?.winner && (
                      <div className="text-xs text-green-400 text-center mt-1">
                        ✓ {getCharName(match2.winner)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 결승선 */}
                <div className="border-t border-white/10 pt-2">
                  <div className="text-center text-xs text-text-secondary mb-2">
                    조 결승
                  </div>
                  <div
                    className={`
                      bg-accent/10 border border-accent/30 rounded-lg p-2 text-sm
                      ${match3?.played ? 'opacity-80' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          ${isMyCard(match1?.winner) ? 'text-yellow-400' : 'text-text-primary'}
                          ${match3?.winner === match1?.winner ? 'font-bold' : ''}
                        `}
                      >
                        {isMyCard(match1?.winner) && '⭐'}
                        {match1?.winner ? getCharName(match1.winner) : '1경기 승자'}
                      </span>
                      {match3?.played && (
                        <span className="text-xs text-text-secondary">
                          {match3.score.p1}
                        </span>
                      )}
                    </div>
                    <div className="text-center text-xs text-text-secondary my-0.5">
                      {match3?.played ? 'vs' : '⚔️'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                          ${isMyCard(match2?.winner) ? 'text-yellow-400' : 'text-text-primary'}
                          ${match3?.winner === match2?.winner ? 'font-bold' : ''}
                        `}
                      >
                        {isMyCard(match2?.winner) && '⭐'}
                        {match2?.winner ? getCharName(match2.winner) : '2경기 승자'}
                      </span>
                      {match3?.played && (
                        <span className="text-xs text-text-secondary">
                          {match3.score.p2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 조 우승자 */}
                  {group.winner && (
                    <div className="text-center mt-2">
                      <span className="inline-block bg-yellow-500/20 text-yellow-400 font-bold px-2 py-1 rounded-lg text-sm">
                        🏆 {getCharName(group.winner)}
                      </span>
                      <div className="text-xs text-green-400 mt-1">
                        8강 진출
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Round16Bracket;

// ========================================
// 16강 토너먼트 대진표 컴포넌트
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

  const matches = currentLeague.brackets.round16Matches || [];

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

  // 매치 라벨 (시드 정보)
  const getMatchLabel = (index: number): string => {
    const labels = [
      'A1 vs H2',
      'B1 vs G2',
      'C1 vs F2',
      'D1 vs E2',
      'E1 vs D2',
      'F1 vs C2',
      'G1 vs B2',
      'H1 vs A2',
    ];
    return labels[index] || `경기 ${index + 1}`;
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
            📋 16강 토너먼트 대진표
          </h3>
          <div className="text-sm text-text-secondary">
            단판 승부
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

        {/* 대진표 설명 */}
        <div className="bg-bg-primary/50 rounded-lg p-3 mb-4 text-sm text-text-secondary">
          <div className="text-accent font-bold mb-1">시드 매칭</div>
          <div>각 조 1위 vs 반대편 조 2위 (예: A조 1위 vs H조 2위)</div>
        </div>

        {/* 대진표 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {matches.map((match, index) => {
            const p1 = match.participant1;
            const p2 = match.participant2;
            const isP1Winner = match.winner === p1;
            const isP2Winner = match.winner === p2;

            return (
              <div
                key={match.id}
                className={`
                  bg-bg-primary/50 rounded-xl p-3 border
                  ${match.played ? 'border-green-500/30' : 'border-white/5'}
                `}
              >
                {/* 매치 라벨 */}
                <div className="text-center mb-2">
                  <span className="inline-block bg-accent/20 text-accent font-bold px-2 py-0.5 rounded text-xs">
                    {getMatchLabel(index)}
                  </span>
                </div>

                {/* 대진 */}
                <div className="space-y-2">
                  {/* 참가자 1 (1위) */}
                  <div
                    className={`
                      flex items-center justify-between px-2 py-1.5 rounded text-sm
                      ${isP1Winner ? 'bg-green-500/20 border border-green-500/30' : 'bg-bg-secondary/50'}
                      ${isMyCard(p1) ? 'border border-accent/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {isMyCard(p1) && <span className="text-yellow-400">⭐</span>}
                      <span className={isP1Winner ? 'text-green-400 font-bold' : 'text-text-primary'}>
                        {getCharName(p1)}
                      </span>
                    </div>
                    {match.played && (
                      <span className="text-xs text-text-secondary">
                        {match.score.p1}
                      </span>
                    )}
                  </div>

                  {/* VS */}
                  <div className="text-center text-xs text-text-secondary">
                    {match.played ? 'vs' : '⚔️'}
                  </div>

                  {/* 참가자 2 (2위) */}
                  <div
                    className={`
                      flex items-center justify-between px-2 py-1.5 rounded text-sm
                      ${isP2Winner ? 'bg-green-500/20 border border-green-500/30' : 'bg-bg-secondary/50'}
                      ${isMyCard(p2) ? 'border border-accent/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {isMyCard(p2) && <span className="text-yellow-400">⭐</span>}
                      <span className={isP2Winner ? 'text-green-400 font-bold' : 'text-text-primary'}>
                        {getCharName(p2)}
                      </span>
                    </div>
                    {match.played && (
                      <span className="text-xs text-text-secondary">
                        {match.score.p2}
                      </span>
                    )}
                  </div>
                </div>

                {/* 승자 표시 */}
                {match.winner && (
                  <div className="text-center mt-2">
                    <span className="inline-block bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded text-xs">
                      ✓ {getCharName(match.winner)} 8강 진출
                    </span>
                  </div>
                )}

                {/* 미진행 경기 */}
                {!match.played && (
                  <div className="text-center mt-2">
                    <span className="text-xs text-text-secondary">
                      경기 대기중
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 진행 상황 */}
        <div className="mt-4 text-center text-sm text-text-secondary">
          <span className="text-accent">🌟</span> = 내 카드 |
          <span className="text-green-400 ml-2">초록색</span> = 8강 진출 |
          진행: {matches.filter(m => m.played).length}/{matches.length}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Round16Bracket;

// ========================================
// 듀얼 토너먼트 조별 현황 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { DualTournamentGroup, LeagueParticipant, IndividualMatch } from '../../types';
import { Button } from '../UI/Button';

interface GroupStageViewProps {
  groups: DualTournamentGroup[];
  participants: LeagueParticipant[];
  matches: IndividualMatch[];  // 호환성 유지 (사용하지 않음)
  onClose: () => void;
}

export function GroupStageView({ groups, participants, onClose }: GroupStageViewProps) {
  const playerCardIds = participants
    .filter(p => p.isPlayerCrew)
    .map(p => p.odId);

  const getParticipantName = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko || '???';
  };

  const getParticipantImage = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card ? getCharacterImage(card.id, card.name.ko, card.attribute) : null;
  };

  const isPlayerCard = (odId: string) => playerCardIds.includes(odId);

  // 듀얼 토너먼트 매치 목록
  const getGroupMatches = (group: DualTournamentGroup) => {
    const m = group.matches;
    return [
      { match: m.match1, label: '1차전' },
      { match: m.match2, label: '2차전' },
      { match: m.winnersMatch, label: '승자전' },
      { match: m.losersMatch, label: '패자전' },
      { match: m.finalMatch, label: '최종전' },
    ];
  };

  // 매치 상태 표시
  const getMatchStatus = (match: IndividualMatch) => {
    if (match.played) return { icon: '✓', color: 'text-green-400', label: '완료' };
    if (match.participant1 && match.participant2) {
      return { icon: '⏳', color: 'text-yellow-400', label: '진행 가능' };
    }
    return { icon: '○', color: 'text-text-secondary', label: '대기' };
  };

  // 조별 순위 (1~4위)
  const getGroupRanking = (group: DualTournamentGroup): { odId: string; rank: number; status: string }[] => {
    const ranking: { odId: string; rank: number; status: string }[] = [];
    if (group.firstPlace) ranking.push({ odId: group.firstPlace, rank: 1, status: '진출' });
    if (group.secondPlace) ranking.push({ odId: group.secondPlace, rank: 2, status: '진출' });
    if (group.thirdPlace) ranking.push({ odId: group.thirdPlace, rank: 3, status: '탈락' });
    if (group.fourthPlace) ranking.push({ odId: group.fourthPlace, rank: 4, status: '탈락' });
    return ranking;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xl font-bold text-text-primary">
            듀얼 토너먼트 조별 현황 ({groups.length}조)
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* 조별 현황 그리드 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(group => {
              const groupMatches = getGroupMatches(group);
              const completedCount = groupMatches.filter(m => m.match.played).length;
              const ranking = getGroupRanking(group);

              return (
                <div
                  key={group.id}
                  className="bg-bg-secondary rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* 조 헤더 */}
                  <div className={`px-4 py-2 flex items-center justify-between ${
                    group.isCompleted ? 'bg-green-500/20' : 'bg-accent/20'
                  }`}>
                    <span className={`font-bold ${
                      group.isCompleted ? 'text-green-400' : 'text-accent'
                    }`}>
                      {group.id}조 {group.isCompleted && '✓'}
                      {group.seedId && <span className="ml-1 text-yellow-400 text-xs">[시드]</span>}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {completedCount}/5 경기
                    </span>
                  </div>

                  {/* 참가자 카드 (4명 가로 배열) */}
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {group.participants.map(odId => {
                      const isPlayer = isPlayerCard(odId);
                      const rankInfo = ranking.find(r => r.odId === odId);
                      const isQualified = rankInfo && rankInfo.rank <= 2;
                      const isEliminated = rankInfo && rankInfo.rank >= 3;

                      return (
                        <div
                          key={odId}
                          className={`
                            flex flex-col items-center p-2 rounded-lg
                            ${isPlayer ? 'bg-accent/20 border border-accent/50' : 'bg-bg-primary/50'}
                            ${isQualified ? 'ring-2 ring-green-400' : ''}
                            ${isEliminated ? 'opacity-50' : ''}
                          `}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-primary mb-1">
                            {getParticipantImage(odId) ? (
                              <img
                                src={getParticipantImage(odId)!}
                                alt={getParticipantName(odId)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                👤
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-center truncate w-full">
                            {isPlayer && <span className="text-yellow-400">🌟</span>}
                            <span className={isQualified ? 'text-green-400 font-bold' : 'text-text-primary'}>
                              {getParticipantName(odId)}
                            </span>
                          </div>

                          {rankInfo && (
                            <div className={`text-xs ${isQualified ? 'text-green-400' : 'text-red-400'}`}>
                              {rankInfo.rank}위 {rankInfo.status}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 듀얼 토너먼트 대진표 */}
                  <div className="px-4 pb-2">
                    <div className="text-xs font-bold text-text-secondary mb-2">
                      ═══ 듀얼 토너먼트 ═══
                    </div>
                    <div className="space-y-1">
                      {groupMatches.map(({ match, label }) => {
                        const status = getMatchStatus(match);
                        const hasParticipants = match.participant1 && match.participant2;
                        const p1Name = match.participant1 ? getParticipantName(match.participant1) : '???';
                        const p2Name = match.participant2 ? getParticipantName(match.participant2) : '???';
                        const isP1Player = match.participant1 ? isPlayerCard(match.participant1) : false;
                        const isP2Player = match.participant2 ? isPlayerCard(match.participant2) : false;

                        const labelColor = label === '승자전' ? 'text-blue-400'
                          : label === '패자전' ? 'text-red-400'
                          : label === '최종전' ? 'text-purple-400'
                          : 'text-text-secondary';

                        return (
                          <div
                            key={match.id}
                            className={`
                              flex items-center justify-between text-xs py-1 px-2 rounded
                              ${(isP1Player || isP2Player) ? 'bg-accent/10' : ''}
                              ${!hasParticipants ? 'opacity-40' : ''}
                            `}
                          >
                            <span className={`w-14 ${labelColor} font-bold`}>
                              {label}
                            </span>
                            <span className={`flex-1 text-center ${isP1Player ? 'text-yellow-400' : 'text-text-primary'}`}>
                              {p1Name}
                            </span>
                            <span className="text-text-secondary mx-2">vs</span>
                            <span className={`flex-1 text-center ${isP2Player ? 'text-yellow-400' : 'text-text-primary'}`}>
                              {p2Name}
                            </span>
                            <span className={`w-24 text-right ${status.color}`}>
                              {match.played ? (
                                <>
                                  {status.icon} {getParticipantName(match.winner!)} 승
                                </>
                              ) : (
                                <>
                                  {status.icon} {status.label}
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 조 결과 요약 (완료 시) */}
                  {group.isCompleted && ranking.length > 0 && (
                    <div className="px-4 py-2 bg-bg-primary/50 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">최종 순위:</span>
                        <div className="flex gap-2">
                          {ranking.map(r => (
                            <span
                              key={r.odId}
                              className={`
                                ${r.rank <= 2 ? 'text-green-400' : 'text-text-secondary'}
                                ${isPlayerCard(r.odId) ? 'font-bold' : ''}
                              `}
                            >
                              {r.rank}.{getParticipantName(r.odId).slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="mt-4 text-center text-xs text-text-secondary">
            🌟 = 내 카드 |
            <span className="text-green-400 ml-2">초록 테두리</span> = 진출 확정 |
            <span className="text-yellow-400 ml-2">⏳</span> = 진행 가능 |
            <span className="text-blue-400 ml-2">승자전</span> /
            <span className="text-red-400 ml-1">패자전</span> /
            <span className="text-purple-400 ml-1">최종전</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GroupStageView;

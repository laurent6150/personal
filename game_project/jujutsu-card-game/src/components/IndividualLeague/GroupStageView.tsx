// ========================================
// 32강 조별 현황 컴포넌트 (카드형 레이아웃)
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { Round32Group, LeagueParticipant, IndividualMatch } from '../../types';
import { Button } from '../UI/Button';

interface GroupStageViewProps {
  groups: Round32Group[];
  participants: LeagueParticipant[];
  matches: IndividualMatch[];  // round32 매치 배열
  onClose: () => void;
}

export function GroupStageView({ groups, participants, matches, onClose }: GroupStageViewProps) {
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

  // 조별 매치 가져오기
  const getGroupMatches = (groupId: string) => {
    return matches.filter(m => m.groupId === groupId);
  };

  // 순위 정렬
  const getSortedStandings = (group: Round32Group) => {
    return [...group.standings].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.wins - b.losses) - (a.wins - a.losses);
    });
  };

  // 경기 상태 아이콘
  const getMatchStatus = (match: IndividualMatch, groupMatches: IndividualMatch[]) => {
    if (match.played) return { icon: '✓', color: 'text-green-400', label: '완료' };

    // 다음 경기인지 확인 (첫 번째 미완료 경기)
    const firstUnplayed = groupMatches.find(m => !m.played);
    if (firstUnplayed?.id === match.id) {
      return { icon: '⏳', color: 'text-yellow-400', label: '다음' };
    }

    return { icon: '○', color: 'text-text-secondary', label: '대기' };
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
            📊 32강 조별 현황
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* 조별 현황 그리드 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(group => {
              const groupMatches = getGroupMatches(group.id);
              const sortedStandings = getSortedStandings(group);
              const completedMatches = groupMatches.filter(m => m.played).length;

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
                    </span>
                    <span className="text-xs text-text-secondary">
                      {completedMatches}/6 경기
                    </span>
                  </div>

                  {/* 참가자 카드 (4명 가로 배열) */}
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {group.participants.map(odId => {
                      const standing = group.standings.find(s => s.odId === odId);
                      const isPlayer = isPlayerCard(odId);
                      const rank = sortedStandings.findIndex(s => s.odId === odId) + 1;
                      const isQualified = group.isCompleted && rank <= 2;

                      return (
                        <div
                          key={odId}
                          className={`
                            flex flex-col items-center p-2 rounded-lg
                            ${isPlayer ? 'bg-accent/20 border border-accent/50' : 'bg-bg-primary/50'}
                            ${isQualified ? 'ring-2 ring-green-400' : ''}
                          `}
                        >
                          {/* 캐릭터 이미지 */}
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

                          {/* 이름 */}
                          <div className="text-xs text-center truncate w-full">
                            {isPlayer && <span className="text-yellow-400">🌟</span>}
                            <span className={isQualified ? 'text-green-400 font-bold' : 'text-text-primary'}>
                              {getParticipantName(odId)}
                            </span>
                          </div>

                          {/* 전적 */}
                          <div className="text-xs text-text-secondary">
                            {standing?.wins || 0}승 {standing?.losses || 0}패
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 대진표 */}
                  <div className="px-4 pb-2">
                    <div className="text-xs font-bold text-text-secondary mb-2">
                      ═══ 대진표 ═══
                    </div>
                    <div className="space-y-1">
                      {groupMatches.map((match, idx) => {
                        const status = getMatchStatus(match, groupMatches);
                        const p1Name = getParticipantName(match.participant1);
                        const p2Name = getParticipantName(match.participant2);
                        const isP1Player = isPlayerCard(match.participant1);
                        const isP2Player = isPlayerCard(match.participant2);

                        return (
                          <div
                            key={match.id}
                            className={`
                              flex items-center justify-between text-xs py-1 px-2 rounded
                              ${(isP1Player || isP2Player) ? 'bg-accent/10' : ''}
                            `}
                          >
                            <span className="text-text-secondary w-12">
                              {idx + 1}경기
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

                  {/* 현재 순위 */}
                  <div className="px-4 py-2 bg-bg-primary/50 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">현재 순위:</span>
                      <div className="flex gap-2">
                        {sortedStandings.slice(0, 4).map((s, idx) => (
                          <span
                            key={s.odId}
                            className={`
                              ${idx < 2 ? 'text-green-400' : 'text-text-secondary'}
                              ${isPlayerCard(s.odId) ? 'font-bold' : ''}
                            `}
                          >
                            {idx + 1}.{getParticipantName(s.odId).slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="mt-4 text-center text-xs text-text-secondary">
            🌟 = 내 카드 |
            <span className="text-green-400 ml-2">초록 테두리</span> = 16강 진출 |
            <span className="text-yellow-400 ml-2">⏳</span> = 다음 경기
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GroupStageView;

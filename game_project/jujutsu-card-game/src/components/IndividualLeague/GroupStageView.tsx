// ========================================
// 32강 조별 현황 컴포넌트
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import type { Round32Group, LeagueParticipant, IndividualMatch } from '../../types';
import { Button } from '../UI/Button';

interface GroupStageViewProps {
  groups: Round32Group[];
  participants: LeagueParticipant[];
  matches: IndividualMatch[];  // 32강 경기 목록
  onClose: () => void;
}

export function GroupStageView({ groups, participants, matches, onClose }: GroupStageViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 플레이어 카드 ID 목록
  const playerCardIds = participants
    .filter(p => p.isPlayerCrew)
    .map(p => p.odId);

  // 참가자 이름 가져오기
  const getParticipantName = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko || '???';
  };

  // 짧은 이름 (4글자 이하)
  const getShortName = (odId: string) => {
    const name = getParticipantName(odId);
    return name.length > 4 ? name.slice(0, 4) + '..' : name;
  };

  // 플레이어 카드 여부
  const isPlayerCard = (odId: string) => playerCardIds.includes(odId);

  // 순위 정렬 (승수 > 승패차)
  const getSortedStandings = (group: Round32Group) => {
    return [...group.standings].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const diffA = a.wins - a.losses;
      const diffB = b.wins - b.losses;
      return diffB - diffA;
    });
  };

  // 조별 경기 가져오기
  const getGroupMatches = (groupId: string) => {
    return matches.filter(m => m.groupId === groupId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xl font-bold text-text-primary">
            📋 32강 조별 현황
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* 조별 현황 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {groups.map(group => {
              const sortedStandings = getSortedStandings(group);
              const groupMatches = getGroupMatches(group.id);
              const isSelected = selectedGroup === group.id;

              return (
                <div
                  key={group.id}
                  className="bg-bg-secondary rounded-lg border border-white/10 overflow-hidden"
                >
                  {/* 조 헤더 - 클릭으로 대진표 토글 */}
                  <button
                    onClick={() => setSelectedGroup(isSelected ? null : group.id)}
                    className={`w-full px-3 py-1 text-center ${group.isCompleted ? 'bg-green-500/20' : 'bg-accent/20'} hover:opacity-80 transition-opacity`}
                  >
                    <span className={`text-sm font-bold ${group.isCompleted ? 'text-green-400' : 'text-accent'}`}>
                      {group.id}조 {group.isCompleted && '✓'}
                      <span className="text-xs ml-1 text-text-secondary">
                        {isSelected ? '▲' : '▼'}
                      </span>
                    </span>
                  </button>

                  {/* 참가자 순위 */}
                  <div className="p-3 space-y-1">
                    {sortedStandings.map((standing, rank) => {
                      const isPlayer = isPlayerCard(standing.odId);
                      const isQualified = group.isCompleted && rank < 2; // 상위 2명 진출
                      const isEliminated = group.isCompleted && rank >= 2; // 하위 2명 탈락

                      return (
                        <div
                          key={standing.odId}
                          className={`
                            flex items-center justify-between px-2 py-1 rounded text-sm
                            ${isQualified ? 'bg-green-500/20' : ''}
                            ${isEliminated ? 'bg-red-500/10 opacity-70' : ''}
                            ${isPlayer ? 'border border-accent/50' : ''}
                          `}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-text-secondary w-4">{rank + 1}.</span>
                            {isPlayer && <span className="text-xs">🌟</span>}
                            <span className={`
                              ${isQualified ? 'text-green-400 font-bold' : ''}
                              ${isEliminated ? 'text-text-secondary' : 'text-text-primary'}
                            `}>
                              {getParticipantName(standing.odId)}
                            </span>
                          </div>
                          <span className="text-text-secondary">
                            {standing.wins}승 {standing.losses}패
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 조별 대진표 (토글) */}
                  {isSelected && (
                    <div className="border-t border-white/10 p-2 bg-bg-primary/30">
                      <div className="text-xs text-text-secondary mb-2 text-center font-semibold">
                        📋 {group.id}조 대진표
                      </div>
                      <div className="space-y-1">
                        {groupMatches.map((match, idx) => {
                          const isP1Player = isPlayerCard(match.participant1);
                          const isP2Player = isPlayerCard(match.participant2);
                          const isP1Winner = match.winner === match.participant1;
                          const isP2Winner = match.winner === match.participant2;

                          return (
                            <div
                              key={match.id}
                              className={`
                                flex items-center justify-between text-xs px-2 py-1 rounded
                                ${match.played ? 'bg-bg-secondary' : 'bg-bg-primary/50'}
                              `}
                            >
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <span className="text-text-secondary">{idx + 1}.</span>
                                <span className={`
                                  truncate
                                  ${isP1Player ? 'text-accent font-bold' : 'text-text-primary'}
                                  ${isP1Winner ? 'text-green-400' : ''}
                                  ${match.played && !isP1Winner ? 'text-text-secondary' : ''}
                                `}>
                                  {getShortName(match.participant1)}
                                </span>
                              </div>
                              <div className="px-2 text-text-secondary shrink-0">
                                {match.played ? (
                                  <span className={isP1Winner ? 'text-green-400' : 'text-red-400'}>
                                    {match.score.p1} - {match.score.p2}
                                  </span>
                                ) : (
                                  <span>vs</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                                <span className={`
                                  truncate
                                  ${isP2Player ? 'text-accent font-bold' : 'text-text-primary'}
                                  ${isP2Winner ? 'text-green-400' : ''}
                                  ${match.played && !isP2Winner ? 'text-text-secondary' : ''}
                                `}>
                                  {getShortName(match.participant2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 조 상태 */}
                  <div className="px-3 py-1 bg-bg-primary/50 text-center">
                    {group.isCompleted ? (
                      <span className="text-xs text-green-400">
                        {getShortName(sortedStandings[0]?.odId)}, {getShortName(sortedStandings[1]?.odId)} 16강 진출
                      </span>
                    ) : (
                      <span className="text-xs text-text-secondary">
                        6경기 중 {groupMatches.filter(m => m.played).length}경기 완료
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="mt-4 text-center text-xs text-text-secondary">
            <span className="text-accent">🌟</span> = 내 카드 |
            <span className="text-green-400 ml-2">초록색</span> = 16강 진출/승리 |
            <span className="text-red-400 ml-2">연한 빨강</span> = 탈락/패배
            <br />
            <span className="mt-1 inline-block">조 이름 클릭 시 대진표 표시</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GroupStageView;

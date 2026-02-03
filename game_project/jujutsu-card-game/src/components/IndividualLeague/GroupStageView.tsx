// ========================================
// 16강 조별 현황 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import type { LeagueGroup, LeagueParticipant } from '../../types';
import { Button } from '../UI/Button';

interface GroupStageViewProps {
  groups: LeagueGroup[];
  participants: LeagueParticipant[];
  onClose: () => void;
}

export function GroupStageView({ groups, participants, onClose }: GroupStageViewProps) {
  // 플레이어 카드 ID 목록
  const playerCardIds = participants
    .filter(p => p.isPlayerCrew)
    .map(p => p.odId);

  // 참가자 이름 가져오기
  const getParticipantName = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko || '???';
  };

  // 플레이어 카드 여부
  const isPlayerCard = (odId: string) => playerCardIds.includes(odId);

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
            📋 16강 조별 현황
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* 조별 현황 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {groups.map(group => {
              const p1 = group.participants[0];
              const p2 = group.participants[1];
              const p1Name = p1 ? getParticipantName(p1) : '?';
              const p2Name = p2 ? getParticipantName(p2) : '?';
              const isP1Player = p1 && isPlayerCard(p1);
              const isP2Player = p2 && isPlayerCard(p2);
              const p1Wins = p1 ? (group.winsCount[p1] || 0) : 0;
              const p2Wins = p2 ? (group.winsCount[p2] || 0) : 0;

              return (
                <div
                  key={group.id}
                  className="bg-bg-secondary rounded-lg border border-white/10 overflow-hidden"
                >
                  {/* 조 헤더 */}
                  <div className="bg-accent/20 px-3 py-1 text-center">
                    <span className="text-sm font-bold text-accent">{group.id}조</span>
                  </div>

                  {/* 참가자 */}
                  <div className="p-3 space-y-2">
                    {/* P1 */}
                    <div
                      className={`
                        flex items-center justify-between px-2 py-1 rounded
                        ${group.winner === p1 ? 'bg-green-500/20' : ''}
                        ${isP1Player ? 'border border-accent/50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {isP1Player && <span className="text-xs">🌟</span>}
                        <span className={`text-sm ${group.winner === p1 ? 'text-green-400 font-bold' : 'text-text-primary'}`}>
                          {p1Name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">{p1Wins}</span>
                    </div>

                    {/* P2 */}
                    <div
                      className={`
                        flex items-center justify-between px-2 py-1 rounded
                        ${group.winner === p2 ? 'bg-green-500/20' : ''}
                        ${isP2Player ? 'border border-accent/50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {isP2Player && <span className="text-xs">🌟</span>}
                        <span className={`text-sm ${group.winner === p2 ? 'text-green-400 font-bold' : 'text-text-primary'}`}>
                          {p2Name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">{p2Wins}</span>
                    </div>
                  </div>

                  {/* 조 상태 */}
                  <div className="px-3 py-1 bg-bg-primary/50 text-center">
                    {group.winner ? (
                      <span className="text-xs text-green-400">
                        {getParticipantName(group.winner)} 8강 진출
                      </span>
                    ) : (
                      <span className="text-xs text-text-secondary">
                        2선승 시 진출
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
            <span className="text-green-400 ml-2">초록색</span> = 8강 진출 확정
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GroupStageView;

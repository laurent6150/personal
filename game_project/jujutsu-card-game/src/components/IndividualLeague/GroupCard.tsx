// ========================================
// 조별 카드 컴포넌트 (Phase 3)
// ========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { Round32Group, IndividualMatch } from '../../types';
import { Button } from '../UI/Button';
import { DualTournamentFlow } from './DualTournamentFlow';

interface GroupCardProps {
  group: Round32Group;
  matches: IndividualMatch[];
  playerCardIds: string[];
  onStartMatch?: (matchId: string) => void;
}

// 경기 타입 라벨
const MATCH_LABELS: Record<number, string> = {
  0: '1경기',
  1: '2경기',
  2: '승자전',
  3: '패자전',
  4: '최종전',
  5: '6경기'
};

export function GroupCard({ group, matches, playerCardIds, onStartMatch }: GroupCardProps) {
  const [showFlow, setShowFlow] = useState(false);

  const isPlayerGroup = group.participants.some(id => playerCardIds.includes(id));

  const getParticipantName = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko || '???';
  };

  const getParticipantImage = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card ? getCharacterImage(card.id, card.name.ko, card.attribute) : null;
  };

  const isPlayerCard = (odId: string) => playerCardIds.includes(odId);

  // 순위 정렬
  const sortedStandings = [...group.standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.wins - b.losses) - (a.wins - a.losses);
  });

  // 경기 상태 및 다음 경기 찾기
  const completedMatches = matches.filter(m => m.played).length;
  const nextMatch = matches.find(m => !m.played);

  // 경기 상태 아이콘
  const getMatchStatus = (match: IndividualMatch) => {
    if (match.played) return { icon: '✓', color: 'text-green-400', label: '완료' };
    if (nextMatch?.id === match.id) return { icon: '⚔️', color: 'text-yellow-400', label: '다음' };
    return { icon: '○', color: 'text-text-secondary', label: '대기' };
  };

  // 경기 타입 라벨 결정 (듀얼 토너먼트 기준)
  const getMatchLabel = (index: number) => {
    return MATCH_LABELS[index] || `${index + 1}경기`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-bg-secondary rounded-xl overflow-hidden
        ${isPlayerGroup
          ? 'border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
          : 'border border-white/10'}
      `}
    >
      {/* 조 헤더 */}
      <div className={`px-4 py-2 flex items-center justify-between ${
        group.isCompleted ? 'bg-green-500/20' : isPlayerGroup ? 'bg-yellow-500/20' : 'bg-accent/20'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-lg ${
            group.isCompleted ? 'text-green-400' : isPlayerGroup ? 'text-yellow-400' : 'text-accent'
          }`}>
            {group.id}조
          </span>
          {group.isCompleted && <span className="text-green-400">✓</span>}
          {isPlayerGroup && !group.isCompleted && <span className="text-yellow-400">★</span>}
        </div>
        <span className="text-sm text-text-secondary">
          {completedMatches}/6 경기
        </span>
      </div>

      {/* 참가자 카드 (4명 가로 배열) */}
      <div className="p-4 grid grid-cols-4 gap-2">
        {group.participants.map((odId) => {
          const standing = group.standings.find(s => s.odId === odId);
          const isPlayer = isPlayerCard(odId);
          const rank = sortedStandings.findIndex(s => s.odId === odId) + 1;
          const isQualified = group.isCompleted && rank <= 2;

          return (
            <div
              key={odId}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all
                ${isPlayer ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-primary/50'}
                ${isQualified ? 'ring-2 ring-green-400' : ''}
              `}
            >
              {/* 캐릭터 이미지 */}
              <div className={`
                w-12 h-12 rounded-full overflow-hidden mb-1 relative
                ${isPlayer ? 'border-2 border-yellow-400' : 'border border-white/20'}
              `}>
                {getParticipantImage(odId) ? (
                  <img
                    src={getParticipantImage(odId)!}
                    alt={getParticipantName(odId)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-bg-primary text-2xl">
                    👤
                  </div>
                )}
                {isPlayer && (
                  <div className="absolute -top-1 -right-1 text-yellow-400 text-sm">⭐</div>
                )}
              </div>

              {/* 이름 */}
              <div className="text-xs text-center truncate w-full">
                <span className={isQualified ? 'text-green-400 font-bold' : isPlayer ? 'text-yellow-400' : 'text-text-primary'}>
                  {getParticipantName(odId)}
                </span>
              </div>

              {/* 전적 */}
              <div className="text-xs text-text-secondary">
                {standing?.wins || 0}승 {standing?.losses || 0}패
              </div>

              {/* 순위 */}
              <div className={`text-xs ${rank <= 2 ? 'text-green-400' : 'text-text-secondary'}`}>
                {rank}위
              </div>
            </div>
          );
        })}
      </div>

      {/* 경기 현황 */}
      <div className="px-4 pb-2">
        <div className="text-xs font-bold text-text-secondary mb-2">
          ═══ 경기 현황 ═══
        </div>
        <div className="space-y-1">
          {matches.map((match, matchIndex) => {
            const status = getMatchStatus(match);
            const p1Name = getParticipantName(match.participant1);
            const p2Name = getParticipantName(match.participant2);
            const isP1Player = isPlayerCard(match.participant1);
            const isP2Player = isPlayerCard(match.participant2);
            const isPlayerMatch = isP1Player || isP2Player;

            return (
              <div
                key={match.id}
                className={`
                  flex items-center justify-between text-xs py-1 px-2 rounded
                  ${isPlayerMatch ? 'bg-yellow-500/10' : ''}
                  ${status.label === '다음' ? 'border border-yellow-500/30' : ''}
                `}
              >
                <span className="text-text-secondary w-14">
                  {getMatchLabel(matchIndex)}
                </span>
                <span className={`flex-1 text-center truncate ${isP1Player ? 'text-yellow-400 font-bold' : 'text-text-primary'}`}>
                  {p1Name}
                </span>
                <span className="text-text-secondary mx-1">vs</span>
                <span className={`flex-1 text-center truncate ${isP2Player ? 'text-yellow-400 font-bold' : 'text-text-primary'}`}>
                  {p2Name}
                </span>
                <span className={`w-20 text-right ${status.color}`}>
                  {match.played ? (
                    <>
                      {status.icon} {getParticipantName(match.winner!).slice(0, 4)}승
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

      {/* 듀얼토너먼트 흐름도 (접기/펼치기) */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowFlow(!showFlow)}
          className="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          📊 듀얼토너먼트 흐름도 {showFlow ? '▲' : '▼'}
        </button>

        <AnimatePresence>
          {showFlow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <DualTournamentFlow
                group={group}
                matches={matches}
                playerCardIds={playerCardIds}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 다음 경기 시작 버튼 */}
      {nextMatch && !group.isCompleted && (
        <div className="px-4 pb-4">
          <Button
            variant={isPlayerGroup ? 'primary' : 'secondary'}
            onClick={() => onStartMatch?.(nextMatch.id)}
            className="w-full"
          >
            ▶ 다음 경기 시작: {getParticipantName(nextMatch.participant1)} vs {getParticipantName(nextMatch.participant2)}
          </Button>
        </div>
      )}

      {/* 조 완료 시 진출자 표시 */}
      {group.isCompleted && (
        <div className="px-4 pb-4 bg-green-500/10 border-t border-green-500/20">
          <div className="text-sm text-green-400 text-center py-2">
            🎉 16강 진출: {getParticipantName(sortedStandings[0].odId)}, {getParticipantName(sortedStandings[1].odId)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default GroupCard;

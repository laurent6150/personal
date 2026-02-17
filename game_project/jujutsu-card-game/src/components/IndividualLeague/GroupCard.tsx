// ========================================
// 듀얼 토너먼트 조 카드 컴포넌트
// ========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { DualTournamentGroup } from '../../types';
import { Button } from '../UI/Button';
import { DualTournamentFlow } from './DualTournamentFlow';
import { findNextDualGroupMatch } from '../../utils/individualLeagueSystem';

interface GroupCardProps {
  group: DualTournamentGroup;
  playerCardIds: string[];
  onStartMatch?: (matchId: string) => void;
}

// 매치 라벨 및 색상
const MATCH_INFO: Record<string, { label: string; color: string }> = {
  'm1': { label: '1차전', color: 'text-text-secondary' },
  'm2': { label: '2차전', color: 'text-text-secondary' },
  'wm': { label: '승자전', color: 'text-blue-400' },
  'lm': { label: '패자전', color: 'text-red-400' },
  'fm': { label: '최종전', color: 'text-purple-400' },
};

export function GroupCard({ group, playerCardIds, onStartMatch }: GroupCardProps) {
  const [showFlow, setShowFlow] = useState(false);

  const isPlayerGroup = group.participants.some(id => playerCardIds.includes(id));

  const getParticipantName = (odId: string) => {
    if (!odId) return '???';
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko || '???';
  };

  const getParticipantImage = (odId: string) => {
    const card = CHARACTERS_BY_ID[odId];
    return card ? getCharacterImage(card.id, card.name.ko, card.attribute) : null;
  };

  const isPlayerCard = (odId: string) => playerCardIds.includes(odId);

  // 듀얼 토너먼트 매치 목록
  const m = group.matches;
  const allMatches = [
    { match: m.match1, suffix: 'm1' },
    { match: m.match2, suffix: 'm2' },
    { match: m.winnersMatch, suffix: 'wm' },
    { match: m.losersMatch, suffix: 'lm' },
    { match: m.finalMatch, suffix: 'fm' },
  ];

  const completedCount = allMatches.filter(({ match }) => match.played).length;
  const nextMatch = findNextDualGroupMatch(group);

  // 순위 표시
  const getRankInfo = (odId: string): { rank: number; label: string; color: string } | null => {
    if (group.firstPlace === odId) return { rank: 1, label: '1위', color: 'text-green-400' };
    if (group.secondPlace === odId) return { rank: 2, label: '2위', color: 'text-green-400' };
    if (group.thirdPlace === odId) return { rank: 3, label: '3위', color: 'text-red-400' };
    if (group.fourthPlace === odId) return { rank: 4, label: '4위', color: 'text-red-400' };
    return null;
  };

  // 다음 라운드 이름 (64강 → 32강, 32강 → 16강)
  const nextRoundName = group.matches.match1.id.startsWith('r64') ? '32강' : '16강';

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
          {group.seedId && <span className="text-xs text-yellow-400 ml-1">[시드]</span>}
        </div>
        <span className="text-sm text-text-secondary">
          {completedCount}/5 경기
        </span>
      </div>

      {/* 참가자 카드 (4명 가로 배열) */}
      <div className="p-4 grid grid-cols-4 gap-2">
        {group.participants.map((odId) => {
          const isPlayer = isPlayerCard(odId);
          const rankInfo = getRankInfo(odId);
          const isQualified = rankInfo && rankInfo.rank <= 2;

          return (
            <div
              key={odId}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all
                ${isPlayer ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-primary/50'}
                ${isQualified ? 'ring-2 ring-green-400' : ''}
                ${rankInfo && rankInfo.rank >= 3 ? 'opacity-50' : ''}
              `}
            >
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

              <div className="text-xs text-center truncate w-full">
                <span className={isQualified ? 'text-green-400 font-bold' : isPlayer ? 'text-yellow-400' : 'text-text-primary'}>
                  {getParticipantName(odId)}
                </span>
              </div>

              {rankInfo && (
                <div className={`text-xs font-bold ${rankInfo.color}`}>
                  {rankInfo.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 경기 현황 */}
      <div className="px-4 pb-2">
        <div className="text-xs font-bold text-text-secondary mb-2">
          ═══ 듀얼 토너먼트 ═══
        </div>
        <div className="space-y-1">
          {allMatches.map(({ match, suffix }) => {
            const info = MATCH_INFO[suffix] || { label: '???', color: 'text-text-secondary' };
            const isPlayed = match.played;
            const isNext = nextMatch?.id === match.id;
            const hasParticipants = match.participant1 && match.participant2;
            const p1Name = match.participant1 ? getParticipantName(match.participant1) : '???';
            const p2Name = match.participant2 ? getParticipantName(match.participant2) : '???';
            const isP1Player = match.participant1 ? isPlayerCard(match.participant1) : false;
            const isP2Player = match.participant2 ? isPlayerCard(match.participant2) : false;
            const isPlayerMatch = isP1Player || isP2Player;

            return (
              <div
                key={match.id}
                className={`
                  flex items-center justify-between text-xs py-1 px-2 rounded
                  ${isPlayerMatch ? 'bg-yellow-500/10' : ''}
                  ${isNext ? 'border border-yellow-500/30' : ''}
                  ${!hasParticipants ? 'opacity-40' : ''}
                `}
              >
                <span className={`w-14 font-bold ${info.color}`}>
                  {info.label}
                </span>
                <span className={`flex-1 text-center truncate ${isP1Player ? 'text-yellow-400 font-bold' : 'text-text-primary'}`}>
                  {p1Name}
                </span>
                <span className="text-text-secondary mx-1">vs</span>
                <span className={`flex-1 text-center truncate ${isP2Player ? 'text-yellow-400 font-bold' : 'text-text-primary'}`}>
                  {p2Name}
                </span>
                <span className={`w-20 text-right ${
                  isPlayed ? 'text-green-400' : isNext ? 'text-yellow-400' : 'text-text-secondary'
                }`}>
                  {isPlayed ? (
                    <>✓ {getParticipantName(match.winner!).slice(0, 4)}승</>
                  ) : isNext ? (
                    <>⚔️ 다음</>
                  ) : (
                    <>○ 대기</>
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
          듀얼토너먼트 흐름도 {showFlow ? '▲' : '▼'}
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
                matches={allMatches.map(m => m.match)}
                playerCardIds={playerCardIds}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 다음 경기 시작 버튼 */}
      {nextMatch && nextMatch.participant1 && nextMatch.participant2 && !group.isCompleted && (
        <div className="px-4 pb-4">
          <Button
            variant={isPlayerGroup ? 'primary' : 'secondary'}
            onClick={() => onStartMatch?.(nextMatch.id)}
            className="w-full"
          >
            ▶ 다음 경기: {getParticipantName(nextMatch.participant1)} vs {getParticipantName(nextMatch.participant2)}
          </Button>
        </div>
      )}

      {/* 조 완료 시 진출자 표시 */}
      {group.isCompleted && group.firstPlace && group.secondPlace && (
        <div className="px-4 pb-4 bg-green-500/10 border-t border-green-500/20">
          <div className="text-sm text-green-400 text-center py-2">
            {nextRoundName} 진출: {getParticipantName(group.firstPlace)}, {getParticipantName(group.secondPlace)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default GroupCard;

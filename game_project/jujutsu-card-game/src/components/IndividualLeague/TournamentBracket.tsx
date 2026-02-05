// ========================================
// 토너먼트 대진표 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import type { IndividualLeague, IndividualMatch, LeagueGroup } from '../../types';
import { Button } from '../UI/Button';

interface TournamentBracketProps {
  league: IndividualLeague;
  onClose: () => void;
}

export function TournamentBracket({ league, onClose }: TournamentBracketProps) {
  const { brackets, participants, status } = league;

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

  // 매치 결과 아이콘
  const getMatchResultIcon = (match: IndividualMatch, participantId: string) => {
    if (!match.played) return '';
    if (match.winner === participantId) return '⭕';
    return '❌';
  };

  // 매치 렌더링
  const renderMatch = (match: IndividualMatch, label?: string) => {
    const p1Name = getParticipantName(match.participant1);
    const p2Name = getParticipantName(match.participant2);
    const isP1Player = isPlayerCard(match.participant1);
    const isP2Player = isPlayerCard(match.participant2);

    return (
      <div className="bg-bg-primary/50 rounded-lg p-2 text-sm min-w-[140px]">
        {label && (
          <div className="text-xs text-text-secondary mb-1 text-center">{label}</div>
        )}
        <div className={`flex items-center gap-1 ${isP1Player ? 'text-accent' : 'text-text-primary'}`}>
          {isP1Player && <span className="text-xs">🌟</span>}
          <span className={match.winner === match.participant1 ? 'font-bold' : ''}>
            {p1Name}
          </span>
          <span className="ml-auto">{getMatchResultIcon(match, match.participant1)}</span>
        </div>
        <div className="text-xs text-text-secondary text-center">vs</div>
        <div className={`flex items-center gap-1 ${isP2Player ? 'text-accent' : 'text-text-primary'}`}>
          {isP2Player && <span className="text-xs">🌟</span>}
          <span className={match.winner === match.participant2 ? 'font-bold' : ''}>
            {p2Name}
          </span>
          <span className="ml-auto">{getMatchResultIcon(match, match.participant2)}</span>
        </div>
        {match.played && (
          <div className="text-xs text-center text-text-secondary mt-1">
            {match.score.p1} - {match.score.p2}
          </div>
        )}
      </div>
    );
  };

  // 조별 결과 렌더링
  const renderGroup = (group: LeagueGroup) => {
    const p1Name = group.participants[0] ? getParticipantName(group.participants[0]) : '?';
    const p2Name = group.participants[1] ? getParticipantName(group.participants[1]) : '?';
    const isP1Player = group.participants[0] && isPlayerCard(group.participants[0]);
    const isP2Player = group.participants[1] && isPlayerCard(group.participants[1]);
    const p1Wins = group.participants[0] ? (group.winsCount[group.participants[0]] || 0) : 0;
    const p2Wins = group.participants[1] ? (group.winsCount[group.participants[1]] || 0) : 0;

    return (
      <div className="bg-bg-primary/50 rounded-lg p-2 text-sm min-w-[100px]">
        <div className="text-xs text-text-secondary mb-1 text-center">{group.id}조</div>
        <div className={`flex items-center gap-1 ${isP1Player ? 'text-accent' : 'text-text-primary'}`}>
          {isP1Player && <span className="text-xs">🌟</span>}
          <span className={group.winner === group.participants[0] ? 'font-bold text-green-400' : ''}>
            {p1Name}
          </span>
          <span className="ml-auto text-xs">{p1Wins}승</span>
        </div>
        <div className={`flex items-center gap-1 ${isP2Player ? 'text-accent' : 'text-text-primary'}`}>
          {isP2Player && <span className="text-xs">🌟</span>}
          <span className={group.winner === group.participants[1] ? 'font-bold text-green-400' : ''}>
            {p2Name}
          </span>
          <span className="ml-auto text-xs">{p2Wins}승</span>
        </div>
      </div>
    );
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
        className="bg-bg-primary rounded-xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xl font-bold text-text-primary">
            📋 토너먼트 대진표
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* 범례 */}
        <div className="px-4 py-2 bg-bg-secondary/50 text-xs text-text-secondary flex items-center gap-4">
          <span><span className="text-accent">🌟</span> = 내 카드</span>
          <span>⭕ = 승리</span>
          <span>❌ = 패배</span>
        </div>

        {/* 대진표 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary">
            <span className={status === 'ROUND_32' ? 'text-accent font-bold' : ''}>32강</span>
            <span>→</span>
            <span className={status === 'ROUND_16' ? 'text-accent font-bold' : ''}>16강</span>
            <span>→</span>
            <span className={status === 'QUARTER' ? 'text-accent font-bold' : ''}>8강</span>
            <span>→</span>
            <span className={status === 'SEMI' ? 'text-accent font-bold' : ''}>4강</span>
            <span>→</span>
            <span className={status === 'FINAL' || status === 'FINISHED' ? 'text-accent font-bold' : ''}>결승</span>
          </div>

          {/* 32강 */}
          <div className="mb-6">
            <div className="text-sm font-bold text-text-primary mb-2">── 32강 ──</div>
            <div className="grid grid-cols-4 gap-2">
              {brackets.round32.slice(0, 8).map((match, idx) => (
                <div key={match.id}>
                  {renderMatch(match, `경기 ${idx + 1}`)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {brackets.round32.slice(8, 16).map((match, idx) => (
                <div key={match.id}>
                  {renderMatch(match, `경기 ${idx + 9}`)}
                </div>
              ))}
            </div>
          </div>

          {/* 16강 조별 */}
          {brackets.round16.some(g => g.participants.length > 0) && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 16강 (조별 2선승) ──</div>
              <div className="grid grid-cols-4 gap-2">
                {brackets.round16.slice(0, 4).map(group => (
                  <div key={group.id}>{renderGroup(group)}</div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {brackets.round16.slice(4, 8).map(group => (
                  <div key={group.id}>{renderGroup(group)}</div>
                ))}
              </div>
            </div>
          )}

          {/* 8강 */}
          {brackets.quarter.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 8강 ──</div>
              <div className="grid grid-cols-4 gap-2">
                {brackets.quarter.map((match, idx) => (
                  <div key={match.id}>{renderMatch(match, `경기 ${idx + 1}`)}</div>
                ))}
              </div>
            </div>
          )}

          {/* 4강 */}
          {brackets.semi.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 4강 ──</div>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {brackets.semi.map((match, idx) => (
                  <div key={match.id}>{renderMatch(match, `경기 ${idx + 1}`)}</div>
                ))}
              </div>
            </div>
          )}

          {/* 결승 */}
          {brackets.final && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 결승 ──</div>
              <div className="max-w-[200px]">
                {renderMatch(brackets.final, '결승전')}
              </div>
            </div>
          )}

          {/* 챔피언 */}
          {league.champion && (
            <div className="text-center mt-4">
              <div className="text-2xl">🏆</div>
              <div className="text-lg font-bold text-yellow-400">
                챔피언: {getParticipantName(league.champion)}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TournamentBracket;

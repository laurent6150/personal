// ========================================
// 토너먼트 대진표 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import type { IndividualLeague, IndividualMatch, DualTournamentGroup } from '../../types';
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
    if (!odId) return '??';
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko || '???';
  };

  // 플레이어 카드 여부
  const isPlayerCard = (odId: string) => odId && playerCardIds.includes(odId);

  // 매치 결과 아이콘
  const getMatchResultIcon = (match: IndividualMatch, participantId: string) => {
    if (!match.played) return '';
    if (match.winner === participantId) return '⭕';
    return '❌';
  };

  // 매치 렌더링
  const renderMatch = (match: IndividualMatch, label?: string) => {
    const p1Name = match.participant1 ? getParticipantName(match.participant1) : '(대기)';
    const p2Name = match.participant2 ? getParticipantName(match.participant2) : '(대기)';
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

  // 듀얼 토너먼트 조 렌더링
  const renderDualGroup = (group: DualTournamentGroup) => {
    const rankLabels = [
      { place: group.firstPlace, label: '1위', color: 'text-yellow-400' },
      { place: group.secondPlace, label: '2위', color: 'text-gray-300' },
      { place: group.thirdPlace, label: '3위', color: 'text-red-400' },
      { place: group.fourthPlace, label: '4위', color: 'text-red-400' },
    ];

    const matchLabels: { key: keyof typeof group.matches; label: string; color: string }[] = [
      { key: 'match1', label: '1차', color: 'text-text-secondary' },
      { key: 'match2', label: '2차', color: 'text-text-secondary' },
      { key: 'winnersMatch', label: '승자', color: 'text-blue-400' },
      { key: 'losersMatch', label: '패자', color: 'text-red-400' },
      { key: 'finalMatch', label: '최종', color: 'text-purple-400' },
    ];

    const completedCount = matchLabels.filter(ml => group.matches[ml.key].played).length;

    return (
      <div className="bg-bg-primary/50 rounded-lg p-2 text-xs min-w-[130px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-secondary font-bold">{group.id}조</span>
          <span className={`${group.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
            {completedCount}/5
          </span>
        </div>

        {/* 참가자 순위 */}
        {group.isCompleted ? (
          <div className="space-y-0.5">
            {rankLabels.map(({ place, label, color }) => (
              place && (
                <div key={label} className={`flex items-center gap-1 ${isPlayerCard(place) ? 'text-accent' : color}`}>
                  {isPlayerCard(place) && <span>🌟</span>}
                  <span className="font-bold">{label}</span>
                  <span>{getParticipantName(place)}</span>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* 경기 진행 상태 */}
            {matchLabels.map(({ key, label, color }) => {
              const match = group.matches[key];
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className={color}>{label}</span>
                  {match.played ? (
                    <span className="text-green-400 text-[10px]">
                      {getParticipantName(match.winner || '')} 승
                    </span>
                  ) : match.participant1 && match.participant2 ? (
                    <span className="text-yellow-400 text-[10px]">대기</span>
                  ) : (
                    <span className="text-text-secondary text-[10px]">-</span>
                  )}
                </div>
              );
            })}
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
            <span className={status === 'ROUND_64' ? 'text-accent font-bold' : ''}>64강</span>
            <span>→</span>
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

          {/* 64강 듀얼 토너먼트 */}
          {brackets.round64Groups && brackets.round64Groups.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 64강 (듀얼 토너먼트 16조) ──</div>
              <div className="grid grid-cols-4 gap-2">
                {brackets.round64Groups.slice(0, 8).map(group => (
                  <div key={group.id}>{renderDualGroup(group)}</div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {brackets.round64Groups.slice(8, 16).map(group => (
                  <div key={group.id}>{renderDualGroup(group)}</div>
                ))}
              </div>
            </div>
          )}

          {/* 32강 듀얼 토너먼트 */}
          {brackets.round32Groups && brackets.round32Groups.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 32강 (듀얼 토너먼트 8조) ──</div>
              <div className="grid grid-cols-4 gap-2">
                {brackets.round32Groups.slice(0, 4).map(group => (
                  <div key={group.id}>{renderDualGroup(group)}</div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {brackets.round32Groups.slice(4, 8).map(group => (
                  <div key={group.id}>{renderDualGroup(group)}</div>
                ))}
              </div>
            </div>
          )}

          {/* 16강 */}
          {brackets.round16Matches && brackets.round16Matches.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-bold text-text-primary mb-2">── 16강 ──</div>
              <div className="grid grid-cols-4 gap-2">
                {brackets.round16Matches.slice(0, 4).map((match, idx) => (
                  <div key={match.id}>{renderMatch(match, `경기 ${idx + 1}`)}</div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {brackets.round16Matches.slice(4, 8).map((match, idx) => (
                  <div key={match.id}>{renderMatch(match, `경기 ${idx + 5}`)}</div>
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

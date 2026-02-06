// ========================================
// 16강~결승 토너먼트 메인 뷰 (Phase 3)
// 카드형 UI 적용
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { IndividualMatch, LeagueParticipant, Stats } from '../../types';
import { Button } from '../UI/Button';

interface TournamentMainViewProps {
  stage: 'ROUND_16' | 'QUARTER' | 'SEMI' | 'FINAL';
  matches: IndividualMatch[];
  participants: LeagueParticipant[];
  playerCardIds: string[];
  onStartMatch: (matchId: string) => void;
  onSkipAll: () => void;
  onNextRound: () => void;
  onViewBracket: () => void;
  isRoundComplete: boolean;
}

// 라운드 이름 가져오기
const getStageName = (stage: string): string => {
  switch (stage) {
    case 'ROUND_16': return '16강 토너먼트';
    case 'QUARTER': return '8강';
    case 'SEMI': return '4강';
    case 'FINAL': return '결승 / 3위 결정전';
    default: return stage;
  }
};

// 포맷 텍스트 가져오기
const getFormatText = (stage: string): string => {
  switch (stage) {
    case 'ROUND_16': return '3판 2선승';
    case 'QUARTER': return '3판 2선승';
    case 'SEMI': return '5판 3선승';
    case 'FINAL': return '5판 3선승';
    default: return '단판';
  }
};

// 매치 카드 컴포넌트
function TournamentMatchCard({
  match,
  matchNumber,
  participants,
  playerCardIds,
  isNext,
  onStart
}: {
  match: IndividualMatch;
  matchNumber: number;
  participants: LeagueParticipant[];
  playerCardIds: string[];
  isNext: boolean;
  onStart?: () => void;
}) {
  const [expanded, setExpanded] = useState(isNext);

  const p1 = participants.find(p => p.odId === match.participant1);
  const p2 = participants.find(p => p.odId === match.participant2);
  const card1 = CHARACTERS_BY_ID[match.participant1];
  const card2 = CHARACTERS_BY_ID[match.participant2];

  const isPlayerMatch = playerCardIds.includes(match.participant1) ||
                        playerCardIds.includes(match.participant2);

  // 경기 상태 아이콘
  const getStatusIcon = () => {
    if (match.played) return '✓';
    if (isNext) return '⚔️';
    return '○';
  };

  const getStatusText = () => {
    if (match.played) {
      const winnerName = match.winner === match.participant1
        ? card1?.name.ko
        : card2?.name.ko;
      return `${winnerName} 승리`;
    }
    if (isNext) return '다음 경기';
    return '대기';
  };

  // 총합 스탯 계산
  const getTotalStats = (card: typeof card1): number => {
    if (!card) return 0;
    const stats = card.baseStats;
    return (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0) +
           (stats.hp || 0) + (stats.ce || 0) +
           ((stats as Stats).crt || 50) + ((stats as Stats).tec || 50) + ((stats as Stats).mnt || 50);
  };

  // 접힌 상태
  if (!expanded && !isNext) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-bg-secondary rounded-lg border p-3 mb-2 cursor-pointer
          ${match.played ? 'border-green-500/30' : 'border-white/10'}
          ${isPlayerMatch ? 'border-yellow-400/50' : ''}
          hover:bg-bg-secondary/80
        `}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-sm">경기 {matchNumber}</span>
            <span className="text-text-primary">
              {isPlayerMatch && <span className="text-yellow-400">⭐ </span>}
              {card1?.name.ko || '???'} vs {card2?.name.ko || '???'}
            </span>
          </div>
          <span className={`
            text-sm
            ${match.played ? 'text-green-400' : isNext ? 'text-yellow-400' : 'text-text-secondary'}
          `}>
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>
      </motion.div>
    );
  }

  // 확장된 상태 (카드형)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-bg-secondary rounded-xl border-2 p-4 mb-4
        ${isNext ? 'border-yellow-500/50' : match.played ? 'border-green-500/30' : 'border-white/10'}
        ${isPlayerMatch ? 'ring-2 ring-yellow-400/30' : ''}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary">경기 {matchNumber}</span>
          {isPlayerMatch && <span className="text-yellow-400 text-sm">⭐ 내 카드</span>}
        </div>
        <span className={`
          px-3 py-1 rounded-full text-sm font-bold
          ${isNext ? 'bg-yellow-500/20 text-yellow-400' :
            match.played ? 'bg-green-500/20 text-green-400' :
            'bg-gray-500/20 text-gray-400'}
        `}>
          {getStatusIcon()} {getStatusText()}
        </span>
      </div>

      {/* 선수 카드 */}
      <div className="flex items-center justify-between gap-4">
        {/* P1 */}
        <div className={`
          flex-1 text-center p-3 rounded-lg
          ${match.played && match.winner === match.participant1 ? 'bg-green-500/10 border border-green-500/30' : 'bg-bg-primary/50'}
        `}>
          <div className={`
            w-24 h-24 mx-auto rounded-xl overflow-hidden mb-2
            ${playerCardIds.includes(match.participant1) ? 'border-2 border-yellow-400' : 'border border-white/20'}
          `}>
            {card1 && (
              <img
                src={getCharacterImage(card1.id, card1.name.ko, card1.attribute)}
                alt={card1.name.ko}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="font-bold text-white text-sm">
            {playerCardIds.includes(match.participant1) && <span className="text-yellow-400">⭐ </span>}
            {card1?.name.ko || '???'}
          </div>
          <div className="text-xs text-text-secondary">{p1?.crewName || '???'}</div>
          <div className="text-xs text-accent">{card1?.grade || '???'}</div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
            <div>ATK: <span className="text-red-400">{card1?.baseStats.atk || 0}</span></div>
            <div>DEF: <span className="text-blue-400">{card1?.baseStats.def || 0}</span></div>
            <div>SPD: <span className="text-yellow-400">{card1?.baseStats.spd || 0}</span></div>
            <div>HP: <span className="text-green-400">{card1?.baseStats.hp || 0}</span></div>
          </div>
          <div className="mt-1 text-xs text-text-secondary">
            총합: <span className="text-white font-bold">{getTotalStats(card1)}</span>
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-white">VS</div>
          {match.played && match.score && (
            <div className="text-lg text-text-secondary">
              {match.score.p1} : {match.score.p2}
            </div>
          )}
        </div>

        {/* P2 */}
        <div className={`
          flex-1 text-center p-3 rounded-lg
          ${match.played && match.winner === match.participant2 ? 'bg-green-500/10 border border-green-500/30' : 'bg-bg-primary/50'}
        `}>
          <div className={`
            w-24 h-24 mx-auto rounded-xl overflow-hidden mb-2
            ${playerCardIds.includes(match.participant2) ? 'border-2 border-yellow-400' : 'border border-white/20'}
          `}>
            {card2 && (
              <img
                src={getCharacterImage(card2.id, card2.name.ko, card2.attribute)}
                alt={card2.name.ko}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="font-bold text-white text-sm">
            {playerCardIds.includes(match.participant2) && <span className="text-yellow-400">⭐ </span>}
            {card2?.name.ko || '???'}
          </div>
          <div className="text-xs text-text-secondary">{p2?.crewName || '???'}</div>
          <div className="text-xs text-accent">{card2?.grade || '???'}</div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
            <div>ATK: <span className="text-red-400">{card2?.baseStats.atk || 0}</span></div>
            <div>DEF: <span className="text-blue-400">{card2?.baseStats.def || 0}</span></div>
            <div>SPD: <span className="text-yellow-400">{card2?.baseStats.spd || 0}</span></div>
            <div>HP: <span className="text-green-400">{card2?.baseStats.hp || 0}</span></div>
          </div>
          <div className="mt-1 text-xs text-text-secondary">
            총합: <span className="text-white font-bold">{getTotalStats(card2)}</span>
          </div>
        </div>
      </div>

      {/* 경기 시작 버튼 */}
      {isNext && onStart && !match.played && (
        <div className="mt-4 text-center">
          <Button variant="primary" onClick={onStart} className="px-8">
            ▶ 경기 시작
          </Button>
        </div>
      )}

      {/* 접기 버튼 */}
      {!isNext && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-2 w-full text-center text-xs text-text-secondary hover:text-text-primary"
        >
          ▲ 접기
        </button>
      )}
    </motion.div>
  );
}

export function TournamentMainView({
  stage,
  matches,
  participants,
  playerCardIds,
  onStartMatch,
  onSkipAll,
  onNextRound,
  onViewBracket,
  isRoundComplete
}: TournamentMainViewProps) {
  // 다음 경기 찾기
  const nextMatch = matches.find(m => !m.played);
  const completedMatches = matches.filter(m => m.played);

  // 진행률 계산
  const totalMatches = matches.length;
  const completedCount = completedMatches.length;
  const progressPercent = totalMatches > 0 ? (completedCount / totalMatches) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 진행 상황 바 */}
      <div className="bg-bg-secondary rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-accent">
            {getStageName(stage)}
          </span>
          <span className="text-sm text-text-secondary">
            {completedCount}/{totalMatches} 경기 완료 ({Math.round(progressPercent)}%)
          </span>
        </div>
        <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-accent to-green-500"
          />
        </div>
        <div className="mt-2 text-xs text-text-secondary text-center">
          포맷: {getFormatText(stage)}
        </div>
      </div>

      {/* 경기 목록 */}
      <div className="space-y-2">
        {matches.map((match, index) => (
          <TournamentMatchCard
            key={match.id}
            match={match}
            matchNumber={index + 1}
            participants={participants}
            playerCardIds={playerCardIds}
            isNext={match === nextMatch}
            onStart={match === nextMatch ? () => onStartMatch(match.id) : undefined}
          />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onViewBracket}>
          🏆 토너먼트 대진표
        </Button>

        {!isRoundComplete && (
          <Button variant="secondary" onClick={onSkipAll}>
            ⏭️ 모든 경기 스킵
          </Button>
        )}

        {isRoundComplete && (
          <Button variant="primary" onClick={onNextRound}>
            ➡️ 다음 라운드
          </Button>
        )}
      </div>

      {/* 범례 */}
      <div className="text-center text-xs text-text-secondary">
        <span className="mr-3">⭐ 내 카드</span>
        <span className="mr-3">✓ 완료</span>
        <span className="mr-3">⚔️ 다음 경기</span>
        <span>○ 대기</span>
      </div>
    </div>
  );
}

export default TournamentMainView;
